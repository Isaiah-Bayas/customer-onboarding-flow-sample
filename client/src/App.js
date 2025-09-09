import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import WizardPage from './pages/WizardPage';
import AdminPage from './pages/AdminPage';
import Table from './pages/TableView';
import './App.css';


export default function App() {
  return (
    <div>
      <nav>
        {/* <Link to="/" style={{ marginRight: 8 }}>Login</Link> |{" "} */}
        <Link to="/wizard/page2" style={{ marginRight: 8 }}>Home</Link> |{" "}
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/wizard/:id" element={<WizardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/data" element={<Table/>} />
      </Routes>
    </div>
  );
}
