import React, { useState, useEffect } from 'react';
import Plot from './Plot/Plot';
import Mol2Viewer from './Mol';
import IsosurfaceView from './IsosurfaceView';
import styles from './TotalVisual.module.css';

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
      return `fout/Dimethoxy_Benzodithiophene_Phi_${phi}_Theta_${theta}_Methylcarbonyl_3_Fluoro_Thienothiophene`;
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
    <div className={styles.container}>
      {/* Plot Section */}
      <div className={styles.plotSection}>
        <div className={styles.plotControls}>
          <button
            className={styles.overlayButton}
            onClick={handleOverlayClick}
          >
            {overlayMode ? "Stop Overlaying Plots" : "Overlay Plots"}
          </button>
          <button
            className={styles.overlayButton}
            onClick={toggleAllGraphs}
          >
            {showAllGraphs ? 'Close All' : 'Open All'}
          </button>
        </div>
        
        {showAllGraphs ? (
          <div className={styles.plotItem}>
            <Plot
              molecule={molecule}
              allPhis={plots}
              Phi={null}
              onPointClick={handlePointClick}
              currentTheta={currentTheta}
              filePath={currentFilePathPlot}
            />
          </div>
        ) : (
          <div className={styles.plotList}>
            {plots.map((phi, index) => (
              <div key={phi} className={styles.plotItem}>
                <button
                  className={styles.overlayButton}
                  onClick={() => handleClick(index, phi)}
                >
                  Phi = {phi}
                </button>
                {openPlotIndex === index && (
                  <Plot
                    molecule={molecule}
                    Phi={phi}
                    onPointClick={handlePointClick}
                    overlayPlots={overlayPlots}
                    overlayMode={overlayMode}
                    currentTheta={currentTheta}
                    filePath={currentFilePathPlot}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Viewer Section */}
      <div className={styles.viewerSection}>
        <div className={styles.viewerHeader}>
          <h3 className={styles.viewerTitle}>
            {molecule} Molecular Viewer
          </h3>
          <h4 className={styles.viewerSubtitle}>
            Phi= {phi !== null ? phi : 0} and Theta= {theta}
          </h4>
        </div>

        <div className={styles.viewerContainer}>
          <div className={styles.viewerContent}>
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
        </div>

        <div className={styles.controlsSection}>
          <button
            className={`${styles.button} ${styles.secondary}`}
            onClick={toggleViewMode}
          >
            {viewMode === VIEW_MODES.STANDARD ? 'Show Delocalization' : 'Show Standard View'}
          </button>

          {viewMode === VIEW_MODES.STANDARD && (
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={toggleHOMO}
            >
              {showHOMO ? 'Hide HOMO' : 'Show HOMO'}
            </button>
          )}

          <button
            className={styles.button}
            onClick={startSimulation}
          >
            Start Simulation
          </button>
          <button
            className={`${styles.button} ${styles.secondary}`}
            onClick={stopSimulation}
          >
            Stop Simulation
          </button>
        </div>
      </div>

      {/* Instructions Section */}
      <div className={styles.instructionsSection}>
        <h3 className={styles.instructionsTitle}>
          Features and Instructions
        </h3>
        <div className={styles.instructionsText}>
          {instructions}
        </div>
      </div>
    </div>
  );
}

export default TotalVisual;
