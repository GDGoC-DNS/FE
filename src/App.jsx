import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import DashboardHome from './pages/DashboardHome';
import DomainSearchPage from './pages/DomainSearchPage';
import DNSPage from './pages/DNSPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* 대시보드 레이아웃 그룹 */}
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index element={<DashboardHome />} />
          <Route path="search" element={<DomainSearchPage />} />
          <Route path="dns" element={<DNSPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;