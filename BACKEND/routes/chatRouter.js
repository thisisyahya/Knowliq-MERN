require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");
const PastPaper = require("../models/PastPaper");
const Chat = require("../models/Chat");
const verifyLogin = require("../middlewares/verifyLogin");
const User = require("../models/User");
const Workspace = require("../models/Workspace");
const router = express.Router();

// const { checkRequiresGlobalContext } = require('../services/AI/CheckIntent');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ==========================================
// 1. MAIN ROUTE (CLEAN & READABLE)
// ==========================================
router.post("/chat", verifyLogin, async (req, res) => {
  try {
    console.log("in /chat : route hit, starting hybrid RAG chat processing...");

    const { uid } = req;
    const { selectedModel, subject, query } = req.body;

    // A. Input Validation & Model Mapping
    const targetModel = validateModel(selectedModel);
    if (!targetModel) {
      return res.status(400).json({ success: "false", error: `Invalid model selected: '${selectedModel}'. Allowed models are Astra, Stella, or Cosmos.` });
    }
    if (!query || !query.trim()) return res.status(400).json({ success: "false", error: "The 'query' field is required." });
    if (!subject || !subject.trim()) return res.status(400).json({ success: "false", error: "The 'subject' field is required." });

    // B. Fetch Data & Check Locks
    const user = await User.findOne({ uid });
    if (!user) return res.status(400).json({ success: "false", error: "User does not exist." });

    const workspace = await Workspace.findOne({ owner: user._id, subject: subject.trim() });
    if (!workspace) return res.status(404).json({ success: "false", error: "Workspace not found." });

    if (workspace.test_pending) {
      return res.status(403).json(getTestLockPayload(workspace, subject, user));
    }

    // C. Initialize Topics if empty
    let currentFocus = workspace.currentFocus || [];
    console.log(`in /chat : Received current-Focus from memory :`, JSON.stringify(currentFocus));

    if (!Array.isArray(currentFocus) || currentFocus.length === 0) {
      currentFocus = await fetchInitialTopics(workspace);
    }


    // D. Fetch Context
    const ragData = await fetchRagContext(query, user._id, subject.trim());

    // E. Route to correct LLM
    let aiData = { current_taught_subtopic: null, test_pending: false };

    const tutorResult = await callMainTutor(user, workspace, subject, query, ragData.text, currentFocus, targetModel);
    const finalAnswer = tutorResult.answer;
    aiData.current_taught_subtopic = tutorResult.subtopic;
    aiData.test_pending = tutorResult.test_pending;

    // F. Mutate State & Save
    const isTestPending = await updateWorkspaceState(user, workspace, currentFocus, aiData, subject);
    await saveChatHistory(user._id, subject, query, finalAnswer, ragData.vector);

    // G. Return Payload
    return res.status(200).json({
      success: "true",
      answer: finalAnswer,
      "current-topics": workspace.currentFocus,
      test_pending: isTestPending,
      chat_locked: user.chatLock || false
    });

  } catch (error) {
    console.error("in /chat : CRITICAL ERROR:", error);
    return res.status(500).json({ success: "false", error: "Internal server error." });
  }
});


// ==========================================
// 2. THE "MESSY" FUNCTIONS (BOTTOM HOISTED)
// ==========================================

function validateModel(selectedModel) {
  const MODEL_MAPPING = { astra: "gpt-4o-mini", stella: "gpt-5.6-luna", auto: "gpt-4o-mini" };
  return MODEL_MAPPING[selectedModel?.trim().toLowerCase()] || null;
}

function getTestLockPayload(workspace, subject, user) {
  return {
    success: "false",
    answer: `**Take Test Now, The chat is freezed till then.**\n\n[👉 Click here to start the test](/takeTest?subject=${encodeURIComponent(subject.trim())})`,
    "current-topics": workspace.currentFocus || [],
    test_pending: true,
    chat_locked: user.chatLock || false
  };
}

