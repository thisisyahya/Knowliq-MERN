
require("dotenv").config();
var express = require('express');
var router = express.Router();


const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs").promises;
const path = require("path");
const verifyLogin = require("../middlewares/verifyLogin.js");
// Use Capitalized name for Mongoose models by convention
const PastPaper = require("../models/PastPaper.js");
const User = require('../models/User');
const Workspace = require("../models/Workspace");
const Chat = require("../models/Chat.js");
const Test = require("../models/Test"); // Adjust path if necessary
// const pdfPoppler = require("pdf-poppler");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



router.post("/make-test", verifyLogin, async (req, res) => {
  try {
    console.log("in /make-test : route hit, generating test...");

    const { uid } = req;
    const { subject } = req.body;

    if (!subject) {
      console.log("in /make-test : validation failed - missing subject");
      return res.status(400).json({ success: "false", error: "Subject is required" });
    }

    // 1. Fetch User & Workspace
    console.log("in /make-test : fetching user and workspace...");
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: "false", error: "User not found" });
    }

        const workspace = await Workspace.findOne({ owner: user._id, subject: subject.trim() });
    if (!workspace) {
      return res.status(404).json({ success: "false", error: "Workspace not found" });
    }


    // --- SAFETY CHECK ---
    if (workspace.test_pending !== true) {
      console.log("in /make-test : safety check failed - test_pending is false");
      return res.status(403).json({ 
        success: "false", 
        error: "No test is pending for this workspace." 
      });
    }


    // --- CHECK FOR EXISTING PENDING TEST ---
    const existingTest = await Test.findOne({
      user: user._id,
      subject: subject.trim(),
      status: 'pending'
    });

    if (existingTest) {
      console.log("in /make-test : existing pending test found, returning from db...");
      return res.status(200).json({
        success: "true",
        test_id: existingTest._id,
        questions: existingTest.questions,
      });
    }



    // 2. Extract allowed topics and the started_at timestamp
    const allowedTopics = workspace.currentFocus ? workspace.currentFocus.map((m) => m.topic) : [];
    const startedAt = workspace.currentFocus?.[0]?.started_at;

    // 3. Query chats created on or after started_at
    console.log("in /make-test : querying recent chats...");
    const chats = await Chat.find(
      {
        user: user._id,
        subject: subject,
        ...(startedAt && { date: { $gte: startedAt } }),
      },
      {
        query: 1,
        answer: 1,
        _id: 0,
      }
    )
      .sort({ date: 1 })
      .limit(100);

    // 4. STEP 1: Summarize chat history into pure text (no JSON)
    let chatSummaryText = "No recent study chat history available.";

    if (chats.length > 0) {
      console.log(`in /make-test : summarizing ${chats.length} chat interactions...`);
      const conversationText = chats
        .map((c, i) => `Turn ${i + 1}:\nStudent Question: ${c.query}\nAssistant Answer: ${c.answer}`)
        .join("\n\n");

      const summaryCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an academic analysis assistant. Summarize the student's conversation history regarding "${subject}". Focus on concepts discussed, areas where the student had confusion or gaps, and their general level of understanding. Return your summary as pure, concise plain text with NO JSON formatting, NO markdown fences, and NO bullet lists.`,
          },
          {
            role: "user",
            content: `Student Chat History:\n\n${conversationText}`,
          },
        ],
      });

      chatSummaryText = summaryCompletion.choices[0].message.content.trim();
    }

    // 5. STEP 2: Generate Structured Test Questions (5 to 9 questions)
    console.log("in /make-test : sending request to OpenAI for structured test generation...");

    const systemPrompt = `You are an expert academic examiner designing a rigorous diagnostic test for the subject: "${subject}".

STRICT TOPIC CONSTRAINT:
- You MUST ONLY create questions targeting topics from this list:
${JSON.stringify(allowedTopics, null, 2)}
- "target_topics" must match the exact string names from the list above.

DIAGNOSTIC & FORMATTING GUIDELINES:
1. QUESTION COUNT: Generate exactly 6 high-yield questions targeting gaps identified in the student's study summary.
2. QUESTION TYPE ROUTING (NUMERICAL VS THEORETICAL):
   - IF the subject/topic is Engineering or heavily Math-based AND the chat history indicates numerical problem-solving: Generate numerical MCQs. Since users cannot easily type complex math, provide the final numerical answers in the 4 multiple-choice options, AND provide a specific "reasoning_prompt" asking them to briefly explain their formula/steps.
   - IF the subject/topic is Theoretical: Skip numerical calculations completely. Generate deep conceptual MCQs. For theoretical MCQs, set the "reasoning_prompt" strictly to null.
4. DISTRACTORS: All 3 incorrect options must be realistic and reflect common student misconceptions.
5. LATEX: Format math/science variables strictly using standard LaTeX ($...$).`;

