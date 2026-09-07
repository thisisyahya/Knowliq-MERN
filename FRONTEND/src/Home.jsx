import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import {
  Upload,
  Network,
  Target,
  Lock,
  RefreshCcw,
  MessageSquare,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Globe,
  BarChart,
  Brain,
  Activity,
  Code,
  ChevronDown,
  Menu,
  X
} from "lucide-react";

// --- FIREBASE CLIENT CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAfP84dAr-Z_KN3qFiI0JpF860IZrf3MAU",
  authDomain: "cipher-e73e1.firebaseapp.com",
  projectId: "cipher-e73e1",
  storageBucket: "cipher-e73e1.appspot.com",
  messagingSenderId: "530003079642",
  appId: "1:530003079642:web:3aa2c60b064aaf406cd0e3",
};

let app;
let auth;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.warn("Firebase initialization skipped or misconfigured:", e);
}

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Interactive State for Retention Engine Section
  const [activeRetention, setActiveRetention] = useState('red');

  // Interactive State for FAQ
  const [openFaq, setOpenFaq] = useState(null);

  // Mobile nav
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!auth) {
      setIsCheckingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard", { replace: true });
      } else {
        setIsCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/verify`, { token });
      if (res.status === 200) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Auth Failed:", err);
      alert("Auth Error: " + (err.message || "Check console"));
    } finally {
      setLoading(false);
    }
  };

  const closeMobileNavAndScroll = () => setMobileNavOpen(false);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-mono text-sm text-neutral-500">
        Initializing workspace...
      </div>
    );
  }

  // Content for the Interactive Retention Engine
  const retentionData = {
    red: {
      label: "Weak Recall",
      interval: "1-Day Review",
      color: "text-rose-500",
      bgHover: "hover:bg-rose-50",
      borderColor: "border-rose-500",
      dot: "bg-rose-500",
      ring: "ring-rose-500",
      desc: "When a subtopic scores poorly in a mandatory checkpoint, the engine marks it RED. The chat algorithm prioritizes this concept for review exactly 24 hours later, locking progression until mastery is proven.",
      json: `{
  "topic": "Thermodynamics",
  "importance_score": 8.5,
  "times_appeared": 9,
  "total_marks": 45,
  "subtopics": [
    {
      "name": "First Law & Internal Energy",
      "historical_score": 35,
      "retention": "red",
      "last_learned_at": "2026-08-30T10:00:00Z",
      "next_mandatory_review": "2026-08-31"
    }
  ]
}`
    },
    yellow: {
      label: "Moderate Recall",
      interval: "3-Day Review",
      color: "text-yellow-600",
      bgHover: "hover:bg-yellow-50",
      borderColor: "border-yellow-500",
      dot: "bg-yellow-500",
      ring: "ring-yellow-500",
      desc: "Concepts you answered correctly but slowly, or with partial hints, are marked YELLOW. They are scheduled for a secondary test 3 days later to push them from short-term to long-term memory.",
      json: `{
  "topic": "Newtonian Mechanics",
  "importance_score": 6.2,
  "times_appeared": 5,
  "total_marks": 25,
  "subtopics": [
    {
      "name": "Conservation of Momentum",
      "historical_score": 72,
      "retention": "yellow",
      "last_learned_at": "2026-08-30T10:00:00Z",
      "next_mandatory_review": "2026-09-02"
    }
  ]
}`
    },
    green: {
      label: "Strong Mastery",
      interval: "7-Day Review",
      color: "text-emerald-500",
      bgHover: "hover:bg-emerald-50",
      borderColor: "border-emerald-500",
      dot: "bg-emerald-500",
      ring: "ring-emerald-500",
      desc: "Flawless active recall places the subtopic into the GREEN tier. The engine reduces study frequency, surfacing it only after a full 7 days to maintain absolute retention before exam day.",
      json: `{
  "topic": "Kinematics",
  "importance_score": 9.8,
  "times_appeared": 11,
  "total_marks": 60,
  "subtopics": [
    {
      "name": "Projectile Motion",
      "historical_score": 98,
      "retention": "green",
      "last_learned_at": "2026-08-30T10:00:00Z",
      "next_mandatory_review": "2026-09-06"
    }
  ]
}`
    }
  };

  // FAQ Content
  const faqs = [
    {
      q: "What file formats can I upload?",
      a: "Currently, knowLiq supports PDF uploads for past exam papers and marking schemes. Our system scans the documents to extract text, diagrams, and formulas to instantly map out your personalized syllabus."
    },
    {
      q: "How does the AI know my specific curriculum?",
      a: "Standard AI chatbots drift off-topic. knowLiq uses Retrieval-Augmented Generation (RAG) strictly on the past papers you upload. If a concept or formula wasn't in your exams, it won't be tested in your chat."
    },
    {
      q: "Can I skip the tests and just read the notes?",
      a: "No. knowLiq is built to prevent passive reading. Once the AI determines you've reviewed a concept sufficiently, the chat completely freezes until you pass the mandatory active recall test."
    },
    {
      q: "What happens if I get a question wrong during a test?",
      a: "The system grades the subtopic as 'Red' (Weak Recall). The tutor will gently correct your misunderstanding and automatically schedule that exact concept for another review session the very next day."
    },
    {
      q: "Which languages does the tutor support?",
      a: "You can interact with your AI academic counselor in English, Urdu, and Roman Urdu. You are free to switch languages at any point during your study session to match how you learn best."
    }
  ];

  const navLinks = [
    { href: "#method", label: "Methodology" },
    { href: "#engine", label: "Retention Engine" },
    { href: "#features", label: "Core Features" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rise-1 { animation: riseIn 0.8s ease-out 0.05s both; }
        .rise-2 { animation: riseIn 0.8s ease-out 0.15s both; }
        .rise-3 { animation: riseIn 0.8s ease-out 0.25s both; }
        .rise-4 { animation: riseIn 0.8s ease-out 0.35s both; }
        @keyframes pulseRing {
          0%, 100% { opacity: 0.2; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .pulse-ring { animation: pulseRing 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .rise-1, .rise-2, .rise-3, .rise-4, .pulse-ring { animation: none !important; }
        }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ---------------- NAV ---------------- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight">knowLiq</span>
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-indigo-600 mt-1 group-hover:scale-125 transition-transform" />
          </div>

          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-neutral-600">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-indigo-600 transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="hidden md:inline-flex text-sm font-semibold bg-indigo-600 text-white px-6 py-2.5 rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Start your program"}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-neutral-700 hover:bg-neutral-100 active:scale-95 transition-all"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* ---------------- MOBILE NAV OVERLAY ---------------- */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-[82%] max-w-xs bg-white shadow-2xl flex flex-col">
            <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-100">
              <span className="text-lg font-extrabold tracking-tight">knowLiq</span>
              <button
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 active:scale-95 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col px-5 py-6 gap-1 text-base font-semibold text-neutral-800">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileNavAndScroll}
                  className="py-3 border-b border-neutral-100 last:border-none active:text-indigo-600"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto p-5">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  handleGoogleLogin();
                }}
                disabled={loading}
                className="w-full text-sm font-semibold bg-indigo-600 text-white px-6 py-3.5 rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Start your program"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- HERO ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-24 md:pt-32 md:pb-40 grid lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-16 items-center">
        <div className="lg:pr-8">
          <div className="rise-1 text-[11px] sm:text-xs font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3.5 py-2 w-fit rounded-full uppercase mb-5 sm:mb-6 flex items-center gap-2 border border-indigo-100">
            <Network size={14} strokeWidth={2} />
            Adaptive AI Study Program
          </div>
          <h1 className="rise-2 text-[2.15rem] leading-[1.15] sm:text-5xl md:text-6xl sm:leading-[1.1] font-extrabold tracking-tight text-neutral-900">
            Turn past exam papers into an active syllabus.
          </h1>
          <p className="rise-3 text-neutral-600 text-base sm:text-xl mt-5 sm:mt-8 max-w-lg leading-relaxed">
            Upload your PDFs. knowLiq instantly maps out the highest-scoring topics, teaches you in bite-sized Socratic steps, and <span className="font-semibold text-neutral-900">locks the chat for mandatory tests</span> to ensure you actually remember it.
          </p>
          <div className="rise-4 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mt-8 sm:mt-12">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white text-base font-semibold px-8 py-3.5 sm:py-4 rounded-full hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? "Connecting..." : "Upload a past paper"}
              <ArrowRight size={18} strokeWidth={2} />
            </button>
            <a
              href="#engine"
              className="inline-flex items-center justify-center gap-2 text-base font-semibold px-8 py-3.5 sm:py-4 rounded-full border-2 border-neutral-200 text-neutral-700 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
            >
              See how testing works
            </a>
          </div>
        </div>

        {/* Hero Concept Graph */}
        <div className="relative rise-3 w-full max-w-[280px] xs:max-w-sm sm:max-w-lg mx-auto lg:ml-auto">
          <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full" />
          <svg viewBox="0 0 480 460" className="w-full h-auto drop-shadow-2xl" role="img" aria-label="Concept map">
            {[
              [390, 230], [347, 95], [198, 60], [90, 150],
              [90, 310], [198, 400], [347, 365],
            ].map(([x, y], i) => (
              <line key={i} x1="240" y1="230" x2={x} y2={y} stroke="#e5e7eb" strokeWidth="2" />
            ))}

            {/* Center Node */}
            <circle cx="240" cy="230" r="22" fill="#4f46e5" />
            <text x="240" y="234" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" className="font-mono">PHY</text>

            {/* Green Nodes (7-day review) */}
            <circle cx="390" cy="230" r="16" fill="#10b981" />
            <circle cx="347" cy="365" r="16" fill="#10b981" />

            {/* Yellow Nodes (3-day review) */}
            <circle cx="347" cy="95" r="16" fill="white" stroke="#eab308" strokeWidth="4" className="pulse-ring" />
            <circle cx="90" cy="150" r="16" fill="white" stroke="#eab308" strokeWidth="4" className="pulse-ring" />

            {/* Red Nodes (1-day review) */}
            <circle cx="198" cy="60" r="16" fill="white" stroke="#ef4444" strokeWidth="4" />
            <circle cx="90" cy="310" r="16" fill="white" stroke="#ef4444" strokeWidth="4" />
            <circle cx="198" cy="400" r="16" fill="white" stroke="#ef4444" strokeWidth="4" />

            <text x="415" y="234" fontSize="13" fontWeight="600" fill="#374151" className="font-sans">Kinematics</text>
            <text x="370" y="80" fontSize="13" fontWeight="600" fill="#374151" className="font-sans">Circular motion</text>
            <text x="118" y="50" fontSize="13" fontWeight="600" fill="#374151" className="font-sans">Waves</text>
            <text x="10" y="135" fontSize="13" fontWeight="600" fill="#374151" className="font-sans">Newton's laws</text>
            <text x="10" y="335" fontSize="13" fontWeight="600" fill="#374151" className="font-sans">Thermodynamics</text>
            <text x="130" y="435" fontSize="13" fontWeight="600" fill="#374151" className="font-sans">Optics</text>
            <text x="290" y="400" fontSize="13" fontWeight="600" fill="#374151" className="font-sans">Electromagnetism</text>
          </svg>
        </div>
      </section>

      {/* ---------------- METHOD LOOP ---------------- */}
      <section id="method" className="bg-slate-50 py-16 sm:py-24 md:py-32 border-y border-neutral-200 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              No walls of text. <br className="hidden sm:block" /><span className="text-indigo-600">Just active recall.</span>
            </h2>
            <p className="text-neutral-600 text-base sm:text-lg mt-4 sm:mt-6 leading-relaxed">
              Standard chatbots generate long, passive summaries. knowLiq teaches strictly to your past exam weightings, actively checking your understanding at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
            {[
              { icon: Upload, title: "1. Instant Breakdown", desc: "Upload PDFs. The system maps the exact syllabus, finding the highest-scoring and most frequent topics.", colorClass: "text-blue-600 bg-blue-100 border-blue-200", shadowHover: "hover:shadow-blue-500/20" },
              { icon: MessageSquare, title: "2. Bite-Sized Tutoring", desc: "Explains one concept at a time with formatted math formulas, ensuring you understand before moving on.", colorClass: "text-indigo-600 bg-indigo-100 border-indigo-200", shadowHover: "hover:shadow-indigo-500/20" },
              { icon: Lock, title: "3. Chat Freeze", desc: "After a few turns, the chat completely locks. You must pass a quick active recall test to continue learning.", colorClass: "text-rose-600 bg-rose-100 border-rose-200", shadowHover: "hover:shadow-rose-500/20" },
              { icon: Calendar, title: "4. Smart Scheduling", desc: "Your next session is built automatically based on high-yield exam topics and past recall weak spots.", colorClass: "text-emerald-600 bg-emerald-100 border-emerald-200", shadowHover: "hover:shadow-emerald-500/20" },
            ].map((step, i) => (
              <div key={i} className={`bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm transition-all duration-300 hover:-translate-y-1 ${step.shadowHover} hover:shadow-2xl`}>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center mb-5 sm:mb-6 ${step.colorClass}`}>
                  <step.icon size={22} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-neutral-900">{step.title}</h3>
                <p className="text-sm sm:text-base text-neutral-600 mt-2.5 sm:mt-3 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- THE BRAIN / RETENTION ENGINE ---------------- */}
      <section id="engine" className="py-16 sm:py-24 md:py-32 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-center">

            {/* Interactive Left Column */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-5 sm:mb-6 text-indigo-600 font-bold tracking-wide uppercase text-xs sm:text-sm">
                <Brain size={20} strokeWidth={2.5} />
                Spaced Repetition Engine
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                Every topic is graded, tracked, and scheduled.
              </h2>
              <p className="text-neutral-600 text-base sm:text-lg mt-4 sm:mt-6 leading-relaxed">
                Behind the scenes, knowLiq maps your workspace against our rigorous Mongoose schema. Retention is categorized into three strict intervals to prevent the illusion of competence.
              </p>

              {/* Interactive Tabs */}
              <div className="mt-8 sm:mt-10 space-y-3 sm:space-y-4">
                {['red', 'yellow', 'green'].map((key) => {
                  const data = retentionData[key];
                  const isActive = activeRetention === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveRetention(key)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3.5 sm:gap-4 ${
                        isActive
                          ? `bg-white shadow-lg ${data.borderColor}`
                          : `bg-neutral-50 border-transparent ${data.bgHover} hover:border-neutral-200`
                      }`}
                    >
                      <div className={`mt-1 flex-shrink-0 w-3 h-3 rounded-full ${data.dot} ${isActive ? `ring-4 ring-opacity-20 ${data.ring}` : ''}`} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className={`font-bold text-base sm:text-lg ${isActive ? 'text-neutral-900' : 'text-neutral-700'}`}>
                            {data.label}
                          </span>
                          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-neutral-100 ${data.color}`}>
                            {data.interval}
                          </span>
                        </div>
                        {isActive && (
                          <p className="text-neutral-600 text-sm mt-2.5 sm:mt-3 leading-relaxed">
                            {data.desc}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated Live Database Window */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden bg-slate-950 shadow-2xl shadow-slate-900/50 border border-slate-800">
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex gap-1.5 flex-shrink-0">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="ml-3 sm:ml-4 font-mono text-[11px] sm:text-xs text-slate-400 flex items-center gap-2 truncate">
                      <Code size={13} className="flex-shrink-0" /> <span className="truncate">workspace_schema.json</span>
                    </span>
                  </div>
                  <span className="hidden xs:flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded flex-shrink-0">
                    <Activity size={11} /> Live Sync
                  </span>
                </div>
                <div className="p-4 sm:p-6 md:p-8 overflow-x-auto">
                  <pre className="font-mono text-[11px] leading-relaxed sm:text-sm text-indigo-200">
                    <code className="block" key={activeRetention}>
                      {retentionData[activeRetention].json}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- CORE FEATURES ---------------- */}
      <section id="features" className="py-16 sm:py-24 md:py-32 bg-slate-50 border-t border-neutral-200 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              Built to ensure material is <br className="hidden sm:block" />actually remembered.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-white border border-neutral-200 rounded-3xl p-3 sm:p-6 shadow-xl shadow-neutral-200/50">
            {[
              { icon: BarChart, title: "Dedicated Academic Counselor", desc: "Ask high-level questions anytime—like 'What are my weak areas?' or 'What did I study 5 days ago?'—for an immediate progress report." },
              { icon: Globe, title: "Multi-Language Support", desc: "Fully supports explanations and interactive tutoring in English, Urdu, and Roman Urdu to match how you learn best." },
              { icon: Target, title: "Strictly Curriculum Focused", desc: "Standard AI easily drifts off-topic. knowLiq is strictly locked to past exam weightings and required formulas." },
              { icon: RefreshCcw, title: "Automated Review Cycles", desc: "Forgets nothing across sessions. Your retention is tracked via a strict 1-day (Red), 3-day (Yellow), and 7-day (Green) interval." },
            ].map((f, i) => (
              <div key={i} className="group bg-slate-50 p-6 sm:p-10 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/50 transition-all duration-300">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-5 sm:mb-6 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                  <f.icon size={22} strokeWidth={2} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900">{f.title}</h3>
                <p className="text-sm sm:text-base text-neutral-600 mt-2.5 sm:mt-3 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="py-16 sm:py-24 md:py-32 bg-white border-t border-neutral-200 scroll-mt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`border rounded-2xl transition-colors duration-300 ${isOpen ? 'border-indigo-200 bg-indigo-50/30' : 'border-neutral-200 bg-white hover:border-indigo-100'}`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4"
                  >
                    <span className="font-bold text-neutral-900 text-base sm:text-lg">{faq.q}</span>
                    <ChevronDown
                      size={20}
                      className={`flex-shrink-0 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-neutral-600 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="bg-slate-950 text-white relative overflow-hidden py-20 sm:py-28 md:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] sm:w-[1000px] sm:h-[500px] bg-indigo-600/30 rounded-full blur-[120px] sm:blur-[150px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Stop passively reading. <br /><span className="text-indigo-400">Start actively recalling.</span>
          </h2>
          <p className="text-indigo-200/70 text-base sm:text-xl mt-6 sm:mt-8 max-w-2xl mx-auto leading-relaxed">
            Create your first workspace and upload a past paper to generate your adaptive study schedule today.
          </p>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="inline-flex items-center justify-center gap-3 bg-indigo-500 text-white text-base sm:text-lg font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-full mt-10 sm:mt-12 hover:bg-indigo-400 transition-all shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 disabled:opacity-50 w-full sm:w-auto"
          >
            {loading ? "Authenticating..." : "Create a workspace"}
            <ArrowUpRight size={20} strokeWidth={3} />
          </button>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-neutral-900">knowLiq</span>
            <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1" />
          </div>
          <p className="font-mono text-xs sm:text-sm text-neutral-500">
            © {new Date().getFullYear()} knowLiq. Bite-sized interactive tutoring.
          </p>
        </div>
      </footer>
    </div>
  );
}