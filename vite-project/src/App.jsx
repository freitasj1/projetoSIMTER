import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import './App.css'; // Adicione estilos conforme necessário

function App() {
  return (
    <div className="app">
      <Header />
      <div className="main">
        <Sidebar />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
