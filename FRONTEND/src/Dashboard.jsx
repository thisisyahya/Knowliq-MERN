import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Trash, Send, Loader2, LogOut, ChevronDown, Copy, Check, Sun, Moon, Menu, X, BookOpen, Share, Share2, Settings, BarChart2 } from "lucide-react";
import SyllabusOverlay from "./components/SyllabusOverlay"; // adjust path as needed
import CreateWorkspace from "./components/CreateWorkspace";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";


import axios from "axios";
import { auth } from "../firebase";

import PythonRunner from "./components/PythonRunner";

// --- Galaxy Background Component ---
// --- Galaxy Background Component ---
const GalaxyBackground = memo(({ isDarkMode }) => {
  // Generate random star properties exactly once on mount
  const stars = useMemo(() => {
    return [...Array(50)].map(() => {
      const size = Math.random() * 2.5 + 0.5;
      const isSpark = Math.random() > 0.85;
      const hasGlow = Math.random() > 0.5; // Calculate glow randomly once

      const dx1 = `${(Math.random() - 0.5) * 50}px`;
      const dy1 = `${(Math.random() - 0.5) * 50}px`;
      const dx2 = `${(Math.random() - 0.5) * 50}px`;
      const dy2 = `${(Math.random() - 0.5) * 50}px`;

      const top = `${Math.random() * 100}%`;
      const left = `${Math.random() * 100}%`;

      const animationDuration = `${15 + Math.random() * 20}s`;
      const animationDelay = `-${Math.random() * 30}s`;

      return {
        size, isSpark, hasGlow, dx1, dy1, dx2, dy2, top, left,
        animationDuration, animationDelay
      };
    });
  }, []); // Empty dependency array means this runs only once

  if (!isDarkMode) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep space radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1B053A]/40 via-[#0B0014]/80 to-[#0B0014]"></div>

      {/* Stars and Sparks */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.isSpark ? star.size * 1.5 : star.size}px`,
              height: `${star.isSpark ? star.size * 1.5 : star.size}px`,
              backgroundColor: star.isSpark ? '#d8b4fe' : '#ffffff',
              boxShadow: star.isSpark
                ? '0 0 8px 2px rgba(168, 85, 247, 0.6)'
                : (star.hasGlow ? '0 0 3px 1px rgba(255, 255, 255, 0.3)' : 'none'),
              '--dx1': star.dx1,
              '--dy1': star.dy1,
              '--dx2': star.dx2,
              '--dy2': star.dy2,
              animation: `drift-and-twinkle ${star.animationDuration} ease-in-out infinite`,
              animationDelay: star.animationDelay
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes drift-and-twinkle {
          0%, 100% { 
            opacity: 0.1; 
            transform: translate(0, 0) scale(0.8); 
          }
          33% { 
            opacity: 1; 
            transform: translate(var(--dx1), var(--dy1)) scale(1.3); 
          }
          66% { 
            opacity: 0.4; 
            transform: translate(var(--dx2), var(--dy2)) scale(0.9); 
          }
        }
      `}</style>
    </div>
  );
});

