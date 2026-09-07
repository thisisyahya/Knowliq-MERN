import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Adjust path to your firebase config
import axios from "axios";
import {
  Loader2,
  TrendingUp,
  BrainCircuit,
  Target,
  Calendar,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

export default function TestStats() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/test/test-stats`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.data.success === "true") {
            setStats(res.data.stats);
          } else {
            throw new Error(res.data.error || "Failed to load analytics.");
          }
        } catch (err) {
          console.error("Failed to fetch stats:", err);
          setError(err.message || "Something went wrong.");
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090514] flex flex-col items-center justify-center text-purple-200">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
        <p className="text-lg font-medium animate-pulse">Loading your analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#090514] flex flex-col items-center justify-center text-red-400 p-6 text-center">
        <AlertCircle className="w-16 h-16 mb-4 opacity-80" />
        <h2 className="text-2xl font-bold mb-2 text-white">Oops!</h2>
        <p className="mb-6">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl transition-colors font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Safely extract the new grouped data structure
  const { overall, workspaces } = stats || {
    overall: { totalTestsTaken: 0, retentionSummary: { green: 0, yellow: 0, red: 0 } },
    workspaces: [],
  };

  const totalEvaluated = overall.retentionSummary.green + overall.retentionSummary.yellow + overall.retentionSummary.red;
  const masteryRate = totalEvaluated ? Math.round((overall.retentionSummary.green / totalEvaluated) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#090514] text-gray-200 p-6 md:p-12 font-sans selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-600 mb-3">
            Performance Analytics
          </h1>
          <p className="text-[#8A7AAB] text-lg max-w-2xl">
            Track your diagnostic evaluations, topic mastery, and monitor your progress over time.
          </p>
        </header>

        {/* Top Overview Cards (Overall Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#130A2A] border border-[#2E1A47] rounded-2xl p-6 shadow-2xl shadow-black/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BrainCircuit size={64} className="text-purple-500" />
            </div>
            <p className="text-sm font-semibold text-purple-400 mb-2 uppercase tracking-wider">Total Diagnostics</p>
            <p className="text-5xl font-black text-white mb-1">{overall.totalTestsTaken}</p>
            <p className="text-sm text-[#8A7AAB]">Tests completed</p>
          </div>

          <div className="bg-[#130A2A] border border-[#2E1A47] rounded-2xl p-6 shadow-2xl shadow-black/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target size={64} className="text-green-500" />
            </div>
            <p className="text-sm font-semibold text-purple-400 mb-2 uppercase tracking-wider">Mastery Rate</p>
            <p className="text-5xl font-black text-green-400 mb-1">{masteryRate}%</p>
            <p className="text-sm text-[#8A7AAB]">Overall retention score</p>
          </div>

          <div className="bg-[#130A2A] border border-[#2E1A47] rounded-2xl p-6 shadow-2xl shadow-black/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={64} className="text-purple-500" />
            </div>
            <p className="text-sm font-semibold text-purple-400 mb-2 uppercase tracking-wider">Topics Mastered</p>
            <p className="text-5xl font-black text-white mb-1">{overall.retentionSummary.green}</p>
            <p className="text-sm text-[#8A7AAB]">Concepts heavily retained</p>
          </div>
        </div>

        {/* Retention Breakdown Bar (Overall Stats) */}
        <section className="bg-[#130A2A] border border-[#2E1A47] rounded-2xl p-6 md:p-8 mb-10 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            Overall Knowledge Distribution
          </h2>
          
          <div className="w-full h-4 rounded-full bg-[#20133A] flex overflow-hidden mb-6">
            <div 
              style={{ width: `${totalEvaluated ? (overall.retentionSummary.green / totalEvaluated) * 100 : 0}%` }} 
              className="bg-green-500 h-full transition-all duration-1000"
            />
            <div 
              style={{ width: `${totalEvaluated ? (overall.retentionSummary.yellow / totalEvaluated) * 100 : 0}%` }} 
              className="bg-yellow-500 h-full transition-all duration-1000"
            />
            <div 
              style={{ width: `${totalEvaluated ? (overall.retentionSummary.red / totalEvaluated) * 100 : 0}%` }} 
              className="bg-red-500 h-full transition-all duration-1000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-[#1B0F36] p-3 rounded-lg border border-[#2E1A47]">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
              <div>
                <p className="text-sm text-[#8A7AAB]">Mastered (Green)</p>
                <p className="font-bold text-white text-lg">{overall.retentionSummary.green}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#1B0F36] p-3 rounded-lg border border-[#2E1A47]">
              <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]"></div>
              <div>
                <p className="text-sm text-[#8A7AAB]">Review Needed (Yellow)</p>
                <p className="font-bold text-white text-lg">{overall.retentionSummary.yellow}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#1B0F36] p-3 rounded-lg border border-[#2E1A47]">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
              <div>
                <p className="text-sm text-[#8A7AAB]">Critical Gap (Red)</p>
                <p className="font-bold text-white text-lg">{overall.retentionSummary.red}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Organized Workspace History List */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Diagnostics by Workspace</h2>
          
          {workspaces.length === 0 ? (
            <div className="text-center py-16 bg-[#130A2A] border border-[#2E1A47] rounded-2xl">
              <p className="text-[#8A7AAB] text-lg">You haven't taken any tests yet.</p>
              <button 
                onClick={() => navigate("/dashboard")}
                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                Go to a Workspace
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {workspaces.map((workspace) => (
                <div key={workspace.subject} className="space-y-4">
                  
                  {/* Subject Title Header */}
                  <h3 className="text-xl font-bold text-purple-300 border-b border-[#2E1A47] pb-3 mb-4 flex items-center gap-2">
                    {workspace.subject}
                    <span className="text-sm font-normal text-[#8A7AAB] bg-[#1B0F36] px-2 py-0.5 rounded-md border border-[#2E1A47]">
                      {workspace.totalTestsTaken} Tests
                    </span>
                  </h3>

                  {/* Tests for this Subject */}
                  {workspace.recentHistory.map((test) => (
                    <div 
                      key={test.test_id} 
                      className="bg-[#130A2A] border border-[#2E1A47] hover:border-purple-600/50 transition-colors rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-6"
                    >
                      {/* Left: Meta info */}
                      <div className="md:w-1/4 shrink-0">
                        <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                          <Calendar size={14} className="text-purple-400" />
                          {new Date(test.date).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </div>
                        <div className="text-xs text-[#8A7AAB]">
                          {test.totalQuestions} Questions evaluated
                        </div>
                      </div>

                      {/* Right: Subtopics Evaluated */}
                      <div className="md:w-3/4 flex flex-wrap gap-2">
                        {test.evaluations.map((ev, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#090514] border border-[#2E1A47] text-sm text-gray-300"
                          >
                            <span className={`w-2 h-2 rounded-full ${
                              ev.retention === 'green' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                              ev.retention === 'yellow' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]' :
                              'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                            }`}></span>
                            {ev.subtopic_name}
                          </div>
                        ))}
                        {test.evaluations.length === 0 && (
                          <span className="text-sm text-[#8A7AAB] italic">No topics evaluated yet.</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}