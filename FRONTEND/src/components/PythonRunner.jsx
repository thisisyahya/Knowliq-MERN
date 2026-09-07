import React, { useState, useEffect, useRef } from "react";
import { Play, Loader2, Terminal, AlertCircle, Image as ImageIcon } from "lucide-react";

export default function PythonRunner({ code }) {
  const [pyodide, setPyodide] = useState(null);
  const [output, setOutput] = useState("");
  const [plotImage, setPlotImage] = useState(null);
  const [loadingRuntime, setLoadingRuntime] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  const isInitialized = useRef(false);

  // Initialize Pyodide and load standard scientific packages
  useEffect(() => {
    async function loadPython() {
      if (isInitialized.current) return;
      isInitialized.current = true;

      try {
        if (window.loadPyodide) {
          const py = await window.loadPyodide();
          // Pre-load packages used in engineering & physics calculations
          await py.loadPackage(["numpy", "scipy", "matplotlib"]);
          setPyodide(py);
          setLoadingRuntime(false);
        } else {
          setError("Pyodide script tag not found in index.html");
          setLoadingRuntime(false);
        }
      } catch (err) {
        setError(`Failed to load Python runtime: ${err.message}`);
        setLoadingRuntime(false);
      }
    }

    loadPython();
  }, []);

  const runCode = async () => {
    if (!pyodide || executing) return;
    setExecuting(true);
    setOutput("");
    setPlotImage(null);
    setError(null);

    try {
      // Wrapper to capture stdout (print statements) and matplotlib plots as base64 images
      const executionWrapper = `
import sys
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Intercept standard output
sys.stdout = io.StringIO()

# Execute user script
${code}

# Capture printed text
captured_stdout = sys.stdout.getvalue()

# Capture any drawn matplotlib plots
encoded_plot = ""
if plt.get_fignums():
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
    buf.seek(0)
    encoded_plot = base64.b64encode(buf.read()).decode('utf-8')
    plt.close('all')

[captured_stdout, encoded_plot]
`;

      const result = await pyodide.runPythonAsync(executionWrapper);
      const [stdoutText, base64Plot] = result.toJs();

      setOutput(stdoutText || "Code executed successfully with no output.");
      if (base64Plot) {
        setPlotImage(`data:image/png;base64,${base64Plot}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="my-4 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <Terminal size={15} className="text-purple-600" />
          <span>Python Execution Environment</span>
        </div>

        <button
          onClick={runCode}
          disabled={loadingRuntime || executing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg text-xs font-medium transition-all shadow-sm active:scale-95"
        >
          {loadingRuntime ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Loading Engine...</span>
            </>
          ) : executing ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play size={13} fill="currentColor" />
              <span>Run Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Display (Collapsible or Preview) */}
      <div className="p-3 bg-gray-900 text-gray-100 text-xs font-mono overflow-x-auto max-h-56 leading-relaxed">
        <pre>{code}</pre>
      </div>

      {/* Execution Results Section */}
      {(output || plotImage || error) && (
        <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-3">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <pre className="whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {/* Terminal Console Output */}
          {output && (
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Output:
              </span>
              <pre className="p-2.5 rounded-lg bg-gray-900 text-green-400 font-mono text-xs whitespace-pre-wrap overflow-x-auto border border-gray-800">
                {output}
              </pre>
            </div>
          )}

          {/* Matplotlib Graphical Plot */}
          {plotImage && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                <ImageIcon size={13} />
                <span>Generated Plot:</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 flex justify-center">
                <img
                  src={plotImage}
                  alt="Simulation Result"
                  className="max-h-80 w-auto rounded shadow-sm object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}