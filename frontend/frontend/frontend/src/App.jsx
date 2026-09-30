import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AppShell from './components/common/AppShell';
import DashboardPage from './pages/DashboardPage';
import AIAssistantPage from './pages/AIAssistantPage';
import MarineMapPage from './pages/MarineMapPage';
import PFZExplorerPage from './pages/PFZExplorerPage';
import SafetyRiskPage from './pages/SafetyRiskPage';
import SafeRoutesPage from './pages/SafeRoutesPage';
import AlertsPage from './pages/AlertsPage';
import WeatherPage from './pages/WeatherPage';
import PlaceholderPage from './pages/PlaceholderPage';
import SettingsPage from './pages/SettingsPage';
import GeofencesPage from './pages/GeofencesPage';
import ReportsPage from './pages/ReportsPage';
import { Hexagon, FileText } from 'lucide-react';

export default function App() {
  const navigate = useNavigate();

  return (
    <AppShell
      onAskAI={() => navigate('/ai-assistant')}
      onEmergency={() => navigate('/alerts')}
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/marine-map" element={<MarineMapPage />} />
        <Route path="/pfz-explorer" element={<PFZExplorerPage />} />
        <Route path="/safety-risk" element={<SafetyRiskPage />} />
        <Route path="/safe-routes" element={<SafeRoutesPage />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/geofences" element={<GeofencesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}
