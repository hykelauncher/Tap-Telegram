import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';

const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/:userId" element={<App />} />
    </Routes>
  </Router>
);

export default AppRouter;
