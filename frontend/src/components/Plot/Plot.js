import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js';
import './Plot.css';
import { fetchPlotData } from '../../utils/api';

function Plot({ Phi, onPointClick }) { 
  const [plotData, setPlotData] = useState(null);
  const E_delocs = [];
  const Thetas = [];

  useEffect(() => {
    fetchPlotData()
      .then(data => {
        console.log('Fetched plot data:', data);
        setPlotData(data);
      })
      .catch(error => console.error('Error fetching plot data:', error));
  }, []);

  useEffect(() => {
    if (plotData) {
      plotData.forEach(item => {
        if (item.Phi === Phi) {
          E_delocs.push(item.E_deloc);
          Thetas.push(item.Theta);
        }
      });
  
      const trace = {
        type: 'scatter',
        mode: 'lines+markers',
        x: Thetas,
        y: E_delocs,
        marker: { color: 'red', size: 10 },
      };
  
      const layout = {
        title: 'Interactive Plot for Phi = ' + Phi,
        xaxis: { title: 'Theta' },
        yaxis: { title: 'E_deloc' },
      };
  
      const plotDivId = 'plot' + Phi;
      Plotly.newPlot(plotDivId, [trace], layout);
  
      
      const plotElement = document.getElementById(plotDivId);
      plotElement.on('plotly_click', (data) => {
        const thetaValue = data.points[0].x;
        onPointClick(thetaValue);
      });
    }
  }, [plotData, Phi, onPointClick]);
  
  return <div id={"plot" + Phi} className="plot-container"></div>;
}  

export default Plot;
