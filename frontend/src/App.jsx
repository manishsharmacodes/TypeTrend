import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import TypingTest from './pages/TypingTest';
import Prediction from './pages/Prediction';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Learn from './pages/Learn';
import { ToastProvider, useToast } from './components/Toast';
import { api } from './services/api';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('typetrend-theme') || 'dark');
  const [isHealthy, setIsHealthy] = useState(false);
  const [includeDemo, setIncludeDemo] = useState(false);
  const [dashboardKey, setDashboardKey] = useState(0);
  const { showToast } = useToast();

  // Theme synchronization
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('typetrend-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Health check on mount and interval
  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        await api.getHealth();
        if (isMounted) setIsHealthy(true);
      } catch (e) {
        if (isMounted) setIsHealthy(false);
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSeedDemo = async () => {
    try {
      const res = await api.seedDemoData();
      setIncludeDemo(true);
      showToast(res.message || 'Sample practice history loaded!', 'info');
      setDashboardKey((prev) => prev + 1);
    } catch (err) {
      showToast('Error seeding demo data: ' + err.message, 'error');
    }
  };

  const handleSessionSaved = () => {
    setDashboardKey((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        hasPrediction={true}
      />

      <div className="main-content">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          toggleTheme={toggleTheme}
          setMobileOpen={setMobileOpen}
          isHealthy={isHealthy}
          includeDemo={includeDemo}
          setIncludeDemo={setIncludeDemo}
          onSeedDemo={handleSeedDemo}
        />

        <main className="page-wrapper">
          {activeTab === 'dashboard' && (
            <Dashboard
              key={dashboardKey}
              setActiveTab={setActiveTab}
              includeDemo={includeDemo}
              setIncludeDemo={setIncludeDemo}
              onSeedDemo={handleSeedDemo}
            />
          )}

          {activeTab === 'typing-test' && (
            <TypingTest
              setActiveTab={setActiveTab}
              onSessionSaved={handleSessionSaved}
            />
          )}

          {activeTab === 'prediction' && (
            <Prediction
              setActiveTab={setActiveTab}
              includeDemo={includeDemo}
              setIncludeDemo={setIncludeDemo}
              onSeedDemo={handleSeedDemo}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics
              includeDemo={includeDemo}
              setIncludeDemo={setIncludeDemo}
              onSeedDemo={handleSeedDemo}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'goals' && (
            <Goals
              includeDemo={includeDemo}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'learn' && <Learn />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
