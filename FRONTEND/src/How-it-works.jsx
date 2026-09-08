import React from 'react';

const KnowLiqBlog = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <main className="max-w-6xl mx-auto bg-white p-8 md:p-12 lg:p-16 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Top Navigation Bar */}
        <nav className="flex items-center justify-between mb-10 pb-4 border-b border-gray-100 text-sm font-medium">
          {/* Back to Home Link */}
          <a 
            href="/" 
            className="flex items-center text-gray-500 hover:text-blue-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
          
          {/* PDF Download Link (Update the href with your actual PDF path) */}
          <a 
            href="/KnowLiq_How_It_Works.pdf" 
            download="KnowLiq_How_It_Works.pdf"
            className="flex items-center text-gray-50 bg-purple-500 hover:bg-blue-50 hover:text-blue-700 px-4 py-2 rounded-full transition-all duration-200 border border-gray-200 hover:border-blue-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </a>
        </nav>

        {/* Header Section */}
        <header className="mb-14 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            KnowLiq: How It Works
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
            An AI Learning Platform Built Around the Student's Learning Journey
          </h2>
        </header>

{/* Appendix / Reference Index */}
        <section className="bg-white border-2 border-gray-200 p-6 md:p-8 rounded-lg mb-12 shadow-sm">
          
          {/* Appendix Header */}
          <div className="border-b-2 border-gray-200 pb-4 mb-6">
            <h3 className="text-sm font-bold text-gray-500 tracking-widest uppercase mb-1">
              Appendix
            </h3>
            <h4 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Quick Reference Guide
            </h4>
            <p className="text-gray-600 text-sm mt-2">
              Direct links to the core architectural concepts and platform evaluations.
            </p>
          </div>

          {/* Column-wise Index List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            
            {/* Left Column (Most Important) */}
            <div className="space-y-4">
              <a href="#competitive-comparison" className="flex items-start group">
                <span className="text-purple-700 font-bold mr-4 mt-0.5 w-6 text-right">I.</span>
                <div className="flex-1 border-b border-gray-100 pb-2 group-hover:border-purple-300 transition-colors">
                  <span className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                    Competitive Comparison Table
                  </span>
                </div>
              </a>
              
              <a href="#learning-loop" className="flex items-start group">
                <span className="text-gray-400 font-bold mr-4 mt-0.5 w-6 text-right group-hover:text-purple-500 transition-colors">II.</span>
                <div className="flex-1 border-b border-gray-100 pb-2 group-hover:border-purple-300 transition-colors">
                  <span className="font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                    The Closed Learning Loop
                  </span>
                </div>
              </a>

              <a href="#retention-states" className="flex items-start group">
                <span className="text-gray-400 font-bold mr-4 mt-0.5 w-6 text-right group-hover:text-purple-500 transition-colors">III.</span>
                <div className="flex-1 border-b border-gray-100 pb-2 group-hover:border-purple-300 transition-colors">
                  <span className="font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                    Retention States (Green, Yellow, Red)
                  </span>
                </div>
              </a>
            </div>

            {/* Right Column (Secondary Importance) */}
            <div className="space-y-4">
              <a href="#diagnostic-assessment" className="flex items-start group">
                <span className="text-gray-400 font-bold mr-4 mt-0.5 w-6 text-right group-hover:text-purple-500 transition-colors">IV.</span>
                <div className="flex-1 border-b border-gray-100 pb-2 group-hover:border-purple-300 transition-colors">
                  <span className="font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                    Test Generation & AI Evaluation
                  </span>
                </div>
              </a>

              <a href="#learner-types" className="flex items-start group">
                <span className="text-gray-400 font-bold mr-4 mt-0.5 w-6 text-right group-hover:text-purple-500 transition-colors">V.</span>
                <div className="flex-1 border-b border-gray-100 pb-2 group-hover:border-purple-300 transition-colors">
                  <span className="font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                    Personalized Learner Types
                  </span>
                </div>
              </a>

              <a href="#ai-models" className="flex items-start group">
                <span className="text-gray-400 font-bold mr-4 mt-0.5 w-6 text-right group-hover:text-purple-500 transition-colors">VI.</span>
                <div className="flex-1 border-b border-gray-100 pb-2 group-hover:border-purple-300 transition-colors">
                  <span className="font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                    AI Model Architecture (Stella & Astra)
                  </span>
                </div>
              </a>
            </div>

          </div>
        </section>
        {/* Article Body */}
        <article className="text-lg text-gray-700 leading-relaxed space-y-6">
          
          <p>Artificial intelligence has changed the way students study.</p>
          <p>
            Today, a student can open an AI assistant, upload a PDF, ask a question, receive an explanation, generate practice questions, and even solve difficult mathematical or engineering problems.
          </p>
          <p className="font-semibold text-gray-900 text-xl mt-8">But there is still a fundamental problem:</p>
          <p className="italic bg-gray-50 p-4 border-l-4 border-gray-300">
            Getting an answer is not the same as learning.
          </p>
          
          <p>A student does not only need an answer. They need to know:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 marker:text-gray-400">
            <li>What should I study?</li>
            <li>Which topics are important?</li>
            <li>What have I already learned?</li>
            <li>What am I still weak at?</li>
            <li>What should I revise?</li>
            <li>Did I actually understand the concept?</li>
            <li>Am I ready for an exam?</li>
            <li>What should I study next?</li>
          </ul>

          <p>KnowLiq is designed around these questions.</p>
          <p>
            Instead of treating AI as only a chatbot that responds to individual questions, KnowLiq is designed as a personalized learning system.
          </p>
          <p>
            It takes academic material, converts it into a structured knowledge map, creates a learning workspace, identifies what deserves attention, teaches the student through an adaptive AI tutor, remembers relevant learning history, generates diagnostic tests, evaluates the student's understanding, and uses those results to influence future learning priorities.
          </p>

          <div className="bg-blue-50 text-blue-900 p-6 rounded-lg my-8 font-medium text-center text-xl">
            In simple terms: KnowLiq is designed to turn AI from an answer provider into a learning system.
          </div>

          {/* Section 1 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. The Problem KnowLiq Is Trying to Solve</h3>
          <p>Traditional studying has a major organizational problem.</p>
          <p>Imagine a student preparing for an examination. They have:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>lecture slides</li>
            <li>textbooks</li>
            <li>notes</li>
            <li>past papers</li>
            <li>assignments</li>
            <li>solved examples</li>
            <li>dozens of concepts to remember</li>
          </ul>
          <p>The student has to manually figure out:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-600">
            <li>What is important?</li>
            <li>What should I study first?</li>
            <li>What have I already mastered?</li>
            <li>What have I forgotten?</li>
            <li>What am I weak at?</li>
            <li>When should I revise it?</li>
            <li>Am I actually ready for the examination?</li>
          </ul>
          <p>AI can answer individual questions, but answering individual questions does not automatically create a complete learning strategy.</p>
          <div className="bg-gray-100 p-6 rounded-lg my-6 font-mono text-sm space-y-3">
            <p className="text-gray-500">For example, a student might ask an AI:</p>
            <p className="text-blue-700 font-semibold">"Explain Bernoulli's equation."</p>
            <p className="text-gray-700">The AI explains it.</p>
            <p className="text-gray-500">Then the student asks:</p>
            <p className="text-blue-700 font-semibold">"Give me an example."</p>
            <p className="text-gray-700">The AI gives an example.</p>
            <p className="text-gray-500">Then:</p>
            <p className="text-blue-700 font-semibold">"Solve this problem."</p>
            <p className="text-gray-700">The AI solves it.</p>
          </div>
          <p>But there is no guarantee that the student actually understands Bernoulli's equation. The student may leave the conversation thinking:</p>
          <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">"I understand this."</blockquote>
          <p>Then the examination arrives. The problem becomes obvious. Understanding an explanation is not the same as being able to demonstrate understanding.</p>
          <p>KnowLiq is designed to address this gap.</p>

          {/* Section 2 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. The Core Idea Behind KnowLiq</h3>
          <p>KnowLiq is built around a continuous learning loop:</p>
          <div className="flex flex-col items-center justify-center space-y-2 bg-gray-50 p-6 rounded-lg my-6 text-sm font-semibold tracking-wide text-gray-700">
            <p>Academic Material</p>
            <p className="text-gray-400">↓</p>
            <p>Knowledge Extraction</p>
            <p className="text-gray-400">↓</p>
            <p>Topics & Subtopics</p>
            <p className="text-gray-400">↓</p>
            <p>Learning Workspace</p>
            <p className="text-gray-400">↓</p>
            <p>Topic Prioritization</p>
            <p className="text-gray-400">↓</p>
            <p>Personalized AI Tutoring</p>
            <p className="text-gray-400">↓</p>
            <p>Learning Memory</p>
            <p className="text-gray-400">↓</p>
            <p>Diagnostic Assessment</p>
            <p className="text-gray-400">↓</p>
            <p>AI Evaluation</p>
            <p className="text-gray-400">↓</p>
            <p>Retention State</p>
            <p className="text-gray-400">↓</p>
            <p>Updated Learning Priorities</p>
            <p className="text-gray-400">↓</p>
            <p>Next Learning Session</p>
          </div>
          <p>The cycle can then repeat. This means that the result of one learning session can influence the next one. That is the foundation of KnowLiq.</p>

          {/* Section 3 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Step One: Understanding the Student's Academic Material</h3>
          <p>The process begins when the student provides academic material. For example, the material could contain:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>lecture notes</li>
            <li>course PDFs</li>
            <li>past papers</li>
            <li>examination papers</li>
            <li>academic documents</li>
            <li>study resources</li>
          </ul>
          <p>KnowLiq processes the uploaded material and attempts to identify the academic concepts contained inside it. Instead of treating the entire document as one large piece of information, KnowLiq attempts to break it into meaningful academic topics and subtopics.</p>
          <p>For example, a Fluid Mechanics resource could produce a structure similar to:</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6 my-6 shadow-sm">
            <h4 className="font-bold text-gray-900 text-lg mb-4">Fluid Mechanics</h4>
            <div className="space-y-4 ml-4">
              <div>
                <p className="font-semibold text-gray-800">Fluid Properties</p>
                <ul className="list-disc pl-6 text-gray-600 text-sm">
                  <li>Density</li>
                  <li>Viscosity</li>
                  <li>Specific Gravity</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Fluid Statics</p>
                <ul className="list-disc pl-6 text-gray-600 text-sm">
                  <li>Pressure</li>
                  <li>Hydrostatic Forces</li>
                  <li>Manometers</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Fluid Dynamics</p>
                <ul className="list-disc pl-6 text-gray-600 text-sm">
                  <li>Continuity Equation</li>
                  <li>Bernoulli Equation</li>
                  <li>Momentum Equation</li>
                </ul>
              </div>
            </div>
          </div>
          <p>This creates the foundation of the student's learning workspace.</p>

          {/* Section 4 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Creating a Knowledge Map</h3>
          <p>One of KnowLiq's core concepts is the knowledge map. The knowledge map represents the academic structure of the material. For each identified topic, KnowLiq can maintain information such as:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>topic name</li>
            <li>subtopics</li>
            <li>importance score</li>
            <li>number of appearances</li>
            <li>associated marks</li>
            <li>learning state</li>
          </ul>
          <p>This becomes much more useful than simply storing the uploaded PDF. The system is effectively turning:</p>
          <p className="text-center font-medium bg-gray-50 py-3 rounded text-gray-600 my-4">Unstructured academic material <br/>↓<br/> A structured map of things the student needs to learn.</p>

          {/* Section 5 Table */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Why Past Papers Are Particularly Useful</h3>
          <p>Past examination papers contain valuable information. They can show:</p>
          <ul className="list-disc pl-6 space-y-1 mb-6">
            <li>which topics appear repeatedly</li>
            <li>which concepts receive more marks</li>
            <li>which areas are commonly tested</li>
            <li>how the course is actually assessed</li>
          </ul>
          <p>KnowLiq can extract this information while processing the material. For example:</p>
          
          <div className="overflow-x-auto my-6">
            <table className="w-full text-left border-collapse border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 border-b">Topic</th>
                  <th className="px-4 py-3 border-b">Importance</th>
                  <th className="px-4 py-3 border-b text-center">Appearance</th>
                  <th className="px-4 py-3 border-b text-center">Marks</th>
                </tr>
              </thead>
              <tbody className="bg-white text-gray-600">
                <tr>
                  <td className="px-4 py-3 border-b">Bernoulli Equation</td>
                  <td className="px-4 py-3 border-b font-medium text-red-600">High</td>
                  <td className="px-4 py-3 border-b text-center">5</td>
                  <td className="px-4 py-3 border-b text-center font-semibold">20</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border-b">Continuity</td>
                  <td className="px-4 py-3 border-b font-medium text-red-600">High</td>
                  <td className="px-4 py-3 border-b text-center">4</td>
                  <td className="px-4 py-3 border-b text-center font-semibold">15</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border-b">Hydrostatics</td>
                  <td className="px-4 py-3 border-b font-medium text-red-600">High</td>
                  <td className="px-4 py-3 border-b text-center">4</td>
                  <td className="px-4 py-3 border-b text-center font-semibold">18</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border-b">Fluid Properties</td>
                  <td className="px-4 py-3 border-b font-medium text-yellow-600">Medium</td>
                  <td className="px-4 py-3 border-b text-center">2</td>
                  <td className="px-4 py-3 border-b text-center font-semibold">8</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>This does not mean the system is predicting the exact future examination. Instead, it gives the learning system useful evidence about the academic importance of different areas.</p>

          {/* Section 6 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. The Learning Workspace</h3>
          <p>After processing the material, KnowLiq creates a workspace for the subject. The workspace acts as the student's persistent academic environment. It can contain:</p>
          <ul className="list-disc pl-6 space-y-1 mb-4 grid grid-cols-2 gap-2">
            <li>the subject</li>
            <li>topics</li>
            <li>subtopics</li>
            <li>importance information</li>
            <li>marks</li>
            <li>learning state</li>
            <li>learning history</li>
            <li>retention information</li>
            <li>test information</li>
          </ul>
          <p>This is important because the student's academic context is not supposed to disappear when a single chat ends. The workspace becomes the foundation for future learning sessions.</p>

          {/* Section 7 with Colors */}
          <h3 id="retention-states" className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. KnowLiq Tracks More Than What You Studied</h3>
          <p>One of the most important ideas in KnowLiq is the distinction between:</p>
          <div className="flex flex-col md:flex-row gap-4 my-6">
            <div className="flex-1 bg-gray-100 p-4 rounded text-center italic text-gray-700 font-medium">"The student studied this."</div>
            <div className="flex items-center justify-center font-bold text-gray-400">AND</div>
            <div className="flex-1 bg-gray-100 p-4 rounded text-center italic text-gray-700 font-medium">"The student understands this."</div>
          </div>
          <p>These are not the same thing. A student might spend an hour reading about thermodynamics without actually being able to solve a problem.</p>
          <p>Therefore, KnowLiq maintains learning states for subtopics. The current system uses three main retention states:</p>
          
          <div className="space-y-4 my-6">
            <div className="border-l-4 border-green-500 bg-green-50/50 p-4 rounded-r-lg">
              <h4 className="font-bold text-green-700 text-lg flex items-center mb-1">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span> Green — Strong Understanding
              </h4>
              <p className="text-green-900 ml-5">The student demonstrated a strong understanding of the topic.</p>
            </div>
            
            <div className="border-l-4 border-yellow-500 bg-yellow-50/50 p-4 rounded-r-lg">
              <h4 className="font-bold text-yellow-700 text-lg flex items-center mb-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span> Yellow — Partial Understanding
              </h4>
              <p className="text-yellow-900 ml-5">The student understands the main concept but still has gaps, weak reasoning, or incomplete understanding.</p>
            </div>

            <div className="border-l-4 border-red-500 bg-red-50/50 p-4 rounded-r-lg">
              <h4 className="font-bold text-red-700 text-lg flex items-center mb-1">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> Red — Weak Understanding
              </h4>
              <p className="text-red-900 ml-5">The student demonstrated significant misunderstanding, incorrect reasoning, or inability to apply the concept.</p>
            </div>
          </div>
          <p>New or untested topics can also remain in an initial untested state. This gives the system a more meaningful representation of the student's learning condition.</p>

          {/* Section 8 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Topic Prioritization</h3>
          <p>Once KnowLiq knows the student's topics and learning states, it can determine what deserves attention. Suppose a student has ten subtopics. Five are strong. Three are partially understood. Two are weak.</p>
          <p>A conventional study system might simply display all ten topics. KnowLiq instead tries to prioritize them. The current prioritization process considers factors such as:</p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Red or weak topics</li>
            <li>Yellow or partially understood topics</li>
            <li>Green topics that have become due for revision</li>
            <li>Untested topics</li>
            <li>Academic importance</li>
            <li>Marks</li>
            <li>Time since the topic was last learned</li>
          </ul>
          <p>This creates a focused learning session. Instead of asking the student: <span className="italic text-gray-500">"What do you want to study?"</span> the system can help answer: <span className="font-semibold text-blue-700">"What would be most useful for you to study next?"</span></p>

          {/* Section 9 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Why Topic Prioritization Matters</h3>
          <p>Students often study inefficiently. They may repeatedly review concepts they already understand because those concepts feel comfortable. At the same time, they may avoid difficult topics because those topics require more effort.</p>
          <p className="font-semibold text-red-800 bg-red-50 p-4 border-l-4 border-red-200 my-4">This can create a dangerous situation: The student feels productive without actually improving their weakest areas.</p>
          <p>KnowLiq's prioritization system attempts to reduce this problem by directing attention toward areas that need it most.</p>

          {/* Section 10 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">10. Personalized AI Tutoring</h3>
          <p>After determining the current learning focus, KnowLiq uses an AI tutor to teach the student. The tutoring system considers information such as:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pl-6 list-disc mb-6 text-gray-600">
            <li className="list-item">current learning topics</li>
            <li className="list-item">student's learning preferences</li>
            <li className="list-item">recent concepts</li>
            <li className="list-item">relevant previous conversations</li>
            <li className="list-item">subject</li>
            <li className="list-item">preferred language</li>
            <li className="list-item">learning style</li>
            <li className="list-item">desired response structure</li>
          </div>
          <p>The tutor is instructed to avoid simply overwhelming the student with information. Instead, it can:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>explain one concept at a time</li>
            <li>use examples</li>
            <li>adapt explanations when the student is confused</li>
            <li>use analogies</li>
            <li>ask questions</li>
            <li>move forward when understanding is demonstrated</li>
            <li>remain within the relevant syllabus</li>
            <li>maintain the student's selected language</li>
            <li>format mathematical content appropriately</li>
          </ul>
          <p>This creates a more structured learning interaction.</p>

          {/* Sections 11, 12, 13 (Learner Types) */}
          <h3 id="learner-types" className="text-2xl font-bold text-gray-900 mt-12 mb-4">11. Three Different Learner Types</h3>
          <p>KnowLiq allows students to select how they prefer to learn. These settings can be changed by the student.</p>
          
          <div className="space-y-8 mt-6">
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-2">Visual & Analogy Mode</h4>
              <p className="mb-2">This mode is designed for students who understand abstract concepts better when they are connected to physical or real-world systems. For example, an engineering concept could be explained through:</p>
              <ul className="list-disc pl-6 mb-2 text-gray-600">
                <li>engines</li>
                <li>plumbing systems</li>
                <li>mechanical systems</li>
                <li>everyday physical processes</li>
              </ul>
              <p>Instead of only giving a formal definition, the AI tries to build an intuitive mental model. The goal is:</p>
              <p className="bg-gray-100 p-3 rounded text-center text-sm font-semibold font-mono my-2 text-gray-700">Abstract concept → familiar real-world system → intuitive understanding</p>
            </div>

            <div id="section-12">
              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">12. Interactive Socratic Mode</h3>
              <p className="mb-2">The second learner type is the Interactive Socratic Mode. Instead of making the student a passive receiver of information, the tutor can guide them through questions. For example, instead of immediately saying:</p>
              <p className="italic text-gray-500 my-2">"The pressure increases because..."</p>
              <p>the AI might ask:</p>
              <p className="font-semibold text-blue-700 my-2">"What do you think happens to the weight of the liquid above a point as you move deeper?"</p>
              <p>The student thinks. The AI responds. The student reasons again. This creates an active feedback loop. The objective is to encourage:</p>
              <ul className="list-disc pl-6 mb-2 text-gray-600">
                <li>reasoning</li>
                <li>recall</li>
                <li>active participation</li>
                <li>critical thinking</li>
                <li>conceptual understanding</li>
              </ul>
              <p>rather than passive reading.</p>
            </div>

            <div id="section-13">
              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">13. To-The-Point Mode</h3>
              <p className="mb-2">The third learner type is the To-The-Point Mode. This mode is designed for students who prefer high information density and minimal unnecessary explanation. Responses focus on:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>key concepts</li>
                <li>important facts</li>
                <li>bullet points</li>
                <li>direct explanations</li>
                <li>minimal fluff</li>
              </ul>
              <p>The implementation is designed around concise responses, including a target of keeping responses under approximately 150 words where appropriate. This can be particularly useful for:</p>
              <ul className="list-disc pl-6 mb-2 text-gray-600">
                <li>revision</li>
                <li>quick concept checks</li>
                <li>familiar topics</li>
                <li>last-minute preparation</li>
                <li>students who prefer concise explanations</li>
              </ul>
            </div>
          </div>

          {/* Section 14 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">14. Field of Study</h3>
          <p>KnowLiq also distinguishes between different broad fields of study.</p>
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <h4 className="font-bold text-lg mb-2 text-gray-900">Technical & STEM</h4>
              <p className="text-sm mb-3">Examples include: Physics, Chemistry, Mathematics, Thermodynamics, Engineering, other technical subjects.</p>
              <p className="text-sm font-medium text-gray-600">These subjects often involve formulas, calculations, numerical problems, and technical reasoning.</p>
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <h4 className="font-bold text-lg mb-2 text-gray-900">Theory & Humanities</h4>
              <p className="text-sm mb-3">Examples include: Biology, Psychology, Philosophy, History, other theory-oriented subjects.</p>
              <p className="text-sm font-medium text-gray-600">These subjects often require stronger conceptual understanding, explanation, comparison, interpretation, and recall.</p>
            </div>
          </div>
          <p>This classification gives the AI additional context when generating explanations and assessments.</p>

          {/* Section 15 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">15. Response Structure Settings</h3>
          <p>Students also have control over how detailed the AI's responses should be. There are currently two options.</p>
          <div className="space-y-6 my-6">
            <div>
              <h4 className="font-bold text-gray-800">Detailed</h4>
              <p>The AI provides a more comprehensive explanation. This is useful when the student is learning a difficult topic from the beginning and wants deeper context. For example:</p>
              <p className="italic bg-gray-50 p-3 rounded text-gray-600 my-2">"Teach me thermodynamic entropy from the basics."</p>
              <p>A detailed response can provide definitions, intuition, relationships, examples, mathematical explanation, and applications.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Normal</h4>
              <p>Normal mode keeps responses more compact while maintaining the intended answer quality. According to the current implementation, this mode is designed to reduce AI usage cost by approximately 30%.</p>
              <p>This is important because students do not always need a long explanation. If a student asks <span className="italic text-gray-500">"What is the unit of pressure?"</span> a huge response would be unnecessary. Normal mode helps make routine interactions more resource-efficient.</p>
            </div>
          </div>

          {/* Section 16 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">16. Language Support</h3>
          <p>KnowLiq also supports multilingual AI learning. The current language configuration includes:</p>
          <div className="flex flex-wrap gap-2 my-4">
            {['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Urdu'].map(lang => (
              <span key={lang} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">{lang}</span>
            ))}
          </div>
          <p>The selected language becomes part of the tutor's response configuration. This means the student can learn using their preferred supported language instead of being forced to study everything in English. This is particularly useful for students who understand difficult academic concepts more naturally in their native language.</p>

          {/* Sections 17, 18, 19 */}
          <h3 id="ai-models" className="text-2xl font-bold text-gray-900 mt-12 mb-4">17. AI Model Architecture</h3>
          <p>KnowLiq currently exposes two primary AI learning models.</p>
          
          <h4 className="text-xl font-bold text-gray-800 mt-6 mb-2">Stella — GPT-5.6 Luna</h4>
          <p>Stella is KnowLiq's higher-capability AI tutor. It is intended for situations where stronger reasoning and deeper explanations are useful. Examples include:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>difficult mathematics</li>
            <li>engineering problems</li>
            <li>complex scientific concepts</li>
            <li>advanced reasoning</li>
            <li>challenging technical questions</li>
          </ul>
          <p>The goal is to use a more capable model when the learning task requires it.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">18. Astra — GPT-4o-mini</h3>
          <p>Astra is KnowLiq's lightweight AI tutor. It is suitable for many routine academic interactions, such as:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>straightforward explanations</li>
            <li>simple concept questions</li>
            <li>revision</li>
            <li>general tutoring</li>
            <li>routine learning conversations</li>
          </ul>
          <p>Using a smaller model for simpler interactions can make the platform more resource-efficient.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">19. Auto Mode</h3>
          <p>KnowLiq also has an Auto mode. Currently, Auto defaults to GPT-4o-mini to conserve resources. However, the architecture can evolve beyond this. A future version of Auto could analyze the student's task and select a more appropriate model automatically. For example:</p>
          <div className="bg-gray-50 border border-gray-200 rounded p-4 font-mono text-sm space-y-2 text-gray-700 my-4">
            <p>Simple concept → Lightweight model</p>
            <p>Complex mathematics → Strong reasoning model</p>
            <p>Programming → Coding-focused model</p>
            <p>Engineering → Model better suited to technical reasoning</p>
            <p>General theory → Efficient general model</p>
          </div>
          <p>This could create a model-routing system where the student does not need to manually decide which AI model should handle every question.</p>

          {/* Section 20 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">20. Learning Memory</h3>
          <p>Another important part of KnowLiq is memory. A student's learning journey does not exist in one conversation. They may study a topic today and return to it several days later. Therefore, KnowLiq maintains learning information across conversations. There are several components to this.</p>
          <ul className="space-y-4 my-6">
            <li>
              <strong className="block text-gray-900">Recent Conversation Context</strong>
              <span className="text-gray-600">Recent chats help the tutor understand what has just been discussed.</span>
            </li>
            <li>
              <strong className="block text-gray-900">Semantic Memory</strong>
              <span className="text-gray-600">Older conversations can be searched based on their meaning.</span>
            </li>
            <li>
              <strong className="block text-gray-900">Rolling Summary</strong>
              <span className="text-gray-600">Recent context can also be compressed into a short summary so that important information can be retained without continuously passing large amounts of conversation history.</span>
            </li>
          </ul>
          <p>Together, these mechanisms help KnowLiq maintain continuity.</p>

          {/* Section 21 & 22 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">21. Semantic Memory Using Embeddings</h3>
          <p>KnowLiq uses OpenAI's text-embedding-3-small model to create embeddings for conversations. An embedding is a numerical representation of meaning. For example:</p>
          <div className="bg-blue-50 p-4 rounded-lg my-4 text-blue-900 text-sm">
            <p className="font-semibold mb-1">Earlier:</p>
            <p className="italic mb-3">"Why does pressure increase when we go deeper into water?"</p>
            <p className="font-semibold mb-1">Later:</p>
            <p className="italic">"Why is pressure greater at the bottom of a liquid?"</p>
          </div>
          <p>The words are different, but the concepts are closely related. Semantic search can help identify that relationship. KnowLiq stores these representations and can retrieve relevant previous questions and answers. This gives the AI access to a form of long-term academic memory.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">22. Why Memory Matters for Education</h3>
          <p>Consider a student studying mathematics over several weeks.</p>
          <div className="bg-gray-100 p-4 rounded text-gray-800 text-sm space-y-2 my-4 font-mono">
            <p><strong>On Monday:</strong> "I don't understand derivatives."</p>
            <p><strong>On Thursday:</strong> "Can you explain rate of change again?"</p>
            <p><strong>Two weeks later:</strong> "Why does this slope represent the derivative?"</p>
          </div>
          <p>A system with relevant learning memory can potentially connect these conversations. This creates continuity. The AI is no longer simply answering the latest question. It can work within a larger history of the student's learning.</p>

          {/* Section 23 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">23. Current Learning Focus</h3>
          <p>KnowLiq also maintains a current learning focus. For example:</p>
          <div className="bg-white border-l-4 border-blue-500 shadow-sm p-4 my-4 rounded-r">
            <h4 className="font-bold text-gray-900 mb-2">Current Session</h4>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Bernoulli Equation</li>
              <li>Continuity Equation</li>
              <li>Hydrostatic Pressure</li>
            </ul>
          </div>
          <p>The tutor can use these topics to keep the session focused. This prevents the learning experience from becoming an unrestricted conversation where the student jumps randomly between unrelated concepts.</p>

          {/* Sections 24, 25, 26, 27 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">24. When Does KnowLiq Test the Student?</h3>
          <p>Teaching alone is not enough. At some point, the student needs to demonstrate understanding. KnowLiq therefore has an assessment stage. After enough interaction within a learning session, the system can determine that the student is ready for a diagnostic test. The important point is:</p>
          <p className="font-bold text-blue-800 bg-blue-50 p-4 text-center rounded my-4">The test is connected to what the student actually studied. It is not simply a random collection of questions.</p>

          <h3 id="diagnostic-assessment" className="text-2xl font-bold text-gray-900 mt-12 mb-4">25. How KnowLiq Generates Tests</h3>
          <p>The test-generation pipeline uses the student's recent learning session. The system looks at:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-600 grid grid-cols-2 gap-2">
            <li>concepts discussed</li>
            <li>current learning topics</li>
            <li>recent conversation</li>
            <li>possible confusion</li>
            <li>knowledge gaps</li>
            <li>topics allowed for the assessment</li>
          </ul>
          <p>A lightweight model first summarizes the recent learning conversation. Then GPT-5.6 Luna generates the diagnostic test. The current system generates six questions. Each question can contain:</p>
          <p className="font-mono text-sm bg-gray-100 p-3 rounded text-gray-700 my-4">question text | four answer options | correct option | reasoning prompt | target topics</p>
          <p>This makes the assessment directly connected to the learning session.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">26. Tests Adapt to the Subject</h3>
          <p>KnowLiq can differentiate between theoretical and technical learning. For technical subjects such as mathematics and engineering, when the learning conversation indicates numerical problem solving, the test can contain numerical multiple-choice questions. The answer options contain numerical results. The student can also be asked to provide reasoning about formulas or solution steps.</p>
          <p>For theory-oriented subjects, the system can generate deeper conceptual multiple-choice questions. This makes the assessment more appropriate to the nature of the subject.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">27. Why the Test Includes Reasoning</h3>
          <p>Consider two students. Both choose the correct answer.</p>
          <div className="flex flex-col md:flex-row gap-4 my-4">
            <div className="flex-1 border border-gray-200 p-4 rounded">
              <strong className="block text-gray-900 mb-1">Student A:</strong>
              <span className="text-gray-600">Uses the correct formula and reaches the answer logically.</span>
            </div>
            <div className="flex-1 border border-gray-200 p-4 rounded">
              <strong className="block text-gray-900 mb-1">Student B:</strong>
              <span className="text-gray-600">Guesses the correct option.</span>
            </div>
          </div>
          <p>Both technically got the question right. But they do not demonstrate the same level of understanding. This is why KnowLiq can include reasoning prompts for suitable technical questions. The goal is to understand not only <span className="italic">"Did you get the answer?"</span> but also <span className="italic font-semibold">"Do you understand why the answer is correct?"</span></p>

          {/* Sections 28, 29 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">28. AI-Based Evaluation</h3>
          <p>After the student submits the test, GPT-5.6 Luna evaluates the student's performance. The system evaluates the student's understanding at the subtopic level. The result includes information such as subtopic, remarks, and retention state. The retention state is calibrated as:</p>
          <ul className="space-y-3 my-6 text-gray-700">
            <li><strong className="text-green-600">Green:</strong> Correct and supported by sound reasoning.</li>
            <li><strong className="text-yellow-600">Yellow:</strong> The main idea is understood, but reasoning or some concepts still need improvement.</li>
            <li><strong className="text-red-600">Red:</strong> The answer is wrong, incomplete, or demonstrates flawed reasoning.</li>
          </ul>
          <p>This converts a test into useful learning information.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">29. The Test Changes the Student's Learning State</h3>
          <p>This is one of the most important parts of KnowLiq. The test does not simply produce a score and disappear. The result is fed back into the student's workspace. For example:</p>
          <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm space-y-4 my-6">
            <div>
              <p className="text-gray-500 mb-1">Before the test:</p>
              <p>Hydrostatic Pressure → <span className="text-gray-400 font-bold italic">Untested</span></p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">After the test:</p>
              <p>Hydrostatic Pressure → <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded">Red</span></p>
            </div>
          </div>
          <p>KnowLiq now has a reason to give this topic more attention. Another topic might change from:</p>
          <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm space-y-2 my-4">
            <p>Bernoulli Equation → <span className="text-gray-400 font-bold italic">Untested</span></p>
            <p className="text-gray-400">to:</p>
            <p>Bernoulli Equation → <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded">Green</span></p>
          </div>
          <p>Now the system knows that this topic has demonstrated understanding. This creates a feedback loop between assessment and future learning.</p>

          {/* Section 30 */}
          <h3 id="learning-loop" className="text-2xl font-bold text-gray-900 mt-12 mb-4">30. The Complete Learning Loop</h3>
          <p>The entire system can now be viewed as:</p>
          <ol className="list-decimal pl-6 space-y-4 text-gray-700 my-6 font-medium bg-gray-50 p-6 rounded-lg border border-gray-200">
            <li><strong>Material:</strong> The student provides academic resources. <br/><span className="text-gray-400">↓</span></li>
            <li><strong>Knowledge Extraction:</strong> AI identifies topics, subtopics, importance, marks, and frequency. <br/><span className="text-gray-400">↓</span></li>
            <li><strong>Workspace:</strong> KnowLiq creates a persistent academic workspace. <br/><span className="text-gray-400">↓</span></li>
            <li><strong>Prioritization:</strong> The system selects topics that deserve attention. <br/><span className="text-gray-400">↓</span></li>
            <li><strong>Personalized Tutoring:</strong> The AI teaches according to the student's learning style, language, field, and response preferences. <br/><span className="text-gray-400">↓</span></li>
            <li><strong>Memory:</strong> Relevant previous learning interactions can be retrieved. <br/><span className="text-gray-400">↓</span></li>
            <li><strong>Assessment:</strong> KnowLiq generates a diagnostic test based on the student's actual learning session. <br/><span className="text-gray-400">↓</span></li>
            <li><strong>Evaluation:</strong> AI evaluates answers and reasoning. <br/><span className="text-gray-400">↓</span></li>
            <li><strong>Retention:</strong> Subtopics receive updated learning states. <br/><span className="text-gray-400">↓</span></li>
            <li><strong>Adaptation:</strong> The updated states influence future topic priorities. <br/><span className="text-gray-400">↓</span></li>
            <li><strong>Repeat:</strong> The learning process continues.</li>
          </ol>
          <p>This is the central architecture of KnowLiq.</p>

          {/* Section 31 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">31. A Complete Example</h3>
          <p>Consider a student preparing for a Fluid Mechanics examination. They upload several past papers. KnowLiq analyzes them and creates a knowledge map. It identifies: Fluid Properties, Hydrostatics, Continuity, Bernoulli Equation, Momentum Equation. It also identifies which topics appear more frequently and carry more marks.</p>
          <p>The student starts learning. KnowLiq prioritizes <span className="font-semibold text-blue-700">Bernoulli Equation</span> and <span className="font-semibold text-blue-700">Hydrostatics</span>.</p>
          <p>The student selects: <span className="font-semibold">Visual & Analogy Mode</span> and <span className="font-semibold">Detailed Responses</span>. The tutor therefore attempts to provide intuitive, detailed explanations.</p>
          <p>The student asks questions about Bernoulli's equation. The system keeps the current learning focus. Relevant previous conversations can be retrieved when needed.</p>
          <p>After sufficient learning interaction, KnowLiq generates a six-question diagnostic test. The student submits the answers. The evaluation determines:</p>
          <ul className="space-y-1 font-mono text-sm bg-gray-50 p-4 rounded my-4">
            <li>Bernoulli Equation → <span className="text-green-600 font-bold">Green</span></li>
            <li>Hydrostatics → <span className="text-yellow-600 font-bold">Yellow</span></li>
            <li>Pressure Head → <span className="text-red-600 font-bold">Red</span></li>
          </ul>
          <p>The next learning session can therefore prioritize the weaker areas. The process continues.</p>

          {/* Section 32, 33, 34, 35, 36 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">32. What Makes This Different From a Simple AI Chatbot?</h3>
          <p>A simple chatbot can answer: <span className="italic text-gray-500">"Explain thermodynamic entropy."</span> KnowLiq attempts to go further. It can consider:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-600 mb-4">
            <li>What subject is this?</li>
            <li>Is entropy part of the current learning focus?</li>
            <li>Has the student discussed entropy before?</li>
            <li>What related concepts have they already studied?</li>
            <li>What is their preferred learning style?</li>
            <li>What language do they prefer?</li>
            <li>Do they want a detailed or normal response?</li>
            <li>Have they demonstrated understanding?</li>
            <li>Should this topic be tested?</li>
            <li>What happened when they were tested?</li>
            <li>Should this topic receive more attention next time?</li>
          </ul>
          <p className="font-semibold">This is the difference between a question-answering interface and a learning-state system.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">33. KnowLiq vs General-Purpose AI</h3>
          <p>KnowLiq should not be understood as a replacement for every general AI assistant. Systems such as ChatGPT, Gemini, and Claude are much broader. They can help with writing, coding, research, brainstorming, general knowledge, image understanding, analysis, education, productivity, and many other tasks.</p>
          <p>KnowLiq has a much narrower purpose. Its focus is: <strong className="text-gray-900 bg-yellow-100 px-2 py-1">Personalized academic learning.</strong> This specialization allows the product architecture to revolve around learning rather than general AI assistance.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">34. KnowLiq vs ChatGPT</h3>
          <p>ChatGPT is a highly capable general-purpose AI system. Its current Study Mode can guide students through learning using questions, step-by-step explanations, understanding checks, uploaded materials, and practice activities. Therefore, it would be inaccurate to say that KnowLiq is simply "an AI tutor while ChatGPT is not."</p>
          <p>The more meaningful comparison is the workflow. KnowLiq is specifically organized around academic workspaces, topic/subtopic mapping, learning-state tracking, semantic learning memory, retention states, session-based assessment, and feedback-driven prioritization. ChatGPT has a much broader product scope. KnowLiq's distinction is its focus on connecting these educational components into one persistent learning workflow.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">35. KnowLiq vs Gemini</h3>
          <p>Gemini has also developed strong education-focused capabilities. Its Study Notebooks can work with learning materials, provide diagnostic quizzes, create personalized lessons, identify knowledge gaps, and support progress-oriented study. This makes Gemini one of the strongest comparisons for KnowLiq.</p>
          <p>KnowLiq's strongest distinction is the specific architecture around: <strong>Subtopics → retention → assessment → future priority</strong>. The product is designed around maintaining an explicit learning state for the student's academic workspace. Gemini benefits from Google's enormous ecosystem and broad AI capabilities. KnowLiq is intentionally focused on the student's learning journey.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">36. KnowLiq vs Claude</h3>
          <p>Claude also has education-focused capabilities, including Learning Mode, which emphasizes guided reasoning and critical thinking rather than simply giving students the final answer. This overlaps with KnowLiq's Interactive Socratic Mode. The distinction is therefore not that KnowLiq is the only system capable of Socratic learning.</p>
          <p>Instead, KnowLiq combines that tutoring approach with persistent academic workspaces, topic prioritization, learning memory, explicit retention states, diagnostic testing, AI evaluation, and feedback-driven study planning.</p>

          {/* Section 37 Table */}
          <h3 id="competitive-comparison" className="text-2xl font-bold text-gray-900 mt-12 mb-4">37. Competitive Comparison</h3>
          <div className="overflow-x-auto my-6">
            <table className="w-full text-left border-collapse border border-gray-200 text-sm shadow-sm">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3 border">Capability</th>
                  <th className="px-4 py-3 border bg-blue-700">KnowLiq</th>
                  <th className="px-4 py-3 border">ChatGPT</th>
                  <th className="px-4 py-3 border">Gemini</th>
                  <th className="px-4 py-3 border">Claude</th>
                </tr>
              </thead>
              <tbody className="bg-white text-gray-700">
                <tr className="border-b bg-gray-50"><td className="px-4 py-2 border font-medium">General AI assistance</td><td className="px-4 py-2 border">Focused on education</td><td className="px-4 py-2 border">Very broad</td><td className="px-4 py-2 border">Very broad</td><td className="px-4 py-2 border">Very broad</td></tr>
                <tr className="border-b"><td className="px-4 py-2 border font-medium">AI tutoring</td><td className="px-4 py-2 border text-green-700 font-semibold">Yes</td><td className="px-4 py-2 border">Yes</td><td className="px-4 py-2 border">Yes</td><td className="px-4 py-2 border">Yes</td></tr>
                <tr className="border-b bg-gray-50"><td className="px-4 py-2 border font-medium">Guided learning</td><td className="px-4 py-2 border text-green-700 font-semibold">Yes</td><td className="px-4 py-2 border">Yes</td><td className="px-4 py-2 border">Yes</td><td className="px-4 py-2 border">Yes</td></tr>
                <tr className="border-b"><td className="px-4 py-2 border font-medium">Uploaded academic material</td><td className="px-4 py-2 border text-green-700 font-semibold">Yes</td><td className="px-4 py-2 border">Yes</td><td className="px-4 py-2 border">Yes</td><td className="px-4 py-2 border">Yes</td></tr>
                <tr className="border-b bg-gray-50"><td className="px-4 py-2 border font-medium">Academic knowledge mapping</td><td className="px-4 py-2 border font-bold text-blue-800">Core workflow</td><td className="px-4 py-2 border">Not primary focus</td><td className="px-4 py-2 border">Study-focused</td><td className="px-4 py-2 border">Not primary focus</td></tr>
                <tr className="border-b"><td className="px-4 py-2 border font-medium">Persistent subject workspace</td><td className="px-4 py-2 border font-bold text-blue-800">Core workflow</td><td className="px-4 py-2 border">Broader capabilities</td><td className="px-4 py-2 border">Study capabilities</td><td className="px-4 py-2 border">Education capabilities</td></tr>
                <tr className="border-b bg-gray-50"><td className="px-4 py-2 border font-medium">Semantic learning memory</td><td className="px-4 py-2 border font-bold text-blue-800">Core workflow</td><td className="px-4 py-2 border">Memory/context</td><td className="px-4 py-2 border">Memory/context</td><td className="px-4 py-2 border">Context capabilities</td></tr>
                <tr className="border-b"><td className="px-4 py-2 border font-medium">Explicit subtopic retention states</td><td className="px-4 py-2 border font-bold text-blue-800">Core workflow</td><td className="px-4 py-2 border">Not central workflow</td><td className="px-4 py-2 border">Progress/adaptation</td><td className="px-4 py-2 border">Not central workflow</td></tr>
                <tr className="border-b bg-gray-50"><td className="px-4 py-2 border font-medium">Diagnostic assessment</td><td className="px-4 py-2 border text-green-700 font-semibold">Yes</td><td className="px-4 py-2 border">Yes</td><td className="px-4 py-2 border">Yes</td><td className="px-4 py-2 border">Yes</td></tr>
                <tr className="border-b"><td className="px-4 py-2 border font-medium">Assessment based on recent learning</td><td className="px-4 py-2 border font-bold text-blue-800">Core workflow</td><td className="px-4 py-2 border">Through broader features</td><td className="px-4 py-2 border">Adaptive study</td><td className="px-4 py-2 border">Guided learning</td></tr>
                <tr className="border-b bg-gray-50"><td className="px-4 py-2 border font-medium">Test results influence topic priority</td><td className="px-4 py-2 border font-bold text-blue-800">Core workflow</td><td className="px-4 py-2 border">Not central workflow</td><td className="px-4 py-2 border">Adaptive features</td><td className="px-4 py-2 border">Not central workflow</td></tr>
                <tr className="border-b"><td className="px-4 py-2 border font-medium">Learner-type selection</td><td className="px-4 py-2 border text-green-700 font-semibold">Yes</td><td className="px-4 py-2 border">Guided learning</td><td className="px-4 py-2 border">Adaptive study</td><td className="px-4 py-2 border">Learning Mode</td></tr>
                <tr className="border-b bg-gray-50"><td className="px-4 py-2 border font-medium">Multiple response structures</td><td className="px-4 py-2 border text-green-700 font-semibold">Yes</td><td className="px-4 py-2 border">Yes</td><td className="px-4 py-2 border">Yes</td><td className="px-4 py-2 border">Yes</td></tr>
                <tr className="border-b"><td className="px-4 py-2 border font-medium">Multilingual learning</td><td className="px-4 py-2 border text-green-700 font-semibold">Yes</td><td className="px-4 py-2 border">Yes</td><td className="px-4 py-2 border">Yes</td><td className="px-4 py-2 border">Yes</td></tr>
                <tr className="border-b bg-gray-50"><td className="px-4 py-2 border font-medium">Task-oriented model strategy</td><td className="px-4 py-2 border font-bold text-blue-800">Stella/Astra/Auto</td><td className="px-4 py-2 border">Multiple models</td><td className="px-4 py-2 border">Multiple models</td><td className="px-4 py-2 border">Multiple models</td></tr>
              </tbody>
            </table>
          </div>
          <p>The goal of this comparison is not to claim that KnowLiq is universally better. The major AI platforms have enormous advantages in scale, research, model capabilities, tools, and general-purpose functionality.</p>
          <p className="font-bold text-lg text-center bg-gray-50 p-4 rounded-lg my-6 border border-gray-200">KnowLiq's strongest position is different: It is a focused academic system built around the student's persistent learning state.</p>

          {/* Section 38 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">38. Where KnowLiq Can Be Especially Helpful</h3>
          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="border border-gray-200 p-4 rounded bg-white"><h4 className="font-bold text-gray-800">Exam Preparation</h4><p className="text-sm text-gray-600">KnowLiq can turn academic resources and past papers into a structured learning environment.</p></div>
            <div className="border border-gray-200 p-4 rounded bg-white"><h4 className="font-bold text-gray-800">Finding Weak Areas</h4><p className="text-sm text-gray-600">Instead of relying entirely on the student's own judgment, diagnostic assessments can provide evidence about understanding.</p></div>
            <div className="border border-gray-200 p-4 rounded bg-white"><h4 className="font-bold text-gray-800">Long-Term Learning</h4><p className="text-sm text-gray-600">Persistent workspaces and learning memory become increasingly useful when a subject is studied over weeks or months.</p></div>
            <div className="border border-gray-200 p-4 rounded bg-white"><h4 className="font-bold text-gray-800">Technical Education</h4><p className="text-sm text-gray-600">The system can support subjects involving mathematics, engineering, physics, chemistry, and numerical problem solving.</p></div>
            <div className="border border-gray-200 p-4 rounded bg-white"><h4 className="font-bold text-gray-800">Revision</h4><p className="text-sm text-gray-600">Retention information can help identify concepts that need additional attention.</p></div>
            <div className="border border-gray-200 p-4 rounded bg-white"><h4 className="font-bold text-gray-800">Personalized Learning</h4><p className="text-sm text-gray-600">Students can choose language, learner type, response structure, field of study, and AI model.</p></div>
          </div>

          {/* Sections 39, 40 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">39. Personalization in KnowLiq</h3>
          <p>A major theme of the platform is that not every student should receive exactly the same AI experience. Two students may study the same subject but prefer completely different approaches.</p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm space-y-2 my-4">
            <p>Student A may want: <span className="font-semibold text-blue-700">Urdu + Visual & Analogy + Detailed</span></p>
            <p>Student B may want: <span className="font-semibold text-blue-700">English + Socratic + Normal</span></p>
            <p>Student C may want: <span className="font-semibold text-blue-700">Hindi + To-The-Point + Normal</span></p>
          </div>
          <p>The academic material may be identical. But the tutoring experience can be different. This is the idea of personalized learning.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">40. Personalization Has Multiple Dimensions</h3>
          <p>KnowLiq does not rely on one personalization setting. It can personalize several dimensions:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 my-4">
            <li><strong>What to learn:</strong> Determined through topics, importance, learning state, and prioritization.</li>
            <li><strong>How to learn:</strong> Determined through learner type (Visual & Analogy, Interactive Socratic, To-The-Point).</li>
            <li><strong>What language to use:</strong> Selected from the supported language options.</li>
            <li><strong>How much detail to provide:</strong> Selected through Detailed or Normal.</li>
            <li><strong>Which AI model to use:</strong> Selected through Stella, Astra, or Auto.</li>
          </ul>
          <p>This creates a multi-dimensional learning experience.</p>

          {/* Sections 41, 42, 43 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">41. Cost Efficiency Is Also Part of the Design</h3>
          <p>AI systems can become expensive when every interaction uses the most powerful model and generates unnecessarily long responses. KnowLiq therefore includes resource-conscious decisions. For example:</p>
          <ul className="list-disc pl-6 space-y-1 mb-4 text-gray-600">
            <li>Astra uses GPT-4o-mini for lighter interactions.</li>
            <li>Auto currently defaults to GPT-4o-mini.</li>
            <li>Normal response mode is designed to reduce cost by approximately 30%.</li>
            <li>More capable models can be reserved for situations where stronger reasoning is useful.</li>
          </ul>
          <p className="font-medium">This allows the system to pursue a balance between: Learning quality + response efficiency + operational cost.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">42. The Technology Behind KnowLiq</h3>
          <p>KnowLiq combines a modern web application with several AI services.</p>
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <div>
              <h4 className="font-bold text-gray-800 border-b pb-2 mb-2">Frontend</h4>
              <p className="text-sm text-gray-600 mb-2">The interface is built using technologies including:</p>
              <ul className="text-sm list-disc pl-5 text-gray-600">
                <li>React, Vite, React Router</li>
                <li>Tailwind CSS</li>
                <li>Axios, Firebase</li>
                <li>React Markdown, KaTeX, Lucide React</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 border-b pb-2 mb-2">Backend</h4>
              <p className="text-sm text-gray-600 mb-2">The backend uses:</p>
              <ul className="text-sm list-disc pl-5 text-gray-600">
                <li>Node.js, Express</li>
                <li>MongoDB, Mongoose</li>
                <li>Firebase Admin</li>
                <li>OpenAI APIs</li>
                <li>Multer, PDF processing</li>
              </ul>
            </div>
          </div>
          <p>The backend coordinates the learning workflow and persistent data.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">43. Database and Persistent Data</h3>
          <p>KnowLiq stores important learning information in MongoDB. Its data models include concepts such as: Users, Workspaces, Chats, Tests, Past Papers.</p>
          <p>This allows the platform to maintain a persistent representation of the student's learning environment. The workspace stores academic structure. Chat records store learning interactions. Tests store assessment information. Evaluation results update the learning state. Together, these components form the persistent learning system.</p>

          {/* Sections 44, 45 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">44. What Happens Behind One Chat Message?</h3>
          <p>When the student sends a question, the process is more than: <span className="font-mono text-sm bg-gray-100 px-2 rounded">Question → AI → Answer</span></p>
          <p>Conceptually, it can look like:</p>
          <div className="bg-gray-800 text-green-400 font-mono text-sm p-4 rounded-lg my-4 space-y-1 overflow-x-auto">
            Student Question<br/>
            ↓<br/>
            Identify selected AI model<br/>
            ↓<br/>
            Load student and workspace<br/>
            ↓<br/>
            Check current learning state<br/>
            ↓<br/>
            Determine current learning focus<br/>
            ↓<br/>
            Retrieve relevant learning memory<br/>
            ↓<br/>
            Build personalized tutoring context<br/>
            ↓<br/>
            Send the request to the selected AI model<br/>
            ↓<br/>
            Receive structured tutor response<br/>
            ↓<br/>
            Update learning state<br/>
            ↓<br/>
            Save the conversation<br/>
            ↓<br/>
            Return the answer to the student
          </div>
          <p>This allows the response to exist within the larger learning system.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">45. What Happens Behind a Test?</h3>
          <p>Similarly, a KnowLiq test is not simply: <span className="font-mono text-sm bg-gray-100 px-2 rounded">Click "Generate Quiz" → Random Questions</span></p>
          <div className="bg-gray-800 text-blue-300 font-mono text-sm p-4 rounded-lg my-4 space-y-1 overflow-x-auto">
            Current Learning Session<br/>
            ↓<br/>
            Retrieve relevant conversations<br/>
            ↓<br/>
            Understand concepts discussed<br/>
            ↓<br/>
            Identify possible gaps<br/>
            ↓<br/>
            Generate targeted questions<br/>
            ↓<br/>
            Restrict questions to relevant learning topics<br/>
            ↓<br/>
            Student answers<br/>
            ↓<br/>
            AI evaluates answers and reasoning<br/>
            ↓<br/>
            Assign retention states<br/>
            ↓<br/>
            Update workspace<br/>
            ↓<br/>
            Use updated states for future learning
          </div>
          <p>The assessment therefore becomes part of the learning engine.</p>

          {/* Sections 46, 47 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">46. Why the Closed Loop Matters</h3>
          <p>Imagine a system that teaches but never tests. It cannot reliably determine whether the student understood.</p>
          <p>Imagine a system that tests but does not remember the result. The next session starts almost from zero.</p>
          <p>Imagine a system that remembers results but does not use them to change study priorities. The memory has limited value.</p>
          <p>KnowLiq attempts to connect all three: <strong>Teaching ↔ Assessment ↔ Adaptation</strong>. That connection creates the closed learning loop.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">47. KnowLiq's Strongest Concept</h3>
          <p>If the entire platform had to be reduced to one technical idea, it would be: <strong className="text-blue-800">Learning state drives future learning.</strong></p>
          <p>The system does not simply collect information about the student. It attempts to use that information to make the next learning interaction more relevant. For example:</p>
          <ul className="space-y-2 font-mono bg-gray-50 p-4 rounded my-4">
            <li><span className="text-red-600 font-bold">Red</span> → Needs attention</li>
            <li><span className="text-yellow-600 font-bold">Yellow</span> → Needs reinforcement</li>
            <li><span className="text-green-600 font-bold">Green</span> → Strong / review when due</li>
          </ul>
          <p>That information becomes part of the next prioritization decision.</p>

          {/* Sections 48, 49 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">48. What KnowLiq Is Ultimately Trying to Build</h3>
          <p>The long-term vision is not simply another chatbot. The vision is a system that can continuously maintain a model of the student's academic journey. It should understand:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-600 mb-4">
            <li>What the student needs to learn.</li>
            <li>What the student has studied.</li>
            <li>What the student understands.</li>
            <li>Where the student is struggling.</li>
            <li>What the student has forgotten.</li>
            <li>What should be revised.</li>
            <li>What should be tested.</li>
            <li>What the student should learn next.</li>
          </ul>
          <p>And then use this information to continuously adapt the learning experience.</p>

          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">49. The Vision in One Pipeline</h3>
          <p>The entire concept can be summarized as:</p>
          <pre className="bg-gray-800 text-white p-6 rounded-lg overflow-x-auto text-sm font-mono my-6 leading-tight">
{`                    STUDENT
                       │
                       ▼
              Academic Material
                       │
                       ▼
              Knowledge Extraction
                       │
                       ▼
             Topics & Subtopics
                       │
                       ▼
             Learning Workspace
                       │
                       ▼
              Topic Prioritization
                       │
                       ▼
               Personalized Tutor
                       │
          ┌────────────┼────────────┐
          │            │            │
       Language    Learner Type   Response
          │            │         Structure
          │            │            │
          └────────────┼────────────┘
                       ▼
                 AI Learning
                       │
                       ▼
                Learning Memory
                       │
                       ▼
               Diagnostic Test
                       │
                       ▼
                AI Evaluation
                       │
                       ▼
               Retention State
                       │
                       ▼
             Updated Priorities
                       │
                       └──────────────┐
                                      │
                                      ▼
                              Next Learning Session`}
          </pre>
          <p>The loop continues as the student progresses.</p>

          {/* Section 50 */}
          <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">50. Final Perspective</h3>
          <p>AI has already made it possible for students to ask almost any question and receive an explanation. The next challenge is making AI understand the learning process around those questions.</p>
          <p>KnowLiq is built around this idea. It takes academic material and turns it into a structured learning environment. It identifies topics and subtopics. It considers academic importance. It prioritizes what the student should learn. It provides an AI tutor that can adapt to the student's preferred learner type, language, field of study, response structure, and selected model. It remembers relevant learning history. It generates tests based on what the student actually studied. It evaluates not only answers but understanding and reasoning. It assigns retention states. And those retention states influence what the student should focus on next.</p>
          <p>That creates a continuous cycle:</p>
          
          <div className="text-center font-bold text-xl text-blue-800 bg-blue-50 py-6 rounded-lg border border-blue-200 my-6 shadow-sm">
            Learn → Remember → Test → Evaluate → Adapt → Learn Again
          </div>

          <p>KnowLiq is therefore not intended to be simply another place where students ask an AI questions. It is designed as a persistent, personalized academic learning system where the AI can participate in the student's learning journey rather than only responding to individual prompts.</p>
          
          <p className="text-center font-bold text-2xl text-gray-900 mt-12 pt-12 border-t border-gray-200">
            The ultimate goal is straightforward: <br/>
            <span className="text-blue-700 block mt-4 font-extrabold text-3xl">Help students spend less time figuring out how to study and more time actually learning.</span>
          </p>
        </article>
      </main>
    </div>
  );
};

export default KnowLiqBlog;