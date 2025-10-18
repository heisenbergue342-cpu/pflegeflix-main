import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Clinics from './components/Clinics';
import Hospitals from './components/Hospitals';
import Menu from './components/Menu';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <header>
          <Menu />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clinics" element={<Clinics />} />
            <Route path="/hospitals" element={<Hospitals />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;