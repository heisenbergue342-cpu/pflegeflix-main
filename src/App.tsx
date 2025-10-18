"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/kliniken">Kliniken</Link></li>
          <li><Link to="/altenheime">Altenheime</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kliniken" element={<Kliniken />} />
        <Route path="/altenheime" element={<Altenheime />} />
      </Routes>
    </Router>
  );
};

const Home = () => {
  return (
    <div>
      <h1>Willkommen</h1>
      {/* Hier können Sie den Hauptinhalt der Startseite einfügen */}
    </div>
  );
};

export default App;