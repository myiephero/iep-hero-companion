import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import MatchDashboard from '@/pages/MatchDashboard';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matching" element={<MatchDashboard />} />
        </Routes>
        <Toaster position="top-right" />
      </Layout>
    </AuthProvider>
  );
}

export default App;