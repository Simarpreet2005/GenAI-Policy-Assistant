import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChatDashboard from './pages/ChatDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen text-textMain selection:bg-primary/20">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
