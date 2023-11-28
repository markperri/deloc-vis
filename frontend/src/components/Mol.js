import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol/build/3Dmol.js';
import { fetchStructureData } from '../utils/api';

const MolecularViewer = ({ filePath }) => {
    const viewerRef = useRef();

    useEffect(() => {
        console.log("viewerRef.current:", viewerRef.current);
        if (!viewerRef.current) {
            console.error("Viewer element is not mounted correctly");
            return;
        }

        fetchStructureData(filePath)
            .then((data) => {
                console.log("Molecule data:", data); 
                let viewer = new $3Dmol.createViewer(viewerRef.current);

                viewer.addModel(data.data, "mol2");
                viewer.setStyle({}, { stick: {radius: 0.1}, sphere: {radius: 0.5} });
                viewer.zoomTo();
                viewer.render();
                let isAnimating = true;
                function animate() {
                    if(isAnimating){
                        viewer.rotate(1, {y:0.5});
                        viewer.render();
                        requestAnimationFrame(animate);
                    }
                }
                animate();
                viewer.container.addEventListener('click', function() {
                    isAnimating = !isAnimating; 
                    if (isAnimating) animate(); 
                });
            })
            .catch((error) => {
                console.error("Error loading .mol2 file:", error);
            });
    }, [filePath]);

    return <div ref={viewerRef} style={{ width: '400px', height: '400px' }} />;
};

export default MolecularViewer;
