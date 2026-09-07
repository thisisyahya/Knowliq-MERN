import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Send,
  ArrowLeft,
  AlertCircle,
  Sun,
  Moon,
  Coffee,
} from "lucide-react";
import axios from "axios";

// Markdown & Math imports
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Firebase auth config import
import { auth } from "../firebase";

export default function TakeTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subject = searchParams.get("subject") || "Computer Science"; 

  const [isLoadingTest, setIsLoadingTest] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Track reasoning text
  const [answers, setAnswers] = useState({}); 
  // Track MCQ selections
  const [selectedOptions, setSelectedOptions] = useState({});

  // Dark mode, defaults to the user's system preference
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  const theme = {
    page: isDark ? "bg-[#0F1115] text-gray-100" : "bg-gray-50 text-gray-900",
    card: isDark
      ? "bg-[#181B23] border-[#2A2E3A] shadow-black/30"
      : "bg-white border-gray-200 shadow-gray-200/60",
    subtleText: isDark ? "text-gray-400" : "text-gray-500",
    heading: isDark ? "text-gray-100" : "text-gray-800",
    accent: "text-purple-500",
    accentBg: isDark ? "bg-purple-600" : "bg-purple-700",
    accentBgHover: isDark ? "hover:bg-purple-500" : "hover:bg-purple-800",
    trackBg: isDark ? "bg-[#2A2E3A]" : "bg-gray-200",
    tagBg: isDark
      ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
      : "bg-purple-50 text-purple-700 border-purple-200",
    textarea: isDark
      ? "bg-[#0F1115] border-[#2A2E3A] text-gray-100 focus:bg-[#12141b] placeholder:text-gray-600"
      : "bg-gray-50 border-gray-300 text-gray-800 focus:bg-white placeholder:text-gray-400",
    ghostBtn: isDark
      ? "text-gray-400 hover:text-white hover:bg-white/5"
      : "text-gray-600 hover:text-black hover:bg-gray-100",
    darkBtn: isDark
      ? "bg-gray-100 text-gray-900 hover:bg-white"
      : "bg-black text-white hover:bg-gray-800",
    errorBanner: isDark
      ? "bg-red-500/10 border-red-500/30 text-red-300"
      : "bg-red-50 border-red-200 text-red-700",
    divider: isDark ? "border-[#2A2E3A]" : "border-gray-100",
    toggleTrack: isDark ? "bg-purple-600" : "bg-gray-300",
    optionUnselected: isDark 
      ? "border-[#2A2E3A] hover:bg-[#2A2E3A]/40 text-gray-300" 
      : "border-gray-200 hover:bg-gray-50 text-gray-700",
    optionSelected: isDark
      ? "border-purple-500 bg-purple-500/20 text-purple-100"
      : "border-purple-500 bg-purple-50 text-purple-900",
  };

  const ThemeToggle = ({ className = "" }) => (
    <button
      onClick={() => setIsDark((prev) => !prev)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 ${theme.toggleTrack} ${className}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon size={14} className="text-purple-600" />
        ) : (
          <Sun size={14} className="text-yellow-500" />
        )}
      </span>
    </button>
  );

  // 1. Fetch / Generate the test questions (REAL BACKEND LOGIC)
  useEffect(() => {
    if (!subject) {
      alert("No subject provided!");
      navigate("/dashboard");
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await generateTest(user);
      } else {
        navigate("/");
      }
    });

    async function generateTest(user) {
      setIsLoadingTest(true);
      setErrorMessage(null);

      try {
        const token = await user.getIdToken();
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/test/make-test`,
          { subject },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success === "true" && Array.isArray(res.data.questions)) {
          setQuestions(res.data.questions);
        } else {
          throw new Error(res.data.error || "Failed to load questions from server.");
        }
      } catch (error) {
        console.error("Failed to generate test:", error);
        setErrorMessage(error.message || "Failed to load test.");
      } finally {
        setIsLoadingTest(false);
      }
    }

    return () => unsubscribe();
  }, [subject, navigate]);

  const handleOptionSelect = (option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentIndex]: option,
    }));
  };

  const handleAnswerChange = (text) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: text,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // 2. Submit test questions and answers to backend (REAL BACKEND LOGIC)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();

      const finalPayload = {
        subject,
        submissions: questions.map((q, index) => ({
          question_id: q.id || q.question_id || index + 1,
          question: q.text,
          target_topics: q.target_topics || [],
          answer: `Selected Option: ${selectedOptions[index] || "None"}\nReasoning: ${answers[index]?.trim() || ""}`,
        })),
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/test/submit-test`,
        finalPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success === "true") {
        setTestComplete(true);
      } else {
        throw new Error(res.data.error || "Grading failed on server.");
      }
      
    } catch (error) {
      console.error("Submission failed:", error);
      setErrorMessage(error.message || "Failed to submit test.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI: Loading Screen ---
  if (isLoadingTest) {
    return (
      <div className={`h-screen w-screen flex flex-col items-center justify-center transition-colors duration-300 ${theme.page}`}>
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
        <h2 className={`text-xl font-semibold ${theme.heading}`}>Generating Your Diagnostic Test</h2>
        <p className={`text-sm mt-2 ${theme.subtleText}`}>Targeting key syllabus areas for {subject}...</p>
      </div>
    );
  }

  // --- UI: Error State (if initial fetch failed) ---
  if (errorMessage && questions.length === 0) {
    return (
      <div className={`h-screen w-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${theme.page}`}>
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
        <h2 className={`text-xl font-bold ${theme.heading}`}>Unable to Load Test</h2>
        <p className={`mt-2 text-center max-w-md ${theme.subtleText}`}>{errorMessage}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className={`mt-6 px-6 py-2.5 font-medium rounded-xl transition-colors ${theme.darkBtn}`}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // --- UI: Success Screen ---
  if (testComplete) {
    return (
      <div className={`h-screen w-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${theme.page}`}>
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className={`text-2xl font-bold ${theme.heading}`}>Test Submitted!</h2>
        <p className={`mt-2 text-center max-w-md ${theme.subtleText}`}>
          Your responses for <strong className={theme.heading}>{subject}</strong> are in the queue for grading.
        </p>

        <div
          className={`mt-6 flex items-center gap-3 px-5 py-3 rounded-2xl border max-w-md ${
            isDark ? "bg-purple-500/10 border-purple-500/30" : "bg-purple-50 border-purple-200"
          }`}
        >
          <Coffee size={20} className="text-purple-500 shrink-0" />
          <p className={`text-sm ${isDark ? "text-purple-200" : "text-purple-800"}`}>
            Grading takes a little time — go grab a coffee, stretch, or enjoy a short break. Your
            mastery scores will be waiting in your workspace when you're back.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className={`mt-8 px-6 py-3 font-medium rounded-xl transition-colors ${theme.darkBtn}`}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // --- UI: Active Test Interface ---
  const currentQ = questions[currentIndex] || {};
  const progressPercentage = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  
  const answeredCount = questions.filter((_, idx) => 
    selectedOptions[idx] || (answers[idx] && answers[idx].trim().length > 0)
  ).length;

  return (
    <div className={`h-screen overflow-hidden flex flex-col items-center py-6 sm:py-8 px-4 transition-colors duration-300 ${theme.page}`}>
      
      <div className="w-full max-w-5xl shrink-0 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center text-sm font-medium transition-colors rounded-lg px-2 py-1 -ml-2 ${theme.ghostBtn}`}
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
          </button>

          <ThemeToggle />
        </div>

        <div className="flex justify-between items-end mb-2">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${theme.heading}`}>
              Knowledge Check: <span className={theme.accent}>{subject}</span>
            </h1>
            <p className={`text-xs mt-0.5 ${theme.subtleText}`}>
              Answered: {answeredCount} of {questions.length} questions
            </p>
          </div>
          <span className={`text-sm font-bold ${theme.subtleText}`}>
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className={`w-full h-2 rounded-full overflow-hidden ${theme.trackBg}`}>
          <div
            className="h-full bg-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className={`w-full max-w-5xl shrink-0 mb-4 p-3 border rounded-xl text-sm flex items-center gap-2 ${theme.errorBanner}`}>
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className={`w-full max-w-5xl flex-1 min-h-0 border rounded-2xl flex flex-col shadow-sm transition-colors duration-300 overflow-hidden ${theme.card}`}>
        
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className={`text-lg sm:text-xl font-medium leading-relaxed flex items-start ${theme.heading}`}>
              <span className={`font-bold mr-2 mt-1 ${theme.accent}`}>Q{currentIndex + 1}.</span>
              <div className="inline-block flex-1 overflow-hidden">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {currentQ.text || ""}
                </ReactMarkdown>
              </div>
            </h2>
          </div>

          {Array.isArray(currentQ.target_topics) && currentQ.target_topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6 ml-8">
              {currentQ.target_topics.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className={`text-[11px] font-medium border px-2 py-0.5 rounded-md ${theme.tagBg}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {currentQ.options && currentQ.options.length > 0 && (
            <div className="flex flex-col gap-3 mb-8">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedOptions[currentIndex] === option;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full flex items-center text-left px-5 py-3.5 border rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ${
                      isSelected ? theme.optionSelected : theme.optionUnselected
                    }`}
                  >
                    <span className="inline-flex w-6 h-6 items-center justify-center rounded-full border border-current mr-3 text-xs shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <div className="inline-block text-left overflow-hidden">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          p: ({node, ...props}) => <span {...props} /> // Forces text to stay inline
                        }}
                      >
                        {option}
                      </ReactMarkdown>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-4">
            <p className={`text-sm font-medium mb-3 ${theme.heading}`}>
              Explain your reasoning (Formulas, steps, or logic):
            </p>
            <textarea
              value={answers[currentIndex] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your detailed explanation or reasoning here..."
              className={`w-full h-40 p-4 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none leading-relaxed ${theme.textarea}`}
            />
          </div>
        </div>

        <div className={`shrink-0 flex justify-between items-center p-5 sm:px-10 sm:py-6 border-t ${theme.divider}`}>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0 || isSubmitting}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors ${theme.ghostBtn}`}
          >
            <ChevronLeft size={18} className="mr-1" /> Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center px-6 py-2.5 text-sm font-medium text-white rounded-xl disabled:opacity-70 transition-colors ${theme.accentBg} ${theme.accentBgHover}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" /> Evaluating...
                </>
              ) : (
                <>
                  Submit Test <Send size={16} className="ml-2" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className={`flex items-center px-6 py-2.5 text-sm font-medium rounded-xl transition-colors ${theme.darkBtn}`}
            >
              Next <ChevronRight size={18} className="ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}