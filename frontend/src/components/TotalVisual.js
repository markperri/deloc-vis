import React, { useState, useEffect} from 'react';
import Plot from './Plot/Plot';
import Mol2Viewer from './Mol';

function TotalVisual({molecule}) {
  const plots = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60];
  const [openPlotIndex, setOpenPlotIndex] = useState(0);
  const [theta, setTheta] = useState(0); 
  const [currentTheta, setCurrentTheta] = useState(0);
  const [phi, setPhi] = useState(0);
  const [plots2, setPlots2] = useState([]);
  const [overlayMode, setOverlayMode] = useState(false);
  const [overlayPlots, setOverlayPlots] = useState([]);
  const instructions = '* Graph displays changes in energy due to electron delocalization based on changes the amount the polymer is bent \n'+
                      '* Clicking on the different Phi values will change the graph to show the electron delocalization based on changes in Theta at the specific Phi value \n'+
                      '* Clicking on any point on the graphs will display a Methylthiophene with the bends and torsions for the specified value of Phi and Theta \n' + 
                      '* Clicking on the "stop/start rotation" button will stop or start molecular rotation depending on its current state \n'+ 
                      '* Clicking on the "show isosurface" or "hide isosurface" button will show or hide the isosurface \n'+
                      '* Clicking on the "start simulation" or "stop simulation" button will start or stop the simulation showing the bending and torsion of the polymer \n'+
                      '* Other features for the molecule include the ability to drag, zoom-in, and zoom-out \n'
  const [isSimulating, setIsSimulating] = useState(false);
  const stopSimulation = () => {
    setIsSimulating(false);
  };
  const [isAnimating, setIsAnimating] = useState(false);
  const [showOrbitals, setShowOrbitals] = useState(false);
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
  }, [isSimulating, isAnimating]);
  const toggleOrbitals = () => {
    setShowOrbitals(prevShowOrbitals => !prevShowOrbitals);
  };
  const startSimulation = () => {
    setIsSimulating(true);
    console.log(isSimulating);
  };
  const stopAnimate = () => {
    setIsAnimating(prevState => !prevState); 
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
        return `sorted_deloc_energies_pndit.csv`;
    }
    if(molecule === 'PTB7FOUT'){
        return `sorted_deloc_energies_pndit.csv`;
    }
    if(molecule ==='PNDIT'){
        return `sorted_deloc_energies_pndit.csv`
    }
  };

  const currentFilePath = openPlotIndex !== null ? getFilePath(plots[openPlotIndex], theta) : '';
  const currentFilePathMol = openPlotIndex !== null ? getFilePathMol(plots[openPlotIndex], theta) : '';
  const currentFilePathPlot = openPlotIndex !== null ? getFilePathPlot(): '';


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
          <Plot allPhis= {plots} Phi={null} onPointClick={handlePointClick} currentTheta={currentTheta} filePath ={currentFilePathPlot}/>
        ) : (
        <div style={{ position: 'fixed', top: '150px', left: '38px'}}>
          {plots.map((phi, index) => (
            <div key={phi} style={{ padding: '15px'}}>
              <button onClick={() => handleClick(index, phi)}>Phi = {phi}</button>
              {openPlotIndex === index && <Plot Phi={phi} onPointClick={handlePointClick} overlayPlots={overlayPlots} overlayMode= {overlayMode} currentTheta={currentTheta} filePath ={currentFilePathPlot}/>}
            </div>
          ))}
        </div>
        )}
      </div>
      <h3 style={{ position: 'fixed', top: '140px', left: '900px'}}>
        Molecular Viewer
      </h3>
      <h4 style={{ position: 'fixed', top: '180px', left: '900px'}}>
        Phi= {phi} and Theta= {theta}
      </h4>
      <div style={{ position: 'fixed', top: '240px', left: '900px', border: "2px solid black"}}>
        <Mol2Viewer Phi={phi} Theta ={theta} filePath={currentFilePath} orbitalPath = {currentFilePathMol} isAnimating={isAnimating} showOrbitals={showOrbitals}/>
      </div>
      <h3 style ={{position: 'fixed', top: '750px',}}>
        Features and Instructions 
      </h3>
      <text style ={{position: 'fixed', top: '800px',whiteSpace: 'pre-line'}}>
        {instructions}
      </text>
      <button onClick={startSimulation} style={{ position: 'fixed', top: '675px', left: '900px' }}>
        Start Simulation
      </button>
      <button onClick={stopSimulation} style={{ position: 'fixed', top: '675px', left: '1045px' }}>
        Stop Simulation
      </button>
      <button onClick={stopAnimate} style={{ position: 'fixed', top: '200px', left: '1175px' }}>
        Stop/Start Rotation
      </button>
      <button onClick={toggleOrbitals} style={{ position: 'fixed', top: '675px', left: '1190px' }}>
        {showOrbitals ? 'Hide Isosurface' : 'Show Isosurface'}
      </button>
    </div>
  );
}

export default TotalVisual;
