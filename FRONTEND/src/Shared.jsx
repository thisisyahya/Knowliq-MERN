import React, { useState, useEffect, useRef, memo } from "react";
import { useParams } from "react-router-dom";
import { Copy, Check, Sun, Moon } from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import axios from "axios";
import PythonRunner from "./components/PythonRunner";

const GalaxyBackground = ({ isDarkMode }) => {
  if (!isDarkMode) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1B053A]/40 via-[#0B0014]/80 to-[#0B0014]"></div>
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => {
          const size = Math.random() * 2.5 + 0.5;
          const isSpark = Math.random() > 0.85;
          const dx1 = `${(Math.random() - 0.5) * 50}px`;
          const dy1 = `${(Math.random() - 0.5) * 50}px`;
          const dx2 = `${(Math.random() - 0.5) * 50}px`;
          const dy2 = `${(Math.random() - 0.5) * 50}px`;

          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${isSpark ? size * 1.5 : size}px`,
                height: `${isSpark ? size * 1.5 : size}px`,
                backgroundColor: isSpark ? '#d8b4fe' : '#ffffff',
                boxShadow: isSpark
                  ? '0 0 8px 2px rgba(168, 85, 247, 0.6)'
                  : (Math.random() > 0.5 ? '0 0 3px 1px rgba(255, 255, 255, 0.3)' : 'none'),
                '--dx1': dx1,
                '--dy1': dy1,
                '--dx2': dx2,
                '--dy2': dy2,
                animation: `drift-and-twinkle ${15 + Math.random() * 20}s ease-in-out infinite`,
                animationDelay: `-${Math.random() * 30}s`
              }}
            />
          );
        })}
      </div>
      <style>{`
        @keyframes drift-and-twinkle {
          0%, 100% { opacity: 0.1; transform: translate(0, 0) scale(0.8); }
          33% { opacity: 1; transform: translate(var(--dx1), var(--dy1)) scale(1.3); }
          66% { opacity: 0.4; transform: translate(var(--dx2), var(--dy2)) scale(0.9); }
        }
      `}</style>
    </div>
  );
};

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

    // 1. Fix the "ext" space eating bug
    formatted = formatted.replace(/(?:\\text|\text|ext|\t ext)\s*\{([^}]+)\}/g, '\\text{$1}');

    // 2. FIX THE SQUEEZED MATH
    // KaTeX squashes fractions/roots when it thinks math is "inline" (\textstyle).
    // We inject \displaystyle into every format to force full-size expansion.

    // Convert \[ ... \] to block math
    formatted = formatted.replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
      return `$$\\displaystyle ${math}$$`;
    });

    // Convert \( ... \) to inline math WITH full sizing
    formatted = formatted.replace(/\\\(([\s\S]*?)\\\)/g, (match, math) => {
      return `$\\displaystyle ${math}$`;
    });

    // Catch native $$...$$ and inject if missing
    formatted = formatted.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
      return math.includes('\\displaystyle') ? match : `$$\\displaystyle ${math}$$`;
    });

    // Catch native $...$ and inject if missing 
    formatted = formatted.replace(/(^|[^\$])\$([^\$]+)\$(?!\$)/g, (match, prefix, math) => {
      return math.includes('\\displaystyle') ? match : `${prefix}$\\displaystyle ${math}$`;
    });

    return formatted;
  };
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-4 relative z-10`}>
      <div className="flex flex-col max-w-[90%] sm:max-w-3xl min-w-[100px]">
        <div
          className={`relative px-4 sm:px-5 py-3 sm:py-3.5 text-[14px] sm:text-[15px] leading-relaxed shadow-sm break-words overflow-x-auto ${
            isUser
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
              rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false, errorColor: "#374151" }]]}
              components={{
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
                      <code className={className} {...props}>{children}</code>
                    </pre>
                  ) : (
                    <code className={`${isDarkMode ? 'bg-[#220938] text-purple-300' : 'bg-gray-100 text-purple-700'} px-1.5 py-0.5 rounded text-xs font-mono break-words`} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
              className={`prose prose-sm max-w-none prose-p:my-1 w-full ${isDarkMode
                  ? 'prose-invert max-w-none prose-strong:!text-white prose-headings:!text-white [&_strong]:!text-white [&_b]:!text-white [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_a]:!text-purple-400 [&_table]:!bg-transparent [&_th]:!bg-[#2A134A] [&_td]:!bg-transparent [&_th]:!border-[#3A1B5C] [&_td]:!border-[#3A1B5C] [&_tr]:!border-[#3A1B5C] [&_th]:!text-white [&_td]:!text-gray-200'
                  : ''
                }`}
            >
              {formatLaTeX(msg?.text || "")}
            </ReactMarkdown>
          )}
        </div>

        {!isUser && (
          <div className="flex justify-start mt-1.5 ml-1">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${isDarkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-400 hover:text-purple-600'}`}
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
        )}
      </div>
    </div>
  );
});

