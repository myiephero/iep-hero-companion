import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Keep only critical routes synchronous for debugging
import Index from "./pages/Index-simple";
import NotFound from "./pages/NotFound";

function DebugApp() {
  console.log("🐛 Debug App Starting...");
  
  try {
    return (
      <div style={{ padding: '20px', backgroundColor: 'lightgreen', minHeight: '100vh' }}>
        <h1>🔧 DEBUGGING: Full App Structure Test</h1>
        <p>Step 1: Basic BrowserRouter ✅</p>
        
        <BrowserRouter basename="/m">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    );
  } catch (error) {
    console.error("🚨 App Error:", error);
    return (
      <div style={{ padding: '20px', backgroundColor: 'red', color: 'white' }}>
        <h1>❌ App Error</h1>
        <p>Error: {error?.toString()}</p>
      </div>
    );
  }
}

export default DebugApp;