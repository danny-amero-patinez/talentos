import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { InterviewPortal } from './pages/InterviewPortal';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/interview" replace />} />
        <Route path="/interview" element={<InterviewPortal />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
