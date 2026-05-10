import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import AddCandidateForm from './components/AddCandidateForm';
import RecruiterDashboard from './components/RecruiterDashboard';
import { Home } from './pages/Home';
import { PositionPipelinePage } from './pages/PositionPipelinePage';

/** Un único `<BrowserRouter>` vive en `index.tsx`; aquí solo `<Routes>`. */
function App() {
  return (
    <Routes>
      <Route path="/" element={<RecruiterDashboard />} />
      <Route path="/add-candidate" element={<AddCandidateForm />} />
      <Route path="/positions" element={<Navigate to="/pipeline" replace />} />
      <Route path="/pipeline" element={<Home />} />
      <Route path="/positions/:positionId" element={<PositionPipelinePage />} />
    </Routes>
  );
}

export default App;
