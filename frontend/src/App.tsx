import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import AddCandidateForm from './components/AddCandidateForm';
import RecruiterDashboard from './components/RecruiterDashboard';
import { LegacyPositionsRedirect } from './pages/LegacyPositionsRedirect';
import { PositionsListPage } from './pages/PositionsListPage';
import { PositionPipelinePage } from './pages/PositionPipelinePage';

/** Un único `<BrowserRouter>` vive en `index.tsx`; aquí solo `<Routes>`. */
function App() {
  return (
    <Routes>
      <Route path="/" element={<RecruiterDashboard />} />
      <Route path="/add-candidate" element={<AddCandidateForm />} />
      <Route path="/positions/:positionId" element={<LegacyPositionsRedirect />} />
      <Route path="/pipeline" element={<Navigate to="/posiciones" replace />} />
      <Route path="/positions" element={<Navigate to="/posiciones" replace />} />
      <Route path="/posiciones" element={<PositionsListPage />} />
      <Route path="/posiciones/:positionId" element={<PositionPipelinePage />} />
    </Routes>
  );
}

export default App;
