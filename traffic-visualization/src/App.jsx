import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TrafficMap from './components/Traffic'; 
import AccidentPrediction from './components/AccidentPrediction'; 
import './App.css'; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<TrafficMap />} />
      <Route path="/predictions" element={<AccidentPrediction />} />
    </Routes>
  );
}

export default App;