import React, { useState, useEffect} from 'react';
import Plot from './components/Plot/Plot';
import Mol2Viewer from './components/Mol';

function App() {
  const plots = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60];
  const [openPlotIndex, setOpenPlotIndex] = useState(0);
  const [theta, setTheta] = useState(0); 
  const [currentTheta, setCurrentTheta] = useState(0);
  const [phi, setPhi] = useState(0);
  const instructions = '* Graph displays changes in energy due to electron delocalization based on changes the amount the polymer is bent \n'+
                      '* Clicking on the different Phi values will change the graph to show the electron delocalization based on changes in Theta at the specific Phi value \n'+
                      '* Clicking on any point on the graphs will display a Dimethyl Naphthalene Dicarboximide Thiophene with the bends and torsions for the specified value of Phi and Theta \n' + 
                      '* Clicking on the polymer displayed will stop the animation until re-clicked \n'+ 
                      '* Other features for the molecule include the ability to drag, zoom-in, and zoom-out'
  const [isSimulating, setIsSimulating] = useState(false);
  const stopSimulation = () => {
    setIsSimulating(false);
  };
  const [isAnimating, setIsAnimating] = useState(false);
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

  const startSimulation = () => {
    setIsSimulating(true);
    console.log(isSimulating);
  };
  const stopAnimate = () => {
    setIsAnimating(prevState => !prevState); 
  };
  

  const handleClick = (index, phi) => {
    setPhi(phi);
    setOpenPlotIndex(openPlotIndex === index ? index : index);
    setIsSimulating(false);
  };

  const handlePointClick = (xValue) => {
    setTheta(xValue); 
    setCurrentTheta(xValue);
  };

  const getFilePath = (phi, theta) => {
    return `Dimethyl_Naphthalene_Dicarboximide_Phi_${phi}_Theta_${theta}_Thiophene.mol2`;
  };
  const getFilePathMol = (phi, theta) => {
    return `Methylthiophene_Phi_${phi}_Theta_${theta}_Methylthiophene.cube`;
  };

  const currentFilePath = openPlotIndex !== null ? getFilePath(plots[openPlotIndex], theta) : '';
  const currentFilePathMol = openPlotIndex !== null ? getFilePathMol(plots[openPlotIndex], theta) : '';


  return (
    <div className="App" style={{ marginTop: '50px', marginLeft: '30px' }}>
      <h1 style={{ position: 'fixed', top: '40px', left: '50px', width: '100%', backgroundColor: 'white', zIndex: 1 }}>
        Visualization Tool for Energy Displacement of Electron Delocalization
      </h1>
      <div style={{ marginTop: '150px' }}>
        {plots.map((phi, index) => (
          <div key={phi} style={{ padding: '17px' }}>
            <button onClick={() => handleClick(index, phi)}>Phi = {phi}</button>
            {openPlotIndex === index && <Plot Phi={phi} onPointClick={handlePointClick} currentTheta={currentTheta}/>}
          </div>
        ))}
      </div>
      <h3 style={{ position: 'fixed', top: '140px', left: '900px'}}>
           Dimethyl Naphthalene Dicarboximide Thiophene
      </h3>
      <h4 style={{ position: 'fixed', top: '180px', left: '900px'}}>
        Phi= {phi} and Theta= {theta}
      </h4>
      <div style={{ position: 'fixed', top: '240px', left: '900px', border: "2px solid black"}}>
        <Mol2Viewer filePath={currentFilePath} orbitalPath = {currentFilePathMol} isAnimating={isAnimating}/>
      </div>
      <h3 style ={{position: 'fixed', top: '750px',}}>
        Features and Instructions 
      </h3>
      <text style ={{position: 'fixed', top: '800px',whiteSpace: 'pre-line'}}>
        {instructions}
      </text>
      <button onClick={startSimulation} style={{ position: 'fixed', top: '675px', left: '990px' }}>
        Start Simulation
      </button>
      <button onClick={stopSimulation} style={{ position: 'fixed', top: '675px', left: '1110px' }}>
        Stop Simulation
      </button>
      <button onClick={stopAnimate} style={{ position: 'fixed', top: '200px', left: '1175px' }}>
        Stop/Start Rotation
      </button>
    </div>
  );
}

export default App;