async function fetchInitialTopics(workspace) {
  console.log("in /chat : Initializing new session topics via gpt-4o-mini...");
  const now = new Date();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const categorizedSubtopics = [];

  workspace.detailedTopics.forEach((parent) => {
    if (!Array.isArray(parent.subtopics)) return;
    parent.subtopics.forEach((st) => {
      let isOverdue = false;
      let daysSinceLast = null;

      if (st.last_learned_at) {
        const lastLearned = new Date(st.last_learned_at);
        daysSinceLast = (now - lastLearned) / ONE_DAY_MS;

        if (st.retention === 'red' && daysSinceLast >= 1) isOverdue = true;
        else if (st.retention === 'yellow' && daysSinceLast >= 3) isOverdue = true;
        else if (st.retention === 'green' && daysSinceLast >= 7) isOverdue = true;
      } else {
        isOverdue = true;
      }

      if (isOverdue) {
        categorizedSubtopics.push({
          topic: parent.topic,
          subtopic: st.name,
          retention: st.retention,
          importance_score: parent.importance_score || 0,
          total_marks: parent.total_marks || 0,
          days_since_last_learned: daysSinceLast !== null ? Number(daysSinceLast.toFixed(1)) : 'never',
        });
      }
    });
  });

  const topicPickerResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "initial_topic_selection",
        strict: true,
        schema: {
          type: "object",
          properties: {
            selected_subtopics: { type: "array", items: { type: "string" }, description: "2 or 3 exact subtopic names" },
            selection_rationale: { type: "string", description: "Brief reason explaining selection" }
          },
          required: ["selected_subtopics", "selection_rationale"],
          additionalProperties: false
        }
      }
    },
    messages: [
      {
        role: "system",
        content: `You are an academic curriculum scheduler.
Select exactly 2 to 3 subtopics for today's study session from the ELIGIBLE candidates provided.
### SELECTION PRIORITY RULES:
1. First priority: Subtopics with retention: 'red'.
2. Second priority: Subtopics with retention: 'yellow'.
3. Third priority: Subtopics with retention: 'green'.
4. Fourth priority: Subtopics with retention: 'untested' (favoring those with highest total_marks and importance_score).
5. Tie-breaker: Pick items with the highest total_marks / importance_score.
CRITICAL: Return ONLY exact subtopic names present in the provided list.`
      },
      { role: "user", content: `Eligible Candidate Subtopics:\n${JSON.stringify(categorizedSubtopics, null, 2)}` },
    ]
  });

  logTokenUsageAndCost("gpt-4o-mini", topicPickerResponse, "Initial Topic Picker");
  const pickerData = JSON.parse(topicPickerResponse.choices[0].message.content);
  console.log("in /chat : Topics selected:", pickerData.selected_subtopics, "| Rationale:", pickerData.selection_rationale);

  return pickerData.selected_subtopics.map(name => ({
    topic: name,
    counter: 0
  }));
}

async function fetchRagContext(query, userId, subject) {
  console.log("in /chat : generating embeddings for user query...");
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query.trim(),
    dimensions: 1536,
  });

  const queryVector = embeddingResponse.data[0].embedding;

  console.log("in /chat : searching long-term memory (Atlas Vector Search)...");
  const vectorSearchPipeline = [
    {
      $vectorSearch: {
        index: "chats_knowLiq",
        path: "embeddings",
        queryVector: queryVector,
        numCandidates: 50,
        limit: 2,
        filter: { $and: [{ user: userId }, { subject: subject }] }
      }
    },
    { $project: { query: 1, answer: 1, score: { $meta: "vectorSearchScore" } } }
  ];

  const ragResults = await Chat.aggregate(vectorSearchPipeline);
  const longTermContext = ragResults.length > 0
    ? ragResults.map(chat => `Past Question: ${chat.query}\nPast Answer: ${chat.answer}`).join("\n\n")
    : "No highly relevant past conversations found.";

  return { text: longTermContext, vector: queryVector };
}

