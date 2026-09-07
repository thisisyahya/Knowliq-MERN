
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
        error: "No test is pending for this user." 
      });
    }



    // 2. Extract allowed topics and the started_at timestamp
    const allowedTopics = workspace.currentTopics ? workspace.currentTopics.map((m) => m.topic) : [];
    const startedAt = workspace.currentTopics?.[0]?.started_at;

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
                "evaluation_criteria", 
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

      const INPUT_RATE_PER_MILLION = 0.15;
      const OUTPUT_RATE_PER_MILLION = 0.60;

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

    // Remove any previous abandoned pending tests for this user/subject to avoid conflicts
    await Test.deleteMany({ user: user._id, subject: subject.trim(), status: 'pending' });

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

    // 2. Fetch User & Workspace
    console.log("in /submit-test : fetching user and workspace...");
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: "false", error: "User not found" });
    }

    // --- SAFETY CHECK ---
    if (user.test_pending !== true) {
      console.log("in /submit-test : safety check failed - test_pending is false");
      return res.status(403).json({ 
        success: "false", 
        error: "No test is pending for this user." 
      });
    }

    const workspace = await Workspace.findOne({ owner: user._id, subject: subject.trim() });
    if (!workspace) {
      return res.status(404).json({ success: "false", error: "Workspace not found" });
    }

    // FETCH THE PENDING TEST FROM DB
    const pendingTest = await Test.findOne({ user: user._id, subject: subject.trim(), status: 'pending' });
    if (!pendingTest) {
      return res.status(404).json({ success: "false", error: "No pending test found to submit." });
    }

    // 3. Extract exact active subtopics (since user.currentTopics stores subtopic names)
    const activeSubtopics = user.currentTopics ? user.currentTopics.map((m) => m.topic) : [];
    
    // 4. Combine Questions with Student Submissions for the AI context
    const testAndSubmissions = pendingTest.questions.map((q) => {
      const studentSub = submissions.find((s) => s.question_id === q.question_id);
      return {
        question_id: q.question_id,
        question_text: q.text,
        options: q.options,
        correct_option: q.correct_option, // Ground truth for the AI to grade against
        target_topics: q.target_topics,
        student_answer: studentSub ? studentSub.answer : "NO ANSWER PROVIDED"
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

    // 5. Call OpenAI (gpt-4o-mini) with Structured Outputs
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

    // 6. Token & Cost Logging
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

    // 8. Update MongoDB Workspace Document Manually
    if (updates.length > 0) {
      console.log("in /submit-test : manually scanning workspace to update subtopic retention status...");
      
      let isModified = false;

      updates.forEach((update) => {
        // Robust Matching: Trim and lowercase to prevent minor string mismatches
        const targetSubtopic = update.subtopic_name.trim().toLowerCase();

        // Iterate through all parent topics in the workspace
        for (const topicDoc of workspace.detailedTopics) {
          if (Array.isArray(topicDoc.subtopics)) {
            // Check if the subtopic exists under this parent topic
            const subtopicDoc = topicDoc.subtopics.find(
              st => st.name.trim().toLowerCase() === targetSubtopic
            );
            
            if (subtopicDoc) {
              // Found it! Apply the updates
              subtopicDoc.retention = update.retention;
              subtopicDoc.remarks = update.remarks;
              subtopicDoc.last_learned_at = new Date();
              isModified = true;
              
              // Break out of the inner loop since we found and updated the target subtopic
              break; 
            }
          }
        }
      });

      // Save the document if changes were made
      if (isModified) {
        workspace.markModified('detailedTopics'); // Explicitly tell mongoose the nested array changed
        await workspace.save();
        console.log("in /submit-test : workspace scores successfully updated and saved.");
      } else {
        console.log("in /submit-test : no matching subtopics found in the workspace to update.");
      }
    }

    // 9. Update and save the actual Test document
    if (updates.length > 0) {
      console.log("in /submit-test : saving user answers and AI evaluations to Test document...");
      
      // Format submissions to match answerSchema
      pendingTest.answers = submissions.map(sub => ({
        question_id: sub.question_id,
        answer_text: sub.answer || ""
      }));

      // Format AI updates to match evaluationSchema
      pendingTest.evaluations = updates.map(up => ({
        subtopic_name: up.subtopic_name,
        remarks: up.remarks,
        retention: up.retention
      }));

      // Mark test as graded
      pendingTest.status = 'graded';
      await pendingTest.save();
      console.log("in /submit-test : Test document saved successfully.");
    }

    // 10. Clear the pending test flag from the user
    user.test_pending = false;
    user.currentTopics = [];
    await user.save();

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


module.exports = router;