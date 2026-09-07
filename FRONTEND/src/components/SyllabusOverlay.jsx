import React, { useState, useEffect } from "react";
import { X, BookOpen, AlertCircle, Clock, Target, Info, Flame, ChevronDown } from "lucide-react";
import axios from "axios";

// Helper to normalize scores (converts 0.33 to 33, while keeping 33 as 33)
const normalizeScore = (val) => {
  if (!val) return 0;
  return val <= 1 && val > 0 ? Math.round(val * 100) : Math.round(val);
};

// Helper to calculate probability based on retention rules and elapsed time
const calculateProbability = (subtopic, topicImportance) => {
  if (subtopic.retention === 'untested' || !subtopic.last_learned_at) {
    return { percent: 95, label: 'Very High' };
  }

  const daysSince = (new Date() - new Date(subtopic.last_learned_at)) / (1000 * 60 * 60 * 24);
  let threshold = 7; // green default
  
  if (subtopic.retention === 'red') threshold = 2;
  else if (subtopic.retention === 'yellow') threshold = 3;

  let baseProb = 0;
  
  if (daysSince >= threshold) {
    // Overdue for review - high probability
    baseProb = 75 + Math.min(15, (daysSince - threshold) * 5); 
  } else {
    // Not due yet - scales based on how close it is
    baseProb = Math.max(5, (daysSince / threshold) * 40);
  }

  // Importance score acts as a weight multiplier
  const normalizedImportance = normalizeScore(topicImportance);
  const importanceWeight = (normalizedImportance || 50) / 100;
  
  const finalProb = Math.min(99, Math.round(baseProb + (importanceWeight * 20)));

  let label = 'Low';
  if (finalProb >= 75) label = 'High';
  else if (finalProb >= 40) label = 'Medium';

  return { percent: finalProb, label };
};

