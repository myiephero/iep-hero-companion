import { BrowserRouter, Routes, Route } from "react-router-dom";

function MinimalApp() {
  return (
    <BrowserRouter basename="/m">
      <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '100vh' }}>
        <h1>🎯 iOS Test - Mobile App Working!</h1>
        <p>Current URL: {window.location.href}</p>
        <p>Pathname: {window.location.pathname}</p>
        <p>iOS WebView: {navigator.userAgent.includes('Mobile') ? 'YES' : 'NO'}</p>
        
        <Routes>
          <Route path="/" element={
            <div>
              <h2>✅ React Router Working!</h2>
              <p>Base route successful</p>
            </div>
          } />
          <Route path="/test" element={
            <div>
              <h2>✅ Navigation Working!</h2>
              <button onClick={() => window.history.back()}>← Back</button>
            </div>
          } />
        </Routes>
        
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => window.location.href = '/m/test'}>
            Test Navigation
          </button>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default MinimalApp;