export default function SharedWorkspace() {
  const { shared_workspace_id } = useParams();
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    async function loadSharedChat() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/chat/shared/${encodeURIComponent(shared_workspace_id)}`
        );

        if (res.data.success === "true" || res.data.success === true) {
          const dbChats = res.data.data;
          
          if (!dbChats || dbChats.length === 0) {
            setChatHistory([{ sender: "ai", text: "This shared workspace is empty or does not exist." }]);
            setIsLoading(false);
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
        console.error("Failed to fetch shared chat:", error);
        setChatHistory([{ sender: "ai", text: "Failed to load the shared conversation." }]);
      } finally {
        setIsLoading(false);
      }
    }

    if (shared_workspace_id) {
      loadSharedChat();
    }
  }, [shared_workspace_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  return (
    <div className={`h-[100dvh] w-screen overflow-hidden flex flex-col transition-colors duration-200 relative ${isDarkMode ? 'bg-[#0B0014]' : 'bg-[#f8f9fa]'}`}>
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#3A1B5C' : '#cbd5e1'}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? '#5B298E' : '#94a3b8'}; }
        * { scrollbar-width: thin; scrollbar-color: ${isDarkMode ? '#3A1B5C transparent' : '#cbd5e1 transparent'}; }
      `}</style>

      <GalaxyBackground isDarkMode={isDarkMode} />

      {/* Header */}
      <div className={`backdrop-blur-md border-b shrink-0 w-full h-[72px] px-6 sm:px-8 flex items-center justify-between z-20 sticky top-0 ${isDarkMode ? 'bg-[#150524]/60 border-[#2C1245]' : 'bg-white/80 border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <h1 className={`font-bold text-xl tracking-tight font-poppins ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            know<span className={isDarkMode ? "text-purple-400" : "text-purple-600"}>Liq</span>
            <span className={`ml-3 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md border ${isDarkMode ? 'bg-[#2A134A] text-purple-300 border-[#3A1B5C]' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
              Read Only
            </span>
          </h1>
        </div>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-full transition-colors flex items-center justify-center shrink-0 ${isDarkMode ? 'text-purple-400 hover:bg-[#220938] hover:text-purple-300' : 'text-purple-600 hover:bg-purple-50'}`}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Chat Messages */}
      <div className="w-full flex-1 overflow-y-auto px-3 sm:px-8 pt-4 sm:pt-6 pb-28 sm:pb-32 scroll-smooth relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col">
          {isLoading ? (
            <div className={`w-full text-center mt-10 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Loading shared workspace...
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <MemoizedChatBubble key={idx} msg={msg} isDarkMode={isDarkMode} />
            ))
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* Read-Only Footer Label */}
      <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t pt-6 pb-6 px-4 sm:px-8 z-20 pointer-events-none ${isDarkMode ? 'from-[#0B0014] via-[#0B0014]/95 to-transparent' : 'from-[#f8f9fa] via-[#f8f9fa]/95 to-transparent'}`}>
        <div className={`max-w-3xl mx-auto flex items-center justify-center border rounded-2xl py-3 px-4 shadow-sm pointer-events-auto transition-colors ${isDarkMode ? 'bg-[#150524]/90 backdrop-blur-md border-[#3A1B5C] text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
          <span className="text-sm font-medium">You can't edit in shared conversation in read mode.</span>
        </div>
      </div>
    </div>
  );
}