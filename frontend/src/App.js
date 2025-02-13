import React from 'react';
import TotalVisual from './components/TotalVisual';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './App.css';


const NavBar = () => {
  const linkStyle = {
      padding: '20px',
      fontSize: '20px',
      transition: 'box-shadow 0.3s ease', 
      color: '#000000', 
      textDecoration: 'none'
  };
  return (
    <nav style={{ 
        backgroundColor: '#ffffff', 
        display: 'flex',
        justifyContent: 'space-between',
        padding: '15px 20px', 
        boxShadow: '0 6px 2px -2px rgba(0,0,0,.2)'
    }}>
      <h1 style={{ 
          fontSize: '2rem', 
          color: '#000000', 
          paddingTop: '0px',
          marginBottom: '0px',
          flexShrink: 0 
      }}>
        Visualization Tool for Energy Displacement of Electron Delocalization
      </h1>
      <div style={{
          display: 'flex', 
          justifyContent: 'flex-end', 
      }}>
          <Link to="/PNDIT" style={linkStyle} className="nav-link">PNDIT</Link>
          <Link to="/P3HT" style={linkStyle} className="nav-link">P3HT</Link>
          <Link to="/PTB7FOUT" style={linkStyle} className="nav-link">PTB7FOUT</Link>
          <Link to="/PTB7FIN" style={linkStyle} className="nav-link">PTB7FIN</Link>
      </div>
    </nav>
  );
}  
function App() {
  
  return (
    <div>
            <Router>
                <NavBar />
                <Routes>
                    <Route path="/PNDIT" element={<TotalVisual molecule = {'PNDIT'}/>}/>
                    <Route path="/P3HT" element={<TotalVisual molecule = {'P3HT'}/>}/>
                    <Route path="/PTB7FOUT" element={<TotalVisual molecule = {'PTB7FOUT'}/>} />
                    <Route path="/PTB7FIN" element={<TotalVisual molecule = {'PTB7FIN'}/>} />
                    <Route path="*" element={<TotalVisual molecule = {'PNDIT'}/>} />
                </Routes>
            </Router>
        </div>
  );
}

export default App;
