import { 
  X, 
  MessageCircleWarning, 
  FileText, 
  CheckCircle, 
  Loader2, 
  Sparkles, 
  Copy 
} from "lucide-react";
import React, { useState } from "react";
import axios from 'axios';
import { auth } from "../../firebase";

export default function CreateWorkspace({ isOpen, onClose }) {
  const [Loading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // States for Gemini Tip section
  const [showGeminiTip, setShowGeminiTip] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic Prompt (injects subject if user typed it)
  const geminiPrompt = `I want to master ${subject?.trim() ? `[${subject.trim()}]` : '[SUBJECT NAME]'} by practicing exam-style questions, but I do not have past papers or a question bank. I only have the textbook/material.
Analyze the provided material and create 10 realistic, high-quality university examination papers designed to prepare me for the actual exam and help me achieve high marks.
Requirements:

- Infer the appropriate academic level, difficulty, exam style, and important topics from the material.
- Cover the entire syllabus intelligently, giving greater weight to important and high-yield concepts.
- Include an appropriate mix of conceptual questions, numerical problems, derivations, applications, and short/long questions wherever relevant.
- Show marks for every question and ensure the total marks are correct.
- Avoid meaningless repetition. Test important concepts repeatedly through different question styles.
- Progress from moderate difficulty toward difficult and comprehensive papers.
- Make the questions realistic, like those written by an experienced university examiner.
- Do not introduce material irrelevant to the provided syllabus.
- Ensure the 10 papers collectively provide comprehensive exam preparation rather than simply generating 10 random papers.

After the papers, include a concise Topic Coverage & Priority Analysis identifying:
- Most important topics
- High-yield topics
- Difficult topics
- Easy-mark topics
- Topics requiring the most practice
- Finally, give a recommended order for solving the 10 papers.

Output
Generate everything as one professionally formatted PDF.
The PDF should include:
- A cover page
- Table of contents
- 10 complete question papers
- Each paper starting on a new page
- Clear sections, question numbering, marks, time, and total marks
- Page numbers and clean exam-style formatting
- Topic Coverage & Priority Analysis at the end

Before generating the PDF, perform a quality check for marks, syllabus coverage, duplicate questions, difficulty, and formatting.
The objective is not merely to help me pass. The objective is to make these 10 papers sufficient for serious, high-score examination preparation.`;

  function handleFileChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null); // Clear errors when user tries again
    }
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(geminiPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function uploadAndCreateWorkspace(pdfFile, subjectName) {
    setIsLoading(true);
    setError(null);       
    setSuccessMsg(null);  
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User is not authenticated");
      }

      const token = await user.getIdToken(true);
      
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("subject", subjectName);
      formData.append("date", new Date().toISOString()); 

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/process`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` 
          }
        }
      );

      if (res.data.success === "true") {
        setSuccessMsg("Successfully processed and created!");
        setIsLoading(false);
      }
      else if(res.data.success === "false") {
        setIsLoading(false);
        setError(res.data.error);
      }

    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.error || error.message || "Something went wrong";
      setError(errorMsg);
      console.error("Error occurred:", errorMsg);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 transition-opacity">
        
        {/* Modal Container - Added max-h and overflow-y-auto so it scrolls if tip is open */}
        <div className="flex flex-col gap-5 justify-center relative w-full max-w-md p-6 sm:p-8 bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div>
            <h2 className="text-xl font-bold text-gray-800">Create Workspace</h2>
            <p className="text-sm text-gray-500 mt-1">Upload a past paper to initialize your AI tutor.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex gap-3 items-start text-sm text-red-700">
              <MessageCircleWarning className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="leading-tight">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex gap-3 items-start text-sm text-green-700">
              <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
              <p className="leading-tight">{successMsg}</p>
            </div>
          )}

          <label 
            htmlFor="pdf-upload" 
            className="group border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 rounded-xl py-10 px-6 w-full flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
          >
            <FileText className={`${file ? 'text-purple-600' : 'text-gray-400 group-hover:text-purple-500'} transition-colors`} size={32} />
            {file !== null ? (
              <span className="font-medium text-purple-700 text-center truncate max-w-full px-4">
                {file.name}
              </span>
            ) : (
              <span className="text-gray-500 font-medium text-sm text-center">
                Click to upload <span className="text-purple-600 font-semibold">.pdf</span> file
              </span>
            )}
            <input type="file" accept=".pdf" id="pdf-upload" className="hidden" onChange={handleFileChange} />
          </label>
          
          <input 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-gray-800 placeholder:text-gray-400" 
            type="text" 
            placeholder="Subject Name (e.g. Physics - 2023)" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)} 
          />
          
          <button 
            disabled={Loading || !file || !subject?.trim()}
            className="bg-purple-700 text-white font-medium text-center w-full sm:w-auto sm:ml-auto py-2.5 px-6 rounded-xl flex gap-2 items-center justify-center hover:bg-purple-800 active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none" 
            onClick={() => uploadAndCreateWorkspace(file, subject)}
          >
            <span>{Loading ? "Processing..." : "Create Workspace"}</span>
            {Loading && (
              <Loader2 className="w-4 h-4 animate-spin text-white/80" />
            )}
          </button>

          {/* Gemini Tip Section */}
          <div className="mt-2 pt-4 border-t border-gray-100">
            <button 
              onClick={() => setShowGeminiTip(!showGeminiTip)} 
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1.5 font-medium transition-colors"
            >
              <Sparkles size={16} /> Don't have past papers?
            </button>

            {showGeminiTip && (
              <div className="mt-3 bg-purple-50/50 p-4 rounded-xl text-sm text-gray-700 border border-purple-100 animate-in fade-in slide-in-from-top-2">
                <p className="mb-2 font-medium text-gray-800">Generate them using AI!</p>
                <ol className="list-decimal pl-4 space-y-1 mb-3 text-gray-600">
                  <li>Go to <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-medium">Google Gemini</a></li>
                  <li>Upload your textbook or syllabus PDF</li>
                  <li>Copy the prompt below and paste it</li>
                  <li>Download the generated PDF and upload it here!</li>
                </ol>
                
                <div className="relative group">
                  <textarea 
                    readOnly 
                    value={geminiPrompt} 
                    className="w-full h-32 p-3 bg-white border border-purple-200 rounded-lg text-xs font-mono text-gray-600 resize-none focus:outline-none focus:border-purple-400 custom-scrollbar" 
                  />
                  <button 
                    onClick={handleCopyPrompt} 
                    className="absolute top-2 right-2 p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md transition-colors flex items-center gap-1 shadow-sm"
                    title="Copy Prompt"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-xs font-medium text-green-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span className="text-xs font-medium">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}