function buildSystemPrompt(user, workspace, currentFocus, longTermContext) {
  const topicNamesList = workspace.detailedTopics.map(t => t.topic).join(", ");
  const activeSessionTopicsString = currentFocus.map(t => `${t.topic} (Turns spent: ${t.counter})`).join(", ");
  const rollingSummaryText = workspace.currentFocusSummary?.text || "No concepts taught recently.";

  const learnerType = user.settings?.learnerType || "visual";
  const answerStructure = user.settings?.answerStructure || "normal";
  const preferredLang = user.settings?.preferredLanguage || "English";

  let learningStyleInstruction = "";
  if (learnerType === "visual") {
    learningStyleInstruction = `**LEARNING STYLE: VISUAL STORY & ANALOGY MODE**
Teach difficult or abstract concepts through a short, coherent, easy-to-visualize story or real-world scenario whenever appropriate. Let the learner mentally experience what is happening step-by-step before introducing the technical explanation.
Use dynamically chosen analogies that structurally match the concept. After the analogy, explicitly map its elements to the real technical concept, terminology, mechanism, and rules. Then formalize the idea with equations or technical details when needed.
The goal is: **mental scene → intuitive understanding → analogy-to-concept mapping → technical explanation**. Do not force analogies when they genuinely add no value, and never sacrifice technical accuracy for storytelling.`;

  } else if (learnerType === "socratic") {
    learningStyleInstruction = `**LEARNING STYLE: INTERACTIVE SOCRATIC MODE**
You are an Interactive Socratic Tutor. Guide the learner toward understanding through carefully selected conceptual questions rather than immediately providing the complete answer.
Keep explanations concise and reveal information progressively. Ask only one meaningful question at a time, and make each question directly relevant to the learner's current level of understanding.
End every response with exactly one targeted conceptual question based on what was just discussed. Wait for the user's answer before progressing further.`;
  } else if (learnerType === "concise") {
    learningStyleInstruction = `**LEARNING STYLE: TO-THE-POINT MODE**
You are a Strict, Concise Technical Tutor. Eliminate conversational filler and unnecessary explanation.
Present only the information required to understand the current concept. Prefer short statements, bullet points, and precise terminology over long paragraphs. Use bolding selectively for important terms.
Keep the entire response strictly under 150 words unless additional detail is absolutely necessary to prevent misunderstanding.`;
  }

 const structureInstruction = answerStructure === "detailed"
  ? `**DETAILED STRUCTURE:** Organize the response clearly using appropriate headings, bullet points, numbered steps, tables, and examples where useful. Explain the concept thoroughly and in depth rather than superficially.`
  : `**NORMAL STRUCTURE:** Keep the explanation concise and efficient, but still format it clearly and naturally. Use headings, bullets, tables, or other structure when they genuinely improve understanding. Avoid unnecessary detail and excessive formatting.`;

  return `You are an elite, interactive AI tutor. Your directive is to keep the student perfectly focused using bite-sized learning and active recall.

### USER PROFILE & PREFERENCES
${learningStyleInstruction}
- **ANSWER STRUCTURE**: ${structureInstruction}
- **LANGUAGE:** Always reply in **${preferredLang}**. Ignore the language used in previous chats or 'longTermContext'. Only change language if the user explicitly asks for a different language in their current message. If ${preferredLang} is Urdu, use Roman Urdu only. Never use Hindi.

### CURRENT SESSION CONTEXT
You are currently focusing ONLY on these subtopics with the user:
[ ${activeSessionTopicsString} ]

### RECENTLY COVERED CONCEPTS (Avoid repeating these):
${rollingSummaryText}

### RELEVANT PAST KNOWLEDGE (From previous chats):
${longTermContext}

### CORE TUTORING RULES:
1. NO INFO-DUMPING: Never explain everything at once. Focus on ONLY ONE concept at a time.
2. QUESTIONING & TRANSITIONS: Do NOT ask obvious or forced questions (unless in Socratic mode). Always end your response with a clear guiding statement to smoothly transition the user to the next logical subtopic from your CURRENT SESSION CONTEXT list.
3. ADAPTABILITY: If they are confused, re-explain simply. If they master it, transition to the next logical concept.
4. FORMATTING: Use standard LaTeX for math ($$ for display, $ for inline). Keep general text formatting light. Use headings and subheadings. If a response contains multiple concepts, summarize them in a Markdown Table at the end.
5. LANGUAGE CONSISTENCY: Always follow ${preferredLang} unless the user explicitly requests another language in the current message. Historical conversation context must never override the ${preferredLang} language.

### ROUTING & FLAG RULES:
- SYLLABUS & PROGRESS QUESTIONS: If the user asks about their overall syllabus, learning progress, topic-wise performance, retention status, or past performance, respond politely by saying exactly: "As an AI, I don't have access to your current syllabus progress in this chat. However, my responses are planned to guide your learning based on your current study context. You can view your detailed syllabus and progress by clicking the 'syllabus-icon' on the top-right side."
- OFF-TOPIC HANDLING: If the user asks something entirely unrelated to the syllabus, set "tutor_response" to gently guide them back using this list of available topics: ${topicNamesList}.`;
}



