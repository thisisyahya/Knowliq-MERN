import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Dashboard from "./Dashboard";
import TakeTest from "./TakeTest";
import SharedWorkspace from "./Shared";
import Settings from "./Settings";

// A simple 404 component
function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-mono">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-neutral-500">Page not found</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Exact match for the home page */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="*" element={<NotFound />} />
        <Route path="/taketest" element={<TakeTest/>}/>
        <Route path="/shared/:shared_workspace_id" element={<SharedWorkspace />} />
        <Route path = "/settings" element={<Settings/>}/>
      </Routes>
    </BrowserRouter>
  );
}