const MemoizedChatBubble = memo(({ msg, isDarkMode }) => {
  const [copied, setCopied] = useState(false);
  const isUser = msg.sender === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLaTeX = (text) => {
    if (!text) return "";
    let formatted = text;

    // 1. RECOVER CORRUPTED ESCAPE CHARACTERS
    formatted = formatted.replace(/\f/g, '\\f'); // Restores \frac, \fcolorbox
    formatted = formatted.replace(/\t/g, '\\t'); // Restores \text, \tau, \theta
    formatted = formatted.replace(/\v/g, '\\v'); // Restores \vec, \varepsilon
    
    // FIXED: [\b] targets the backspace control character, NOT word boundaries
    formatted = formatted.replace(/[\b]/g, '\\b'); 

    // Recover characters that share escape sequences with newlines/returns
    formatted = formatted.replace(/\n(?=u|abla|eq|ormalsize)/g, '\\n'); // Restores \nu, \nabla, \neq
    formatted = formatted.replace(/\r(?=ho|angle|ightarrow)/g, '\\r'); // Restores \rho, \rightarrow

    // 2. FIX THE SQUEEZED MATH 
    formatted = formatted.replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
      return `$$\\displaystyle ${math}$$`;
    });

    formatted = formatted.replace(/\\\(([\s\S]*?)\\\)/g, (match, math) => {
      return `$\\displaystyle ${math}$`;
    });

    formatted = formatted.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
      return math.includes('\\displaystyle') ? match : `$$\\displaystyle ${math}$$`;
    });

    formatted = formatted.replace(/(^|[^\$])\$([^\$]+)\$(?!\$)/g, (match, prefix, math) => {
      return math.includes('\\displaystyle') ? match : `${prefix}$\\displaystyle ${math}$`;
    });

    return formatted;
  };

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-4 relative z-10`}>
      <div className="flex flex-col max-w-[90%] sm:max-w-3xl min-w-[100px]">
        <div
          className={`relative px-4 sm:px-5 py-3 sm:py-3.5 text-[14px] sm:text-[15px] leading-relaxed shadow-sm break-words overflow-x-auto ${isUser
            ? "bg-purple-600 text-white rounded-2xl rounded-tr-sm"
            : isDarkMode
              ? "bg-[#150524]/90 backdrop-blur-sm border border-[#3A1B5C] text-gray-200 rounded-2xl rounded-tl-sm"
              : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
            }`}
        >
          {isUser ? (
            msg.text
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[
                [
                  rehypeKatex,
                  {
                    strict: false,
                    throwOnError: false,
                    errorColor: "#374151"
                  }
                ]
              ]}
              components={{
                // Wrap tables in an overflow-x-auto div so they scroll on small screens instead of pushing the chat box wide
                table({ node, ...props }) {
                  return (
                    <div className="overflow-x-auto w-full my-3">
                      <table className="w-full min-w-max text-left border-collapse" {...props} />
                    </div>
                  );
                },
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isPython = match && match[1] === "python";

                  if (!inline && isPython) {
                    return <PythonRunner code={String(children).replace(/\n$/, "")} />;
                  }

                  return !inline ? (
                    <pre className={`${isDarkMode ? 'bg-[#0B0014] border border-[#2C1245]' : 'bg-gray-800'} text-gray-100 p-3 rounded-lg text-xs overflow-x-auto my-2`}>
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className={`${isDarkMode ? 'bg-[#220938] text-purple-300' : 'bg-gray-100 text-purple-700'} px-1.5 py-0.5 rounded text-xs font-mono break-words`} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
              className={`prose prose-sm max-w-none prose-p:my-2 prose-li:my-1 w-full ${isDarkMode
                ? 'prose-invert prose-strong:!text-white prose-headings:!text-white [&_strong]:!text-white [&_b]:!text-white [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_a]:!text-purple-400 [&_table]:!bg-transparent [&_th]:!bg-[#2A134A] [&_td]:!bg-transparent [&_th]:!border-[#3A1B5C] [&_td]:!border-[#3A1B5C] [&_tr]:!border-[#3A1B5C] [&_th]:!text-white [&_td]:!text-gray-200'
                : ''
                }`}
            >
              {formatLaTeX(msg?.text || "")}
            </ReactMarkdown>
          )}
        </div>

        {/* Copy Button */}
        <div className="flex justify-start mt-1.5 ml-1">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${isDarkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-400 hover:text-purple-600'
              }`}
          >
            {copied ? (
              <>
                <Check size={13} className="text-green-500" />
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default function Dashboard() {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);

  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // User Profile State
  const [userProfile, setUserProfile] = useState({ name: "", avatar: "" });

  // Chat & Subject State
  const [activeSubject, setActiveSubject] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Auto");
  const [isModelOpen, setIsModelOpen] = useState(false);

  // Scroll State
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [userToken, setUserToken] = useState(null);

  // Keep user token updated
  useEffect(() => {
    const fetchToken = async () => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        setUserToken(token);
      }
    };
    fetchToken();
  }, [activeSubject]);

  const [currentTopics, setCurrentTopics] = useState(() => {
    const savedTopics = sessionStorage.getItem('current-topics');
    return savedTopics ? JSON.parse(savedTopics) : [];
  });

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    sessionStorage.removeItem('current-topics');
    setCurrentTopics([]);
  }, [activeSubject]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const models = [
    { id: "Astra", name: "Astra", desc: "Cost-effective" },
    { id: "Auto", name: "Auto", desc: "(recommended)" },
    { id: "Stella", name: "Stella", desc: "complex maths" },

  ];

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollButton(isScrolledUp);
  };

  useEffect(() => {
    if (!activeSubject) {
      setChatHistory([]);
      return;
    }

    async function loadChatHistory() {
      setChatHistory([{ sender: "ai", text: "Loading chat history..." }]);

      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/chat/fetch-chat?subject=${encodeURIComponent(activeSubject)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success === "true" || res.data.success === true) {
          const dbChats = res.data.data;

          if (dbChats.length === 0) {
            setChatHistory([{ sender: "ai", text: `Workspace initialized for **${activeSubject}**. How can I help you study?` }]);
            return;
          }

          const formattedHistory = [];
          dbChats.forEach((chat) => {
            if (chat.query) {
              formattedHistory.push({ sender: "user", text: chat.query });
            }
            if (chat.answer) {
              formattedHistory.push({ sender: "ai", text: chat.answer });
            }
          });

          setChatHistory(formattedHistory);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setChatHistory([{ sender: "ai", text: "Failed to load previous conversations." }]);
      }
    }

    loadChatHistory();
  }, [activeSubject]);

  async function fetchWorkSpaces() {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/fetch-workspaces`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const fetchedWorkspaces = res.data.workspaces || [];
        setWorkspaces(fetchedWorkspaces);

        if (fetchedWorkspaces.length > 0 && !activeSubject) {
          setActiveSubject(fetchedWorkspaces[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch workspaces:", error.response?.data || error.message);
    }
  }



  const handleDeleteWorkspace = async (workspaceName) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      // Subject passed directly in the URL
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/delete-workspace/${encodeURIComponent(workspaceName)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        const updatedWorkspaces = workspaces.filter(ws => ws !== workspaceName);
        setWorkspaces(updatedWorkspaces);
        if (activeSubject === workspaceName) {
          setActiveSubject(updatedWorkspaces.length > 0 ? updatedWorkspaces[0] : null);
        }
      }
    } catch (error) {
      console.error("Failed to delete workspace:", error);
    } finally {
      setWorkspaceToDelete(null);
    }
  };


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchWorkSpaces();
        // Grab user profile data for sidebar
        setUserProfile({
          name: user.displayName || "Student",
          avatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'S'}&background=6b21a8&color=fff`
        });
      } else {
        navigate("/", { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);



  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeSubject || isChatting) return;

    const userText = input.trim();
    setInput("");

    setChatHistory(prev => [...prev, { sender: "user", text: userText }]);
    setIsChatting(true);

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      console.log("Sending current-topics to backend:", currentTopics);

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chat/chat`,
        {
          subject: activeSubject,
          query: userText,
          selectedModel: selectedModel,
          "current-topics": currentTopics
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const updatedTopics = res.data["current-topics"];

      console.log("Received updated current-topics from backend:", updatedTopics);

      if (updatedTopics) {
        setCurrentTopics(updatedTopics);
        sessionStorage.setItem('current-topics', JSON.stringify(updatedTopics));
      }

      if (res.data.chat_locked) {
        // window.location.href = '/test'; 
      }

      const aiResponseText = res.data.answer || "Processed successfully.";
      setChatHistory(prev => [...prev, { sender: "ai", text: aiResponseText }]);

    } catch (error) {
      console.error("Chat error:", error);

      if (error.response && error.response.status === 403) {
        // ✅ Extract the 'answer' field you sent in the backend JSON
        const lockedMessage = error.response.data.answer || "**Your chat is currently locked. Please take your pending test to continue.**";

        setChatHistory(prev => [...prev, {
          sender: "ai",
          text: lockedMessage
        }]);
      } else {
        setChatHistory(prev => [...prev, {
          sender: "ai",
          text: "Error: Could not reach the server or process the request."
        }]);
      }
    } finally {
      setIsChatting(false);
    }
  };




  const handleShareWorkspace = async (subject) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User not authenticated.");
        return;
      }

      const token = await user.getIdToken();

      // 1. Call backend to get the shared ID
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/chat/create_workspace_shared`,
        { subject: subject },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        const sharedId = res.data.shared_workspace_id;
        const shareableLink = `${window.location.origin}/shared/${sharedId}`;

        const shareData = {
          title: `Study Workspace: ${subject}`,
          text: `Check out my study conversation for ${subject} on knowLiq!`,
          url: shareableLink,
        };

        // 2. Trigger native OS share dialog if supported
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
          } catch (shareError) {
            // Ignore AbortError (happens when the user closes the share dialog without sharing)
            if (shareError.name !== "AbortError") {
              console.error("Error sharing via Web Share API:", shareError);
            }
          }
        } else {
          // Fallback: Copy directly to clipboard if Web Share API is unavailable
          await navigator.clipboard.writeText(shareableLink);
          alert("Link copied to clipboard!");
        }
      }
    } catch (error) {
      console.error("Failed to share workspace:", error.response?.data || error.message);
    }
  };
  return (
    // Changed h-screen to h-[100dvh] for better mobile browser support
    <div className={`h-[100dvh] w-screen overflow-hidden flex transition-colors duration-200 relative ${isDarkMode ? 'bg-[#0B0014]' : 'bg-slate-50'}`}>
      <style>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#3A1B5C' : '#cbd5e1'};
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#5B298E' : '#94a3b8'};
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: ${isDarkMode ? '#3A1B5C transparent' : '#cbd5e1 transparent'};
        }
      `}</style>

      <CreateWorkspace isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); fetchWorkSpaces(); }} />
      <SyllabusOverlay
        isOpen={isSyllabusOpen}
        onClose={() => setIsSyllabusOpen(false)}
        workspaceId={activeSubject} // Pass workspace name or ID
        token={userToken}
      />
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR - Added responsive classes and mobile slide-in animation */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-sm ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDarkMode ? 'bg-[#150524] border-r border-[#2C1245]' : 'bg-white border-r border-gray-200'}`}>

        {/* Header */}
        <div className={`border-b w-full h-[72px] shrink-0 flex items-center justify-between px-6 ${isDarkMode ? 'border-[#2C1245]' : 'border-gray-100'}`}>
          <h1 className={`flex items-center gap-2 font-bold text-2xl w-full justify-center font-poppins ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            <span>Know<span className={isDarkMode ? "text-purple-400" : "text-purple-600"}>liq</span></span>
            <img
              src={isDarkMode ? "/dark-favicon.png" : "/light-favicon.png"}
              alt="Knowliq Logo"
              className="w-7 h-7 object-contain"
            />
          </h1>
          {/* Mobile close button */}
          <button
            className="md:hidden p-1 rounded-md"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
          </button>
        </div>




        {/* Main Content Area */}
        <div className="flex-1 w-full p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          <button
            onClick={() => setIsCreateOpen(true)}
            className={`flex items-center justify-center gap-2 border border-dashed rounded-xl px-4 py-3 transition-all font-medium mb-4 ${isDarkMode
              ? 'border-[#3A1B5C] text-gray-300 hover:text-purple-400 hover:border-purple-500 hover:bg-[#220938]'
              : 'border-gray-300 text-gray-600 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50'
              }`}
          >
            <PlusCircle size={20} />
            <span>Create Workspace</span>
          </button>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
            Your Workspaces
          </div>

          {workspaces.length > 0 ? (
            workspaces.map((ws, index) => {
              const isConfirming = workspaceToDelete === ws;

              return (
                <div
                  key={index}
                  onClick={() => {
                    // Prevent selecting the workspace if we are in the middle of confirming a deletion
                    if (!isConfirming) {
                      setActiveSubject(ws);
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${activeSubject === ws && !isConfirming
                    ? isDarkMode
                      ? "bg-[#2A134A] text-purple-300 font-medium"
                      : "bg-purple-100 text-purple-900 font-medium"
                    : isConfirming
                      ? isDarkMode ? "bg-red-950/20 border border-red-900/50" : "bg-red-50 border border-red-200"
                      : isDarkMode
                        ? "text-gray-400 hover:bg-[#1C0831]"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {isConfirming ? (
                    // Inline Confirmation UI
                    <div className="flex flex-col w-full gap-2.5 animate-in fade-in duration-200 py-1">
                      <span className={`text-[11px] leading-tight font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        Delete workspace? This action is irreversible.
                      </span>
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Add your backend deletion logic here
                            handleDeleteWorkspace(ws);
                          }}
                          className={`flex-1 py-1.5 text-[11px] font-bold rounded transition-colors ${isDarkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-red-100 text-red-700 cursor-pointer hover:bg-red-200'
                            }`}
                        >
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setWorkspaceToDelete(null); // Cancel deletion
                          }}
                          className={`flex-1 py-1.5 text-[11px] font-bold rounded transition-colors ${isDarkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Default Workspace Row
                    <>
                      <span className="truncate pr-2">{ws}</span>
                      <Trash
                        size={16}
                        className={`shrink-0 transition-opacity ${activeSubject === ws
                          ? 'text-purple-400 hover:text-red-500'
                          : `opacity-0 group-hover:opacity-100 ${isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setWorkspaceToDelete(ws); // Trigger confirmation mode
                        }}
                      />
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className={`text-center text-sm mt-4 px-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No workspaces found. Create one to get started!
            </div>
          )}
        </div>

      {/* User Profile & Settings Footer */}
        <div className={`w-full p-4 mt-auto border-t shrink-0 ${isDarkMode ? 'border-[#2C1245]' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between w-full px-1">
            
            {/* User Info */}
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src={userProfile.avatar}
                alt="Profile"
                className={`w-9 h-9 rounded-full object-cover border-2 shrink-0 ${isDarkMode ? 'border-[#3A1B5C]' : 'border-purple-200'}`}
              />
              <span className={`font-semibold text-sm truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {userProfile.name}
              </span>
            </div>

            {/* Action Buttons Container */}
            <div className="flex items-center gap-1 shrink-0">
              
              {/* Test Stats Button (Prominent) */}
              <button
                onClick={() => navigate('/teststats')}
                className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                  isDarkMode 
                    ? 'text-purple-400 hover:bg-[#220938] hover:text-purple-300' 
                    : 'text-purple-600 hover:bg-purple-100 hover:text-purple-700'
                }`}
                title="Test Statistics"
              >
                <BarChart2 size={18} />
              </button>

              {/* Settings Button (Muted) */}
              <button
                onClick={() => navigate('/settings')}
                className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-purple-400 hover:bg-[#220938]' 
                    : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                }`}
                title="Settings"
              >
                <Settings size={18} />
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className={`flex-1 h-full flex flex-col relative transition-colors duration-200 min-w-0 ${isDarkMode ? 'bg-[#0B0014]' : 'bg-[#f8f9fa]'}`}>

        {/* Galaxy Background (Only visible in Dark Mode) */}
        <GalaxyBackground isDarkMode={isDarkMode} />

        {/* Chat Header */}
        <div className={`backdrop-blur-md border-b shrink-0 w-full h-[72px] px-4 sm:px-8 flex items-center justify-between z-20 sticky top-0 ${isDarkMode ? 'bg-[#150524]/60 border-[#2C1245]' : 'bg-white/80 border-gray-200'
          }`}>
          <div className="flex items-center gap-3">
            {/* Hamburger Menu for Mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden p-2 -ml-2 rounded-lg transition-colors flex items-center justify-center ${isDarkMode ? 'text-gray-300 hover:bg-[#220938]' : 'text-gray-600 hover:bg-gray-100'
                }`}
              aria-label="Toggle Sidebar"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 max-w-[160px] sm:max-w-[400px]">
              {/* Workspace Title */}
              <div
                className={`font-semibold text-sm sm:text-lg overflow-x-scroll sm:overflow-hidden ${isDarkMode ? "text-gray-100" : "text-gray-800"
                  }`}
              >
                {activeSubject ? activeSubject : "Select a workspace"}
              </div>

              {/* Share Icon Button */}
              {activeSubject && (
                <button
                  onClick={() => handleShareWorkspace(activeSubject)}
                  title="Share workspace"
                  className={`shrink-0 p-1.5 transition-colors ${isDarkMode
                    ? "border-[#3A1B5C] text-gray-300 hover:text-purple-400 hover:bg-[#2A134A]"
                    : "border-gray-200 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                >
                  <Share2 size={15} />
                </button>
              )}
            </div>
          </div>


          {/* Actions: Syllabus Button & Theme Toggle */}
          <div className="flex items-center gap-2">
            {activeSubject && (
              <button
                onClick={() => setIsSyllabusOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${isDarkMode
                  ? 'bg-[#150524] text-purple-300 border-[#3A1B5C] hover:bg-[#2A134A] hover:border-purple-500'
                  : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                  }`}
              >
                <BookOpen size={15} />
                <span className="hidden sm:inline">Syllabus</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-colors flex items-center justify-center shrink-0 ${isDarkMode
                ? 'text-purple-400 hover:bg-[#220938] hover:text-purple-300'
                : 'text-purple-600 hover:bg-purple-50'
                }`}
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>


        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="w-full flex-1 overflow-y-auto px-3 sm:px-8 pt-4 sm:pt-6 pb-28 sm:pb-32 scroll-smooth relative z-10"
        >
          <div className="max-w-4xl mx-auto flex flex-col">
            {chatHistory.map((msg, idx) => (
              <MemoizedChatBubble key={idx} msg={msg} isDarkMode={isDarkMode} />
            ))}

            {isChatting && (
              <div className="w-full flex justify-start mb-4 relative z-10">
                <div className={`border rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-3 shadow-sm ${isDarkMode ? 'bg-[#150524]/90 backdrop-blur-sm border-[#3A1B5C] text-gray-300' : 'bg-white border-gray-100 text-gray-500'
                  }`}>
                  <Loader2 size={18} className={`animate-spin ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className="text-sm font-medium">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* Floating Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className={`absolute bottom-24 sm:bottom-28 right-4 sm:right-8 p-2.5 sm:p-3 border rounded-full shadow-lg transition-all z-30 animate-in fade-in zoom-in duration-200 ${isDarkMode
              ? 'bg-[#1C0831] border-[#3A1B5C] text-gray-300 hover:bg-[#2A134A] hover:text-purple-400'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-purple-600'
              }`}
            aria-label="Scroll to bottom"
          >
            <ChevronDown size={20} className="sm:w-6 sm:h-6" />
          </button>
        )}


        {/* Chat Input */}
        <div
          className={`absolute bottom-0 left-0 w-full bg-gradient-to-t pt-6 pb-4 sm:pb-6 px-3 sm:px-8 z-20 pointer-events-none ${isDarkMode
            ? 'from-[#0B0014] via-[#0B0014]/95 to-transparent'
            : 'from-[#f8f9fa] via-[#f8f9fa]/95 to-transparent'
            }`}
        >
          <form
            onSubmit={handleSendMessage}
            className={`max-w-4xl mx-auto flex flex-col border rounded-3xl p-2 sm:p-3 transition-all focus-within:ring-4 pointer-events-auto ${isDarkMode
              ? 'bg-[#150524]/90 backdrop-blur-md border-[#3A1B5C] shadow-[0_4px_20px_rgba(0,0,0,0.5)] focus-within:border-purple-500 focus-within:ring-purple-900/30'
              : 'bg-white border-gray-200 shadow-md focus-within:border-purple-400 focus-within:ring-purple-50'
              }`}
          >
            {/* Full-width Message Textarea */}
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
              onKeyDown={(e) => {
                // Detect touch/mobile screens
                const isMobile = window.matchMedia("(max-width: 768px)").matches || 'ontouchstart' in window;

                // On desktop: Enter = Send, Shift + Enter = New line
                // On mobile: Enter creates a new line, send only via the Send button
                if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
                  e.preventDefault();
                  if (input.trim() && activeSubject && !isChatting) {
                    handleSendMessage(e);
                    e.target.style.height = 'auto';
                  }
                }
              }}
              disabled={!activeSubject || isChatting}
              placeholder={
                activeSubject
                  ? `Ask about ${activeSubject}...`
                  : 'Select a workspace...'
              }
              rows={1}
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
              }}
              className={`w-full px-2 py-1 sm:px-3 sm:py-1.5 outline-none disabled:bg-transparent text-[14px] sm:text-[15px] bg-transparent resize-none leading-relaxed custom-scrollbar ${isDarkMode
                ? 'text-gray-100 placeholder:text-gray-500'
                : 'text-gray-700 placeholder:text-gray-400'
                }`}
            />

            {/* Bottom Toolbar: Model Selector & Send Button */}
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-transparent">
              {/* Custom Model Selector (Bottom Left) */}
              <div className="relative shrink-0 flex items-center z-50">
                <button
                  type="button"
                  onClick={() => setIsModelOpen(!isModelOpen)}
                  disabled={!activeSubject || isChatting}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[12px] sm:text-[13px] font-semibold rounded-full transition-colors disabled:opacity-50 border ${isDarkMode
                    ? 'bg-[#2A134A] hover:bg-[#3A1B5C] text-purple-300 border-[#4B2275]'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-100'
                    }`}
                >
                  <span className="truncate max-w-[90px] sm:max-w-none">
                    {selectedModel}
                  </span>

                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isModelOpen ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Pop-up Menu */}
                {isModelOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsModelOpen(false)}
                    />

                    <div
                      className={`absolute bottom-full left-0 mb-3 w-48 sm:w-52 border rounded-2xl shadow-xl p-1.5 z-50 ${isDarkMode
                        ? 'bg-[#1C0831]/95 backdrop-blur-md border-[#3A1B5C]'
                        : 'bg-white border-purple-100'
                        }`}
                    >
                      {models.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(m.name);
                            setIsModelOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-colors ${selectedModel === m.name
                            ? isDarkMode
                              ? 'bg-[#2A134A] text-purple-200 font-medium'
                              : 'bg-purple-50 text-purple-900 font-medium'
                            : isDarkMode
                              ? 'text-gray-400 hover:bg-[#2A134A] hover:text-purple-300'
                              : 'text-gray-600 hover:bg-purple-50/50 hover:text-purple-700'
                            }`}
                        >
                          <span>{m.name}</span>

                          <span
                            className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-bold ${selectedModel === m.name
                              ? isDarkMode
                                ? 'text-purple-400'
                                : 'text-purple-500'
                              : isDarkMode
                                ? 'text-gray-500'
                                : 'text-gray-400'
                              }`}
                          >
                            {m.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Send Button (Bottom Right) */}
              <button
                type="submit"
                disabled={!input.trim() || !activeSubject || isChatting}
                className={`flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-colors shrink-0 shadow-sm ${isDarkMode
                  ? 'bg-purple-600 hover:bg-purple-500 text-white disabled:bg-[#2A134A] disabled:text-gray-500'
                  : 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300 disabled:text-gray-500'
                  }`}
              >
                <Send
                  size={15}
                  className="sm:w-[16px] sm:h-[16px] relative right-[1px]"
                />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}