async function callMainTutor(user, workspace, subject, query, longTermContext, currentFocus, targetModel) {
  const systemPrompt = buildSystemPrompt(user, workspace, currentFocus, longTermContext);

  const chatLimit = targetModel === "gpt-4o-mini" ? 2 : 3;
  console.log(`in /chat : fetching short-term memory (last ${chatLimit} chats)...`);
  let recentChats = await Chat.find({ user: user._id, subject: subject.trim(), success: true })
    .sort({ createdAt: -1 })
    .limit(chatLimit);

  recentChats.reverse();

  const openAiMessages = [{ role: "system", content: systemPrompt }];
  recentChats.forEach(chat => {
    if (chat.query) openAiMessages.push({ role: "user", content: chat.query });
    if (chat.answer) openAiMessages.push({ role: "assistant", content: chat.answer });
  });

  openAiMessages.push({ role: "user", content: query.trim() });

  // Trigger rolling summary logic here, safely, if counter hits a multiple of 3
  if (!workspace.currentFocusSummary) workspace.currentFocusSummary = { text: "", counter: 0 };
  workspace.currentFocusSummary.counter += 1;
  if (workspace.currentFocusSummary.counter % 3 === 0) {
    await rollingSummary(workspace, openAiMessages);
  } else {
    console.log("chats so far : ", workspace.currentFocusSummary.counter);
  }

  console.log(`in /chat : sending structured payload to ${targetModel}...`);
  const completion = await openai.chat.completions.create({
    model: targetModel,
    messages: openAiMessages,
    max_completion_tokens: 1000,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "tutor_chat_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            tutor_response: { type: "string", description: "Conversational explanation, question, or guidance." },
            current_taught_subtopic: { type: ["string", "null"], description: "The exact name of the subtopic discussed, or null if off-topic." },
            test_pending: { type: "boolean", description: "Set to true ONLY IF at least 7 turns have passed AND the user has sufficiently learned the material to warrant a diagnostic test." }
          },
          required: ["tutor_response", "current_taught_subtopic", "test_pending"],
          additionalProperties: false
        }
      }
    }
  });

  logTokenUsageAndCost(targetModel, completion, "Main Tutor AI");
  let aiData = JSON.parse(completion.choices[0].message.content);

  return {
    answer: aiData.tutor_response,
    subtopic: aiData.current_taught_subtopic,
    test_pending: aiData.test_pending
  };
}

async function updateWorkspaceState(user, workspace, currentFocus, aiData, subject) {
  if (aiData.current_taught_subtopic) {
    const taughtName = aiData.current_taught_subtopic.trim();
    const matchedIndex = currentFocus.findIndex(t => t.topic && t.topic.trim().toLowerCase() === taughtName.toLowerCase());

    if (matchedIndex !== -1) {
      currentFocus[matchedIndex].counter = (currentFocus[matchedIndex].counter || 0) + 1;
      await Workspace.updateOne(
        { _id: workspace._id, "detailedTopics.subtopics.name": currentFocus[matchedIndex].topic },
        { $set: { "detailedTopics.$[].subtopics.$[sub].last_learned_at": new Date() } },
        { arrayFilters: [{ "sub.name": currentFocus[matchedIndex].topic }] }
      );
    }
  }

  let isTestPending = Boolean(aiData.test_pending);
  try {
    if (isTestPending) {
      console.log("in /chat : test_pending flag is true. Locking user chat...");
      workspace.test_pending = true;
      // We don't overwrite finalAnswer here; the controller handles the locked state payload on the NEXT request.
    }

    workspace.currentFocus = currentFocus || [];
    workspace.markModified("currentFocus");
    workspace.markModified("currentFocusSummary");

    await workspace.save();
    await user.save();
  } catch (saveError) {
    console.error("in /chat : Failed to update User DB:", saveError.message);
  }

  return isTestPending;
}