const completion = await openai.chat.completions.create({
  model: "gpt-5.6-luna",
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "test_generation",
      strict: true,
      schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            description: "Array of diagnostic test questions.",
            items: {
              type: "object",
              properties: {
                question_id: { 
                  type: "integer" 
                },
                text: { 
                  type: "string", 
                  description: "The main diagnostic question." 
                },
                options: {
                  type: "array",
                  items: { type: "string" },
                  description: "Exactly 4 options."
                },
                correct_option: { 
                  type: "string", 
                  description: "The exact string verbatim of the correct option from the options array." 
                },
                reasoning_prompt: {
                  type: ["string", "null"],
                  description: "Prompt asking the user to explain their math/steps for numerical questions. MUST be null for theoretical questions."
                },
               
                target_topics: {
                  type: "array",
                  items: { type: "string" },
                  description: "Exact topic names evaluated from the allowed list."
                }
              },
              required: [
                "question_id", 
                "text", 
                "options", 
                "correct_option", 
                "reasoning_prompt", 
                "target_topics"
              ],
              additionalProperties: false
            }
          }
        },
        required: ["questions"],
        additionalProperties: false
      }
    }
  },
  messages: [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Allowed Topics:\n${JSON.stringify(allowedTopics, null, 2)}\n\nRecent Study History Summary:\n${chatSummaryText}`
    }
  ]
});

    // 6. Token & Cost Logging
    if (completion.usage) {
      const inputTokens = completion.usage.prompt_tokens || 0;
      const outputTokens = completion.usage.completion_tokens || 0;
      const totalTokens = completion.usage.total_tokens || inputTokens + outputTokens;

      const INPUT_RATE_PER_MILLION = 0.20;
      const OUTPUT_RATE_PER_MILLION = 1.20;

      const estimatedInputCost = (inputTokens / 1_000_000) * INPUT_RATE_PER_MILLION;
      const estimatedOutputCost = (outputTokens / 1_000_000) * OUTPUT_RATE_PER_MILLION;
      const totalCost = (estimatedInputCost + estimatedOutputCost).toFixed(6);

      console.log(`in /make-test : --- USAGE SUMMARY ---`);
      console.log(`in /make-test : Input Tokens:  ${inputTokens}`);
      console.log(`in /make-test : Output Tokens: ${outputTokens}`);
      console.log(`in /make-test : Total Tokens:  ${totalTokens}`);
      console.log(`in /make-test : Estimated Cost: $${totalCost} USD`);
      console.log(`in /make-test : -----------------------`);
    }

    // 7. Parse, Save to Database, and Return
    const parsedResponse = JSON.parse(completion.choices[0].message.content);
    console.log(`in /make-test : successfully generated ${parsedResponse.questions.length} questions.`);

  
    // Save the new test to the database
    const newTest = new Test({
      user: user._id,
      subject: subject.trim(),
      status: 'pending',
      questions: parsedResponse.questions
    });
    await newTest.save();

    return res.status(200).json({
      success: "true",
      test_id: newTest._id,
      questions: parsedResponse.questions,
    });

  } catch (error) {
    console.error("in /make-test : CRITICAL ERROR:", error);
    return res.status(500).json({
      success: "false",
      error: "Failed to generate test. Internal server error.",
    });
  }
});



router.post("/submit-test", verifyLogin, async (req, res) => {
  try {
    console.log("in /submit-test : route hit, grading test...");

    const { uid } = req;
    const { subject, submissions } = req.body;

    // 1. Input Validation
    if (!subject) {
      console.log("in /submit-test : validation failed - missing subject");
      return res.status(400).json({ success: "false", error: "Subject is required" });
    }

    if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
      console.log("in /submit-test : validation failed - missing or invalid submissions");
      return res.status(400).json({ success: "false", error: "Submissions array is required" });
    }

    // 2. Fetch User
    console.log("in /submit-test : fetching user and workspace...");
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: "false", error: "User not found" });
    }

    // 3. Fetch Workspace (Now that we have the user)
    const workspace = await Workspace.findOne({ owner: user._id, subject: subject.trim() });
    if (!workspace) {
      return res.status(404).json({ success: "false", error: "Workspace not found" });
    }

    // --- SAFETY CHECK ---
    if (workspace.test_pending !== true) {
      console.log("in /submit-test : safety check failed - test_pending is false");
      return res.status(403).json({ 
        success: "false", 
        error: "No test is pending for this user." 
      });
    }

    // FETCH THE PENDING TEST FROM DB
    const pendingTest = await Test.findOne({ user: user._id, subject: subject.trim(), status: 'pending' });
    if (!pendingTest) {
      return res.status(404).json({ success: "false", error: "No pending test found to submit." });
    }

    // 4. Extract exact active subtopics
    const activeSubtopics = workspace.currentFocus ? workspace.currentFocus.map((m) => m.topic) : [];
    
   
    // 5. Combine Questions with Student Submissions for the AI context
    const sanitizedSubmissions = []; // We will use this in step 9

    const testAndSubmissions = pendingTest.questions.map((q) => {
      const studentSub = submissions.find((s) => s.question_id === q.question_id);
      
      let finalAnswer = "NO ANSWER PROVIDED";

      if (studentSub) {
        finalAnswer = studentSub.answer;
        
        // --- SECURITY CHECK ---
        // If there is no reasoning prompt, but the frontend somehow sent reasoning,
        // strip everything after "\nReasoning:" 
        if (!q.reasoning_prompt && finalAnswer.includes("\nReasoning:")) {
          finalAnswer = finalAnswer.split("\nReasoning:")[0].trim();
        }
      }

      // Save the sanitized answer for step 9
      sanitizedSubmissions.push({
        question_id: q.question_id,
        answer_text: finalAnswer
      });

      return {
        question_id: q.question_id,
        question_text: q.text,
        options: q.options,
        correct_option: q.correct_option, 
        target_topics: q.target_topics,
        student_answer: finalAnswer
      };
    });


    const evaluationPayload = JSON.stringify(testAndSubmissions, null, 2);

    const systemPrompt = `You are an objective, strict academic grading engine. Your task is to evaluate the student's test answers against the provided correct answers and assign a retention status (color) and actionable remarks for each evaluated subtopic.

### CALIBRATION BENCHMARKS FOR RETENTION:
- "green": Good to Best performance. Student selected the correct option and (if applicable) provided sound reasoning.
- "yellow": Satisfactory to Good. Understands the main idea, but perhaps struggled with the reasoning, or got partial concepts correct.
- "red": Poor performance. Selected the wrong option, displays partial understanding, fundamentally flawed reasoning, or left it blank.

### GRADING PROTOCOL:
1. Analyze the student's answer against the 'correct_option' and the 'question_text'.
2. Determine the retention color ("red", "yellow", or "green") based on the benchmarks for the specific 'target_topics' associated with that question.
3. Write actionable "remarks" explaining exactly what the student got right, what was incorrect, and how they need to improve this specific subtopic.
4. Output the exact "subtopic_name" STRICTLY chosen from the ALLOWED SUBTOPICS list provided. Do NOT invent or alter names.
5. Return ONLY a valid JSON object matching the strict schema.`;

    // 6. Call OpenAI (gpt-4o-mini)
    console.log("in /submit-test : sending request to OpenAI (gpt-4o-mini) for grading...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "test_grading",
          strict: true,
          schema: {
            type: "object",
            properties: {
              updated_subtopics: {
                type: "array",
                description: "List of evaluated subtopics with retention status and remarks.",
                items: {
                  type: "object",
                  properties: {
                    subtopic_name: { 
                      type: "string", 
                      description: "The exact name of the subtopic from the allowed list." 
                    },
                    remarks: {
                      type: "string",
                      description: "Statement explaining what needs improvement and how."
                    },
                    retention: { 
                      type: "string", 
                      enum: ["red", "yellow", "green"],
                      description: "The evaluated retention status (red, yellow, or green)." 
                    }
                  },
                  required: ["subtopic_name", "remarks", "retention"],
                  additionalProperties: false
                }
              }
            },
            required: ["updated_subtopics"],
            additionalProperties: false
          }
        }
      },
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `ALLOWED SUBTOPICS (Use ONLY these exact names):\n${JSON.stringify(activeSubtopics)}\n\nTest Data & Student Answers:\n${evaluationPayload}` 
        }
      ]
    });



    // 6.5. Token & Cost Logging (Restored)
    if (completion.usage) {
      const inputTokens = completion.usage.prompt_tokens || 0;
      const outputTokens = completion.usage.completion_tokens || 0;
      const totalTokens = completion.usage.total_tokens || (inputTokens + outputTokens);

      const INPUT_RATE_PER_MILLION = 0.15;
      const OUTPUT_RATE_PER_MILLION = 0.60;

      const estimatedInputCost = (inputTokens / 1_000_000) * INPUT_RATE_PER_MILLION;
      const estimatedOutputCost = (outputTokens / 1_000_000) * OUTPUT_RATE_PER_MILLION;
      const totalCost = (estimatedInputCost + estimatedOutputCost).toFixed(6);

      console.log(`in /submit-test : --- USAGE SUMMARY ---`);
      console.log(`in /submit-test : Input Tokens:  ${inputTokens}`);
      console.log(`in /submit-test : Output Tokens: ${outputTokens}`);
      console.log(`in /submit-test : Total Tokens:  ${totalTokens}`);
      console.log(`in /submit-test : Estimated Cost: $${totalCost} USD`);
      console.log(`in /submit-test : -----------------------`);
    }

    // 7. Parse AI Response
    const parsedResponse = JSON.parse(completion.choices[0].message.content);
    const updates = parsedResponse.updated_subtopics || [];
    console.log(`in /submit-test : AI evaluated ${updates.length} subtopics.`);

    // 8. Update MongoDB Workspace Document In-Memory
    if (updates.length > 0) {
      console.log("in /submit-test : scanning workspace to update subtopic retention status...");
      
      let isModified = false;

      updates.forEach((update) => {
        const targetSubtopic = update.subtopic_name.trim().toLowerCase();

        for (const topicDoc of workspace.detailedTopics) {
          if (Array.isArray(topicDoc.subtopics)) {
            const subtopicDoc = topicDoc.subtopics.find(
              st => st.name.trim().toLowerCase() === targetSubtopic
            );
            
            if (subtopicDoc) {
              subtopicDoc.retention = update.retention;
              subtopicDoc.remarks = update.remarks;
              subtopicDoc.last_learned_at = new Date();
              isModified = true;
              break; 
            }
          }
        }
      });

      if (isModified) {
        workspace.markModified('detailedTopics');
      }
    }

    // 9. Update the Test Document
   // 9. Update the Test Document
    if (updates.length > 0) {
      console.log("in /submit-test : saving user answers and AI evaluations to Test document...");
      
      // USE THE SANITIZED ANSWERS CREATED IN STEP 5
      pendingTest.answers = sanitizedSubmissions;

      pendingTest.evaluations = updates.map(up => ({
        subtopic_name: up.subtopic_name,
        remarks: up.remarks,
        retention: up.retention
      }));

      pendingTest.status = 'graded';
      await pendingTest.save();
    }

    // 10. Clear pending flags and run a SINGLE save on the workspace
    workspace.test_pending = false;
    workspace.currentFocus = [];
    workspace.currentFocusSummary = "";
    await workspace.save();
    console.log("in /submit-test : workspace state updated and saved successfully.");

    // 11. Return Response
    return res.status(200).json({
      success: "true",
      message: "Test graded and workspace updated successfully.",
      graded_results: updates
    });

  } catch (error) {
    console.error("in /submit-test : CRITICAL ERROR:", error);
    return res.status(500).json({ 
      success: "false", 
      error: "Failed to submit and grade test. Internal server error." 
    });
  }
});






// GET /test-stats - Fetch user test statistics & history
router.get("/test-stats", verifyLogin, async (req, res) => {
  try {
    const { uid } = req;
    const user = await User.findOne({ uid });
    
    if (!user) {
      return res.status(404).json({ success: "false", error: "User not found" });
    }

    // Fetch all completed/graded tests for this user, newest first
    const completedTests = await Test.find({ user: user._id, status: "graded" })
      .sort({ createdAt: -1 })
      .lean();

    let overallGreen = 0;
    let overallYellow = 0;
    let overallRed = 0;

    // Group tests by workspace (subject)
    const workspacesMap = {};

    completedTests.forEach((test) => {
      const subject = test.subject || "Unknown Subject";

      // Initialize workspace entry if it doesn't exist
      if (!workspacesMap[subject]) {
        workspacesMap[subject] = {
          subject,
          totalTestsTaken: 0,
          retentionSummary: { green: 0, yellow: 0, red: 0 },
          recentHistory: [],
        };
      }

      let testGreen = 0, testYellow = 0, testRed = 0;

      (test.evaluations || []).forEach((ev) => {
        if (ev.retention === "green") testGreen++;
        else if (ev.retention === "yellow") testYellow++;
        else if (ev.retention === "red") testRed++;
      });

      // Add to Workspace Specific Stats
      workspacesMap[subject].retentionSummary.green += testGreen;
      workspacesMap[subject].retentionSummary.yellow += testYellow;
      workspacesMap[subject].retentionSummary.red += testRed;
      workspacesMap[subject].totalTestsTaken += 1;
      
      workspacesMap[subject].recentHistory.push({
        test_id: test._id,
        subject: test.subject,
        date: test.createdAt,
        totalQuestions: test.questions?.length || 0,
        evaluations: test.evaluations || [],
      });

      // Add to Overall Global Stats
      overallGreen += testGreen;
      overallYellow += testYellow;
      overallRed += testRed;
    });

    const workspaces = Object.values(workspacesMap);

    return res.status(200).json({
      success: "true",
      stats: {
        overall: {
          totalTestsTaken: completedTests.length,
          retentionSummary: {
            green: overallGreen,
            yellow: overallYellow,
            red: overallRed,
          },
        },
        workspaces, // The grouped data array
      },
    });

  } catch (error) {
    console.error("Error in /test-stats :", error);
    return res.status(500).json({ success: "false", error: "Failed to fetch stats" });
  }
});

module.exports = router;