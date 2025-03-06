import React, { useState, useEffect } from 'react';
import Plot from './Plot/Plot';
import Mol2Viewer from './Mol';
import IsosurfaceView from './IsosurfaceView';

const VIEW_MODES = {
  STANDARD: 'standard',
  DELOCALIZATION: 'delocalization'
};

function TotalVisual({molecule}) {
  const plots = [0, 5, 10, 15, 20, 25, 30];
  const [openPlotIndex, setOpenPlotIndex] = useState(0);
  const [theta, setTheta] = useState(0);
  const [currentTheta, setCurrentTheta] = useState(0);
  const [phi, setPhi] = useState(0);
  const [overlayMode, setOverlayMode] = useState(false);
  const [overlayPlots, setOverlayPlots] = useState([]);
  const [viewMode, setViewMode] = useState(VIEW_MODES.STANDARD);
  const [showHOMO, setShowHOMO] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const instructions = '* Graph displays changes in energy due to electron delocalization based on changes the amount the polymer is bent \n'+
                      '* Clicking on the different Phi values will change the graph to show the electron delocalization based on changes in Theta at the specific Phi value \n'+
                      '* Clicking on any point on the graphs will display a Methylthiophene with the bends and torsions for the specified value of Phi and Theta \n' +
                      '* In standard view, you can toggle the HOMO isosurface on/off \n'+
                      '* You can switch between standard view (molecule with optional HOMO) and delocalization view \n'+
                      '* The simulation controls work in both views to show the bending and torsion of the polymer \n'+
                      '* Other features for the molecule include the ability to drag, zoom-in, and zoom-out \n'
  
  const stopSimulation = () => {
    setIsSimulating(false);
  };
  const [showAllGraphs, setShowAllGraphs] = useState(false);
  const toggleAllGraphs = () => {
    setShowAllGraphs(!showAllGraphs);
    setPhi(null);
  };

  useEffect(() => {
    if (isSimulating) {
      let currentTheta = 0;
      const interval = setInterval(() => {
        handlePointClick(currentTheta);
        setCurrentTheta(currentTheta);
        currentTheta+=10;
        if (currentTheta >= 360) {
          clearInterval(interval);
          setIsSimulating(false);
        }
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [isSimulating]);

  const toggleViewMode = () => {
    setViewMode(prev =>
      prev === VIEW_MODES.STANDARD ? VIEW_MODES.DELOCALIZATION : VIEW_MODES.STANDARD
    );
  };

  const toggleHOMO = () => {
    setShowHOMO(prev => !prev);
  };

  const startSimulation = () => {
    setIsSimulating(true);
  };
  

  const handleClick = (index, phi) => {
    if (overlayMode) {
      setOverlayPlots(prevOverlayPlots => {
        if (!prevOverlayPlots.includes(phi)) {
          return [...prevOverlayPlots, phi];
        } else {
          return prevOverlayPlots; 
        }
      });
    } else {
      setPhi(phi);
      setOpenPlotIndex(index);
      setIsSimulating(false);
    }
  };

  const handlePointClick = (xValue) => {
    setTheta(xValue); 
    setCurrentTheta(xValue);
  };

  const handleOverlayClick = () => {
    setOverlayMode(!overlayMode); 
    if (!overlayMode) {
      setOverlayPlots([]); 
    }
  };

  const getFilePath = (phi, theta) => {
    if(molecule === 'P3HT'){
        return `p3ht-mol2s/Methylthiophene_Phi_${phi}_Theta_${theta}_Methylthiophene.mol2`;
    }
    if(molecule === 'PTB7FIN'){
        return `ptb7fin-mol2s/fin_bdt_Phi_${phi}_Theta_${theta}_fin_ftt.mol2`;
    }
    if(molecule === 'PTB7FOUT'){
        return `ptb7fout-mol2s/Dimethoxy_Benzodithiophene_Phi_${phi}_Theta_${theta}_Methylcarbonyl_3_Fluoro_Thienothiophene.mol2`;
    }
    if(molecule ==='PNDIT'){
        return `pndit-mol2s/Dimethyl_Naphthalene_Dicarboximide_Phi_${phi}_Theta_${theta}_Thiophene.mol2`
    }
  };
  const getFilePathMol = (phi, theta) => {
    if(molecule === 'P3HT'){
        return `p3ht-cubes/Methylthiophene_Phi_${phi}_Theta_${theta}_Methylthiophene.cube`;
    }
    if(molecule === 'PTB7FIN'){
        return `ptb7fin-cubes/fin_bdt_Phi_${phi}_Theta_${theta}_fin_ftt.cube`;
    }
    if(molecule === 'PTB7FOUT'){
        return `ptb7fout-cubes/Dimethoxy_Benzodithiophene_Phi_${phi}_Theta_${theta}_Methylcarbonyl_3_Fluoro_Thienothiophene.cube`;
    }
    if(molecule ==='PNDIT'){
        return `pndit-cubes/Dimethyl_Naphthalene_Dicarboximide_Phi_${phi}_Theta_${theta}_Thiophene.cube`
    }
  };
  const getFilePathPlot = () => {
    if(molecule === 'P3HT'){
        return `p3mt.csv`;
    }
    if(molecule === 'PTB7FIN'){
        return `ptb7in.csv`;
    }
    if(molecule === 'PTB7FOUT'){
        return `ptb7out.csv`;
    }
    if(molecule ==='PNDIT'){
        return `pndit.csv`
    }
  };

  const getFolderPath = (phi, theta) => {
    if(molecule === 'P3HT'){
      return `p3ht/Methylthiophene_Phi_${phi}_Theta_${theta}_Methylthiophene`;
    }
    if(molecule === 'PTB7FIN'){
      return `fin/fin_bdt_Phi_${phi}_Theta_${theta}_fin_ftt`;
    }
    if(molecule === 'PTB7FOUT'){
    }
    if(molecule ==='PNDIT'){
      return `pndit/Dimethyl_Naphthalene_Dicarboximide_Phi_${phi}_Theta_${theta}_Thiophene`;
    }
  };

  const currentFilePath = openPlotIndex !== null ? getFilePath(plots[openPlotIndex], theta) : '';
  const currentFilePathMol = openPlotIndex !== null ? getFilePathMol(plots[openPlotIndex], theta) : '';
  const currentFilePathPlot = openPlotIndex !== null ? getFilePathPlot(): '';
  const currentFolderPath = openPlotIndex !== null ? getFolderPath(plots[openPlotIndex], theta) : '';

  return (
    <div className="App" style={{ marginTop: '50px', marginLeft: '30px' }}>
    <button onClick={handleOverlayClick} style={{ position: 'fixed', top: '130px', left: '430px' }}>
      {overlayMode ? "Stop Overlaying Plots" : "Overlay Plots"}
    </button>      
    <button onClick={toggleAllGraphs} style={{ position: 'fixed', top: '680px', left: '53px' }}>
        {showAllGraphs ? 'Close All' : 'Open All'}
      </button>
      <div style={{ marginTop: '150px' }}>
        {showAllGraphs ? (
          <Plot molecule = {molecule} allPhis= {plots} Phi={null} onPointClick={handlePointClick} currentTheta={currentTheta} filePath ={currentFilePathPlot}/>
        ) : (
        <div style={{ position: 'fixed', top: '150px', left: '38px'}}>
          {plots.map((phi, index) => (
            <div key={phi} style={{ padding: '15px'}}>
              <button onClick={() => handleClick(index, phi)}>Phi = {phi}</button>
              {openPlotIndex === index && <Plot molecule = {molecule} Phi={phi} onPointClick={handlePointClick} overlayPlots={overlayPlots} overlayMode= {overlayMode} currentTheta={currentTheta} filePath ={currentFilePathPlot}/>}
            </div>
          ))}
        </div>
        )}
      </div>
      <h3 style={{ position: 'fixed', top: '140px', left: '900px'}}>
        {molecule} Molecular Viewer
      </h3>
      <h4 style={{ position: 'fixed', top: '180px', left: '900px'}}>
        Phi= {phi} and Theta= {theta}
      </h4>
      <div style={{ position: 'fixed', top: '240px', left: '900px', width: '500px', height: '500px', border: "2px solid black"}}>
        {viewMode === VIEW_MODES.STANDARD ? (
          <Mol2Viewer
            Phi={phi}
            Theta={theta}
            filePath={currentFilePath}
            orbitalPath={currentFilePathMol}
            showOrbitals={showHOMO}
          />
        ) : (
          <IsosurfaceView folderPath={currentFolderPath}/>
        )}
      </div>
      
      {/* Controls Container - Vertical Layout */}
      <div style={{
        position: 'fixed',
        top: '240px',
        left: '1410px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* View Mode Toggle */}
        <button onClick={toggleViewMode}>
          {viewMode === VIEW_MODES.STANDARD ? 'Show Delocalization' : 'Show Standard View'}
        </button>

        {/* HOMO Toggle (Standard View Only) */}
        {viewMode === VIEW_MODES.STANDARD && (
          <button onClick={toggleHOMO}>
            {showHOMO ? 'Hide HOMO' : 'Show HOMO'}
          </button>
        )}

        {/* Simulation Controls */}
        <button onClick={startSimulation}>
          Start Simulation
        </button>
        <button onClick={stopSimulation}>
          Stop Simulation
        </button>
      </div>

      {/* Instructions */}
      <h3 style={{position: 'fixed', top: '750px'}}>
        Features and Instructions
      </h3>
      <text style={{position: 'fixed', top: '800px', whiteSpace: 'pre-line'}}>
        {instructions}
      </text>
    </div>
  );
}

export default TotalVisual;