async function saveChatHistory(userId, subject, query, finalAnswer, queryVector) {
  try {
    const newChat = new Chat({
      user: userId,
      subject: subject.trim(),
      query: query.trim(),
      answer: finalAnswer,
      embeddings: queryVector,
      success: true
    });
    await newChat.save();
  } catch (dbError) {
    console.error("in /chat : Failed to save chat to DB:", dbError.message);
  }
}

async function rollingSummary(workspace, openAiMessages) {
  try {
    if (!workspace.currentFocusSummary) {
      workspace.currentFocusSummary = { text: "", counter: 0 };
    }

    const conversationHistory = openAiMessages
      .filter(msg => msg.role !== "system")
      .map(msg => `${msg.role === "user" ? "Student" : "Tutor"}: ${msg.content}`)
      .join("\n\n");

    const summarizerSystemPrompt = `You are an expert educational tracking system. Your task is to maintain an ULTRA-CONCISE, running ledger of topics the student has covered.
CRITICAL RULES:
1. EXTREME ABSTRACTION: Do NOT explain or define the concepts. Abstract granular details into high-level category names.
2. STRICT LENGTH LIMIT: The entire summary MUST NEVER exceed 40 words.
3. PRUNE & MERGE: Seamlessly group new topics from the Recent Conversation into the Previous Summary.
4. FORMAT: Output a maximum of 2 to 3 short sentences. Start directly with the concepts.`;

    const summarizerUserPrompt = `PREVIOUS SUMMARY:\n${workspace.currentFocusSummary.text || "No previous topics recorded."}\n\nRECENT CONVERSATION:\n${conversationHistory}`;

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: summarizerSystemPrompt },
        { role: "user", content: summarizerUserPrompt }
      ],
      temperature: 0.2,
    });

    workspace.currentFocusSummary.text = response.choices[0].message.content.trim();

    const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
    const COST_PER_1M_INPUT = 0.075;
    const COST_PER_1M_OUTPUT = 0.30;
    const totalCost = ((prompt_tokens / 1000000) * COST_PER_1M_INPUT) + ((completion_tokens / 1000000) * COST_PER_1M_OUTPUT);

    console.log("\n--- Rolling Summary Updated ---");
    console.log(workspace.currentFocusSummary.text);
    console.log("\n--- Usage & Cost Report ---");
    console.log(`Input Tokens: ${prompt_tokens} | Output Tokens: ${completion_tokens} | Total: ${total_tokens}`);
    console.log(`Estimated Cost: $${totalCost.toFixed(6)}`);
  } catch (error) {
    console.error("Error generating rolling summary:", error);
  }
}

const MODEL_PRICING = {
  "gpt-4o-mini": { inputRate: 0.15, outputRate: 0.60 },
  "gpt-5.6-luna": { inputRate: 0.20, outputRate: 1.20 },
};

function logTokenUsageAndCost(modelName, completionObj, contextLabel) {
  if (!completionObj.usage) return;
  const inputTokens = completionObj.usage.prompt_tokens || 0;
  const outputTokens = completionObj.usage.completion_tokens || 0;
  const totalTokens = completionObj.usage.total_tokens || (inputTokens + outputTokens);

  const rates = MODEL_PRICING[modelName] || { inputRate: 0, outputRate: 0 };
  const estimatedInputCost = (inputTokens / 1_000_000) * rates.inputRate;
  const estimatedOutputCost = (outputTokens / 1_000_000) * rates.outputRate;
  const totalCost = (estimatedInputCost + estimatedOutputCost).toFixed(6);

  console.log(`in /chat [${contextLabel}] : --- USAGE SUMMARY (${modelName}) ---`);
  console.log(`in /chat [${contextLabel}] : Input Tokens:  ${inputTokens} (@ $${rates.inputRate}/M)`);
  console.log(`in /chat [${contextLabel}] : Output Tokens: ${outputTokens} (@ $${rates.outputRate}/M)`);
  console.log(`in /chat [${contextLabel}] : Total Tokens:  ${totalTokens}`);
  console.log(`in /chat [${contextLabel}] : Estimated Cost: $${totalCost} USD`);
  console.log(`in /chat [${contextLabel}] : -----------------------------------`);
}




