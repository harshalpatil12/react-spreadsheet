// src/App.js
import React from 'react';
import Spreadsheet from './components/SpreadSheet';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-white p-6 font-sans">
      <header className="mb-4 border-b pb-3">
        <h1 className="text-3xl font-bold text-gray-800">Spreadsheet component</h1>
      </header>
      <Spreadsheet />
    </div>
  );
}

export default App;