const RetentionBadge = ({ retention }) => {
  const config = {
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-500', label: 'Poor' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-500', label: 'Good' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-500', label: 'Excellent' },
    untested: { bg: 'bg-zinc-800', border: 'border-zinc-700', text: 'text-zinc-400', label: 'Untested' }
  };
  
  const style = config[retention] || config.untested;

  return (
    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded border ${style.bg} ${style.border} ${style.text}`}>
      {style.label}
    </span>
  );
};

export default function SyllabusOverlay({ isOpen, onClose, workspaceId, token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState({});

  useEffect(() => {
    if (!isOpen || !workspaceId) return;

    const fetchWorkspace = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/${encodeURIComponent(workspaceId)}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const workspacePayload = res.data.workspace || res.data;

        if (!workspacePayload) {
          throw new Error("Empty workspace data received.");
        }

        setData(workspacePayload);
        
        // Auto-expand the first topic by default
        if (workspacePayload.detailedTopics?.length > 0) {
          setExpandedTopics({ 0: true });
        }
      } catch (err) {
        console.error("Frontend fetch error details:", err);
        setError(err.response?.data?.message || err.message || "Failed to load syllabus data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [isOpen, workspaceId, token]);

  const toggleTopic = (index) => {
    setExpandedTopics(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl h-[90vh] bg-black border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-zinc-800 shrink-0 bg-black z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <BookOpen size={20} className="text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Syllabus Overview</h2>
              <p className="text-xs sm:text-sm text-zinc-400">{data?.subject || "Loading subject..."}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Compact Mobile-Friendly Legend */}
        <div className="px-4 sm:px-6 py-3 bg-[#0a0a0a] border-b border-zinc-800 shrink-0 z-20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 shrink-0">
              <Info size={14} className="text-purple-500" />
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">AI Reviews In:</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"></span>
                <span className="text-zinc-300">Poor <strong className="text-red-400">2d</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]"></span>
                <span className="text-zinc-300">Good <strong className="text-yellow-400">3d</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]"></span>
                <span className="text-zinc-300">Excellent <strong className="text-green-400">7d</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-400 text-sm">Analyzing syllabus data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-red-400">
              <AlertCircle size={32} />
              <p>{error}</p>
            </div>
          ) : data?.detailedTopics?.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
              No detailed topics found for this workspace.
            </div>
          ) : (
            <div className="flex flex-col p-4 sm:p-6 gap-4">
              {data?.detailedTopics?.map((topic, tIdx) => {
                const isExpanded = !!expandedTopics[tIdx];
                const displayImportance = normalizeScore(topic.importance_score);

                return (
                  <div key={tIdx} className="rounded-xl border border-zinc-800 bg-[#050505] flex flex-col">
                    
                    {/* Accordion / Sticky Topic Header */}
                    <div 
                      onClick={() => toggleTopic(tIdx)}
                      className={`sticky top-0 z-10 px-4 sm:px-5 py-4 bg-[#0a0a0a] flex items-center justify-between gap-4 cursor-pointer hover:bg-[#111] transition-colors ${
                        isExpanded ? 'border-b border-zinc-800 rounded-t-xl' : 'rounded-xl'
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className="text-[15px] sm:text-base font-bold text-white leading-tight">
                          {topic.topic}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-zinc-400">
                            <Flame size={12} className="text-purple-500" />
                            Importance: <span className="text-zinc-200 font-medium">{displayImportance}/100</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-zinc-400">
                            <Target size={12} className="text-purple-500" />
                            Marks: <span className="text-zinc-200 font-medium">{topic.total_marks}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-1.5 bg-zinc-900 rounded-md shrink-0">
                        <ChevronDown 
                          size={18} 
                          className={`text-zinc-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* Subtopics List (Expanded Content with Indentation) */}
                    {isExpanded && (
                      <div className="px-3 sm:px-5 pb-4 pt-3 bg-[#020202] rounded-b-xl">
                        {/* Left Indentation Border Wrapper */}
                        <div className="flex flex-col border-l-[2px] border-zinc-800/60 ml-2 sm:ml-3 pl-3 sm:pl-4 gap-1.5">
                          {topic.subtopics?.map((sub, sIdx) => {
                            const completion = Math.round((sub.historical_score || 0) * 100);
                            const prob = calculateProbability(sub, displayImportance);
                            
                            return (
                              <div key={sIdx} className="px-3 sm:px-4 py-3 hover:bg-[#0a0a0a] rounded-xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border border-transparent hover:border-zinc-800/50">
                                
                                {/* Left: Name & Status */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                    <h4 className="text-[13px] sm:text-sm font-medium text-zinc-300 leading-tight">
                                      {sub.name}
                                    </h4>
                                    <RetentionBadge retention={sub.retention} />
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 max-w-[200px] h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-purple-500 rounded-full relative" 
                                        style={{ width: `${completion}%` }}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                      </div>
                                    </div>
                                    <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium min-w-[32px]">
                                      {completion}%
                                    </span>
                                  </div>
                                </div>

                                {/* Right: Metrics */}
                                <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 shrink-0 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/80 lg:bg-transparent lg:border-none lg:p-0 mt-1 lg:mt-0">
                                  <div className="flex flex-col">
                                    <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-0.5 sm:mb-1 flex items-center gap-1">
                                      <Clock size={10} /> Studied
                                    </span>
                                    <span className="text-[11px] sm:text-xs text-zinc-300 font-medium">
                                      {sub.last_learned_at 
                                        ? new Date(sub.last_learned_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) 
                                        : 'Never'}
                                    </span>
                                  </div>

                                  <div className="w-px h-6 bg-zinc-800 hidden sm:block" />

                                  <div className="flex flex-col items-end sm:items-start">
                                    <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-0.5 sm:mb-1">
                                      Probability
                                    </span>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                      <span className={`text-xs sm:text-sm font-bold ${
                                        prob.percent >= 75 ? 'text-purple-400' : prob.percent >= 40 ? 'text-purple-400/70' : 'text-zinc-400'
                                      }`}>
                                        {prob.percent}%
                                      </span>
                                      <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border ${
                                        prob.percent >= 75 ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' 
                                        : prob.percent >= 40 ? 'border-zinc-700 bg-zinc-800 text-zinc-300' 
                                        : 'border-zinc-800 bg-black text-zinc-500'
                                      }`}>
                                        {prob.label}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Scrollbar styling for the overlay specifically */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}