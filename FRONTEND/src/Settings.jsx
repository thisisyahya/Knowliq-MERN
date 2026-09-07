import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  User, Palette, Globe, BrainCircuit, BookOpen, Sun, Moon, Save, X, CheckCircle2,
  LogOut, Loader2, AlignLeft
} from "lucide-react";

// Exactly 13 languages, including Urdu
const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Urdu"
];

const LEARNER_TYPES = [
  { 
    id: "visual", 
    label: "The Visual & Analogy Mode", 
    desc: "Maps abstract digital concepts to physical, highly-visible real-world systems (like engines or plumbing)." 
  },
  { 
    id: "socratic", 
    label: "The Interactive Socratic Mode", 
    desc: "Turns passive reading into an active feedback loop, ending every response with a targeted question." 
  },
  { 
    id: "concise", 
    label: "The 'To-The-Point' Mode", 
    desc: "High information density with zero fluff. Bullet points and bold key terms under 150 words." 
  },
];

const FIELDS_OF_STUDY = [
  { id: "technical", label: "Technical & STEM", desc: "Physics, Chemistry, Math, Thermodynamics, etc." },
  { id: "non-technical", label: "Theory & Humanities", desc: "Biology, Psychology, Philosophy, History, etc." },
];

const STRUCTURE_OPTIONS = [
  { id: "detailed", label: "Detailed", desc: "Comprehensive, in-depth breakdowns." },
  { id: "normal", label: "Normal", desc: "Reduces cost by 30%, keeping the answer quality as it is." },
];

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize state directly from LocalStorage
  const [learnerType, setLearnerType] = useState(() => localStorage.getItem("learnerType") || "visual");
  const [preferredLanguage, setPreferredLanguage] = useState(() => localStorage.getItem("preferredLanguage") || "");
  const [fieldOfStudy, setFieldOfStudy] = useState(() => localStorage.getItem("fieldOfStudy") || "technical");
  const [answerStructure, setAnswerStructure] = useState(() => localStorage.getItem("answerStructure") || "normal");
  
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  // Immediate theme application
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Auth check (No backend fetch for settings anymore)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName || "Anonymous User",
          email: currentUser.email,
          avatar: currentUser.photoURL || "https://ui-avatars.com/api/?name=User&background=6b21a8&color=fff",
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveSettings = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    
    // 1. Save to LocalStorage immediately
    localStorage.setItem("learnerType", learnerType);
    localStorage.setItem("preferredLanguage", preferredLanguage);
    localStorage.setItem("fieldOfStudy", fieldOfStudy);
    localStorage.setItem("answerStructure", answerStructure);

    // 2. Send to Backend
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/users/settings`,
        { learnerType, preferredLanguage, fieldOfStudy, answerStructure, theme: isDarkMode ? "dark" : "light" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Error saving settings to cloud. Local settings applied.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-[100dvh] flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#0B0014]' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
        <p className="text-purple-600 text-sm font-medium animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] py-8 px-4 sm:px-8 md:px-12 transition-colors duration-200 font-sans ${isDarkMode ? 'bg-[#0B0014] text-white' : 'bg-slate-50 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className={`pb-4 border-b ${isDarkMode ? 'border-[#2C1245]' : 'border-gray-200'}`}>
          <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Account Settings</h1>
        </div>

        {/* 1. Profile Section */}
        <section className={`rounded-2xl p-6 shadow-sm border ${isDarkMode ? 'bg-[#150524] border-[#2C1245]' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-5">
            <User className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className="text-lg font-semibold">Profile Details</h2>
          </div>
          
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${isDarkMode ? 'bg-[#1A0B2E] border-[#2C1245]' : 'bg-gray-50 border-gray-100'}`}>
            <img src={user?.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <p className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${isDarkMode ? 'text-purple-300/60' : 'text-gray-400'}`}>Google Account</p>
              <h3 className="font-bold text-lg">{user?.name}</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
            </div>
          </div>
        </section>

        {/* 2. Theme Selection */}
        <section className={`rounded-2xl p-6 shadow-sm border ${isDarkMode ? 'bg-[#150524] border-[#2C1245]' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Palette className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>

          <div className={`flex p-1 rounded-lg max-w-[240px] ${isDarkMode ? 'bg-[#1A0B2E]' : 'bg-gray-100'}`}>
            <button
              onClick={() => setIsDarkMode(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md font-medium transition-all ${
                !isDarkMode ? "bg-white text-purple-700 shadow-sm" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
            <button
              onClick={() => setIsDarkMode(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md font-medium transition-all ${
                isDarkMode ? "bg-[#3A1B5C] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
          </div>
        </section>

        {/* 3. What kind of learner are you */}
        <section className={`rounded-2xl p-6 shadow-sm border ${isDarkMode ? 'bg-[#150524] border-[#2C1245]' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className="text-lg font-semibold">What kind of learner are you?</h2>
          </div>

          <div className="flex flex-col gap-3">
            {LEARNER_TYPES.map((type) => {
              const isSelected = learnerType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setLearnerType(type.id)}
                  className={`relative flex flex-col p-4 rounded-xl text-left transition-all border ${
                    isSelected
                      ? isDarkMode ? "border-[#5B298E] bg-[#220938]" : "border-purple-500 bg-purple-50"
                      : isDarkMode ? "border-[#2C1245] bg-[#1A0B2E] hover:border-[#3A1B5C]" : "border-gray-100 bg-white hover:border-purple-200"
                  }`}
                >
                  <h3 className={`text-sm font-semibold pr-6 ${isSelected ? (isDarkMode ? "text-purple-300" : "text-purple-700") : (isDarkMode ? "text-gray-200" : "text-gray-700")}`}>
                    {type.label}
                  </h3>
                  <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{type.desc}</p>
                  {isSelected && <CheckCircle2 className="absolute top-4 right-4 w-4 h-4 text-purple-500 opacity-80" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Structured Answers (Detailed vs Normal) */}
        <section className={`rounded-2xl p-6 shadow-sm border ${isDarkMode ? 'bg-[#150524] border-[#2C1245]' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-4">
            <AlignLeft className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className="text-lg font-semibold">Structured Answers</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STRUCTURE_OPTIONS.map((opt) => {
              const isSelected = answerStructure === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setAnswerStructure(opt.id)}
                  className={`relative flex flex-col p-4 rounded-xl text-left transition-all border ${
                    isSelected
                      ? isDarkMode ? "border-[#5B298E] bg-[#220938]" : "border-purple-500 bg-purple-50"
                      : isDarkMode ? "border-[#2C1245] bg-[#1A0B2E] hover:border-[#3A1B5C]" : "border-gray-100 bg-white hover:border-purple-200"
                  }`}
                >
                  <h3 className={`text-sm font-semibold ${isSelected ? (isDarkMode ? "text-purple-300" : "text-purple-700") : (isDarkMode ? "text-gray-200" : "text-gray-700")}`}>
                    {opt.label}
                  </h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{opt.desc}</p>
                  {isSelected && <CheckCircle2 className="absolute top-4 right-4 w-4 h-4 text-purple-500 opacity-80" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Field of Study */}
        <section className={`rounded-2xl p-6 shadow-sm border ${isDarkMode ? 'bg-[#150524] border-[#2C1245]' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className="text-lg font-semibold">Field of Study</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FIELDS_OF_STUDY.map((field) => {
              const isSelected = fieldOfStudy === field.id;
              return (
                <button
                  key={field.id}
                  onClick={() => setFieldOfStudy(field.id)}
                  className={`relative p-4 rounded-xl text-left transition-all border ${
                    isSelected
                      ? isDarkMode ? "border-[#5B298E] bg-[#220938]" : "border-purple-500 bg-purple-50"
                      : isDarkMode ? "border-[#2C1245] bg-[#1A0B2E] hover:border-[#3A1B5C]" : "border-gray-100 bg-white hover:border-purple-200"
                  }`}
                >
                  <h3 className={`text-sm font-semibold ${isSelected ? (isDarkMode ? "text-purple-300" : "text-purple-700") : (isDarkMode ? "text-gray-200" : "text-gray-700")}`}>
                    {field.label}
                  </h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{field.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 6. Preferred Language */}
        <section className={`rounded-2xl p-6 shadow-sm border ${isDarkMode ? 'bg-[#150524] border-[#2C1245]' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className="text-lg font-semibold">Communication Language</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = preferredLanguage === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setPreferredLanguage(isSelected ? "" : lang)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                    isSelected
                      ? "border-purple-600 bg-purple-600 text-white shadow-sm"
                      : isDarkMode 
                        ? "border-[#3A1B5C] bg-[#1A0B2E] text-gray-300 hover:border-purple-400 hover:text-purple-300" 
                        : "border-gray-200 bg-white text-gray-700 hover:border-purple-400 hover:text-purple-600"
                  }`}
                >
                  {lang}
                  {isSelected && (
                    <div className="p-0.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors">
                      <X className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Footer Actions (Save & Logout inline) */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 pb-8">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut size={16} /> Log Out
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto justify-center shadow-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}