router.get("/fetch-chat", verifyLogin, async (req, res) => {
  try {
    const { uid } = req;

    // Use req.query for GET requests (e.g., /fetch-chat?subject=Physics)
    const { subject } = req.query;

    if (!subject) {
      return res.status(400).json({ success: "false", error: "Subject is required" });
    }

    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(400).json({ success: "false", error: "User does not exist" });
    }

    // 👇 FIX: Fetch the workspace before accessing it!
    const workspace = await Workspace.findOne({
      owner: user._id,
      subject: subject.trim()
    });

    const isTestPending = workspace.test_pending || false;

    // Find chats for this user and subject, sorted from oldest to newest
    const chats = await Chat.find({
      user: user._id,
      subject: subject
    }).sort({ createdAt: 1 });

    // Convert Mongoose documents to standard JS array so we can safely modify it
    const chatData = chats.map(chat => chat.toObject());

    // If a test is pending, automatically append the "Take Test" card to the chat history
    if (isTestPending) {
      chatData.push({
        answer: `### 🛑 Chat is Freezed!\n\n**Time to prove what you've learned.** You must complete your pending evaluation to unlock this workspace.\n\n[👉 CLICK HERE TO TAKE TEST NOW](/takeTest?subject=${encodeURIComponent(subject.trim())})`
      });
    }

    return res.status(200).json({
      success: "true",
      message: "Chats retrieved successfully",
      data: chatData,
      test_pending: isTestPending, // Fixed: dynamically send actual user state, not hardcoded true
    });

  } catch (error) {
    console.error("error in /fetch-chat:", error.message);
    return res.status(500).json({
      success: "false",
      error: "Something went wrong!"
    });
  }
});

//for fetchign shared chat
router.get("/shared/:shared_workspace_id", async (req, res) => {
  try {
    const { shared_workspace_id } = req.params;

    if (!shared_workspace_id) {
      return res.status(400).json({ success: false, error: "Workspace ID is required" });
    }

    // 1. Find the workspace to get the associated owner and subject
    const workspace = await Workspace.findOne({
      _id: shared_workspace_id,
      shared: true
    });

    if (!workspace) {
      return res.status(404).json({ success: false, error: "Shared workspace not found" });
    }

    // 2. Extract the owner (user reference) and subject from the workspace
    const { owner, subject } = workspace;

    // 3. Find chats using the workspace's owner ID and subject
    const chats = await Chat.find({
      user: owner,
      subject: subject
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: "Shared chats retrieved successfully",
      data: chats
    });

  } catch (error) {
    console.error("error in /shared/:shared_workspace_id:", error.message);

    // Handle cases where the shared_workspace_id is not a valid MongoDB ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid workspace ID format"
      });
    }

    return res.status(500).json({
      success: false,
      error: "Something went wrong!"
    });
  }
});


// Assuming you are sending the workspace 'subject' in the request body 
// so the backend knows *which* workspace to share.

router.post("/create_workspace_shared", verifyLogin, async (req, res) => {
  try {
    const { uid } = req;
    const { subject } = req.body; // Needs the subject to identify the specific workspace

    if (!subject) {
      return res.status(400).json({ success: false, error: "Subject is required" });
    }

    // 1. Find the user based on uid from the verifyLogin middleware
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(400).json({ success: false, error: "User does not exist" });
    }

    // 2. Find the workspace by owner (user._id) and subject, then update/add the 'shared' field
    // $set will add the field if it doesn't exist, or update it if it does.
    // { new: true } ensures Mongoose returns the updated document.
    const workspace = await Workspace.findOneAndUpdate(
      { owner: user._id, subject: subject },
      { $set: { shared: true } },
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({ success: false, error: "Workspace not found" });
    }

    // 3. Return the workspace._id as requested
    return res.status(200).json({
      success: true,
      message: "Workspace shared successfully",
      shared_workspace_id: workspace._id
    });

  } catch (error) {
    console.error("error in /create_workspace_shared:", error.message);
    return res.status(500).json({
      success: false,
      error: "Something went wrong!"
    });
  }
});


module.exports = router;
