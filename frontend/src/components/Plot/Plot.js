import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js';
import './Plot.css';
import { fetchPlotData } from '../../utils/api';

function Plot({molecule, allPhis, Phi, onPointClick, currentTheta, filePath, overlayPlots, overlayMode}) {
  const [plotData, setPlotData] = useState();
  const [highlightedPoint, setHighlightedPoint] = useState(null);
  useEffect(() => {
    if (filePath) {
      fetchPlotData(filePath)
        .then(data => {
          console.log('Fetched plot data:', data);
          setPlotData(data);
        })
        .catch(error => console.error('Error fetching plot data:', error));
    }
  }, [filePath]);

  useEffect(() => {
    console.log("plot data: " + plotData);
    if (plotData != null) {
      const traces = [];
      const processPhi = (phiValue) => {
        const E_delocs = [];
        const Thetas = [];

        
        plotData.forEach(item => {
          if (item.Phi === phiValue) {
            E_delocs.push(item.E_deloc);
            Thetas.push(item.Theta);
          }
        });

        const trace = {
          type: 'scatter',
          mode: 'lines+markers',
          name: `Phi = ${phiValue}`,
          x: Thetas,
          y: E_delocs,
          marker: { size: 10 }
        };
        traces.push(trace);
      };
      if (overlayMode) {
        overlayPlots.forEach(phiValue => {
          processPhi(phiValue);
        });      
      } else if (Phi != null) {
        processPhi(Phi);
      } else if(Phi === null){
        allPhis.forEach(phiValue => {
          processPhi(phiValue);
        });
      } 

      if (currentTheta !== null) {
        const currentThetaIndex = plotData.findIndex(item => item.Theta === currentTheta && item.Phi === Phi);
        if (currentThetaIndex !== -1) {
          const currentThetaPoint = plotData[currentThetaIndex];
          const currentThetaTrace = {
            type: 'scatter',
            mode: 'markers',
            name: 'Simulation',
            x: [currentThetaPoint.Theta],
            y: [currentThetaPoint.E_deloc],
            marker: { color: 'green', size: 12 }
          };
          traces.push(currentThetaTrace);
        }
      }
      if (highlightedPoint) {
        const highlightTrace = {
          type: 'scatter',
          mode: 'markers',
          name: 'Last Clicked',
          x: [highlightedPoint.theta],
          y: [highlightedPoint.E_deloc],
          marker: { color: 'red', size: 12 }
        };
        traces.push(highlightTrace);
      }
      let rangeValues;

      if(molecule === 'P3HT'){
        rangeValues = [1.098, 1.107];
      }
      if(molecule === 'PTB7FIN'){
        rangeValues = [1.04, 1.065];
      }
      if(molecule === 'PTB7FOUT'){
        rangeValues = [1.04, 1.065];
      }
      if(molecule ==='PNDIT'){
        rangeValues = [1.04, 1.065];
      }
      const layout = {
        title: 'Interactive Plot' + (allPhis ? ' for all Phi Values' : ' for Phi = ' + Phi),
        xaxis: { title: 'Theta (deg)' },
        yaxis: {
          title: 'Delocalization energy (kcal/mol)',
          range: rangeValues 
        }
      };

      const plotDivId = 'plot' + (allPhis ? 'All' : Phi);
      Plotly.newPlot(plotDivId, traces, layout);
      if (!allPhis) {
        const plotElement = document.getElementById(plotDivId);
        plotElement.on('plotly_click', (data) => {
          const thetaValue = data.points[0].x;
          const E_delocValue = data.points[0].y;
          setHighlightedPoint({ theta: thetaValue, E_deloc: E_delocValue });
          onPointClick(thetaValue);
        });
      }
    }
  }, [plotData, Phi, allPhis, onPointClick, highlightedPoint, currentTheta, filePath]);

  return <div id={"plot" + (allPhis ? 'All' : Phi)} className="plot-container"></div>;
}

export default Plot;
