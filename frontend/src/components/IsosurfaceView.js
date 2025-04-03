import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { fetchModelFiles } from "../utils/api";


const materialCache = {};

const getAtomMaterial = (groupName) => {
    if (!materialCache[groupName]) {
        console.log(`here`);
        const materialMap = {
            grp1: new THREE.MeshStandardMaterial({ color: 0x202020	, metalness: 0.1, roughness: 0.5 }), // Carbon (black/gray)
            grp3621: new THREE.MeshStandardMaterial({ color: 0xFFFF00	, metalness: 0.1, roughness: 0.5 }), // Sulfur (yellow)
            grp7241: new THREE.MeshStandardMaterial({ color: 0xFF0000	, metalness: 0.1, roughness: 0.5 }), // Oxygen (red)
            grp7965: new THREE.MeshStandardMaterial({ color: 0xFFFFFF	, metalness: 0.1, roughness: 0.5 }), // Hydrogen (white)
            default: new THREE.MeshStandardMaterial({ color: 0xFF0000	, metalness: 0.1, roughness: 0.5 }) // Default green
        };
        
        const material = materialMap[groupName] || materialMap.default;

        if (material === materialMap.default) {
            console.warn(`⚠️ Unknown group: ${groupName}`);
        }

        materialCache[groupName] = material;

    }
    return materialCache[groupName];
};

const CameraControl = ({ controlRef }) => {
    const { camera, gl } = useThree();

    useEffect(() => {
        if (controlRef.current) {
            controlRef.current.target.set(0, 0, 0); 
            controlRef.current.update();
        }
    }, [controlRef]);

    return <OrbitControls ref={controlRef} args={[camera, gl.domElement]} />;
};

const IsosurfaceView = ({ folderPath }) => {
    const [stlMesh, setStlMesh] = useState(null);
    const [meshMesh, setMeshMesh] = useState(null);
    const [glbScene, setGlbScene] = useState(null);
    const groupRef = useRef();
    const cameraRef = useRef();
    const controlsRef = useRef();

    useEffect(() => {
        const loadModels = async () => {
            console.log("Fetching models for:", folderPath);
            try {
                const files = await fetchModelFiles(folderPath);
                console.log("Files received:", files);

                const stlLoader = new STLLoader();
                const gltfLoader = new GLTFLoader();

                // Save current camera state
                const prevPosition = cameraRef.current ? cameraRef.current.position.clone() : null;
                const prevTarget = controlsRef.current ? controlsRef.current.target.clone() : null;

                

                if (files["Isoober.stl"]) {
                    stlLoader.load(files["Isoober.stl"], (geometry) => {
                        
                        geometry.computeVertexNormals();
                        const mesh = new THREE.Mesh(
                            geometry,
                            new THREE.MeshStandardMaterial({ color:'rgb(255, 255, 4)', 
                                roughness: 0.8,         // Make surface more matte = stronger shading
                                metalness: 0.0,         // Non-metallic looks more natural for atoms
                                side: THREE.DoubleSide,     
                                flatShading: false   
                            })
                        );
                        mesh.rotation.x = -Math.PI;
                        mesh.scale.set(0.5, 0.5, 0.5);
                        setMeshMesh(mesh);
                        console.log("Loaded Isoober.stl");
                    });
                }

                if (files["color.glb"]) {
                    gltfLoader.load(files["color.glb"], (gltf) => {
                        

                        gltf.scene.rotation.x = -Math.PI;
                        gltf.scene.scale.set(0.5, 0.5, 0.5);

                        console.log("GLTF Scene:", gltf.scene);
                        const objectName = folderPath.split("/")[1]; 

                        const mainObject = gltf.scene.children.find(child => 
                            child.name.includes(objectName)
                        );

                        if (!mainObject) {
                            console.error("Main object not found inside GLB!");
                            return;
                        }

                        console.log("Main Object:", folderPath);

                        mainObject.children.forEach((mesh) => {
                            if (mesh.isMesh) {
                              const groupName = mesh.name;
                              const material = getAtomMaterial(groupName);
                          
                              console.log(`Assigning material to mesh: ${mesh.name}, color: ${material.color.getHexString()}`);
                          
                              mesh.material = material;
                            }
                          });

                        setGlbScene(gltf.scene);
                        console.log("Loaded color.glb with colored atoms");
                    });
                }

                // Restore previous camera position and target after models load
                setTimeout(() => {
                    if (prevPosition && cameraRef.current) {
                        cameraRef.current.position.copy(prevPosition);
                    }
                    if (prevTarget && controlsRef.current) {
                        controlsRef.current.target.copy(prevTarget);
                        controlsRef.current.update();
                    }
                }, 100); // Slight delay to ensure scene updates

            } catch (error) {
                console.error("Error loading models:", error);
            }
        };

        loadModels();
    }, [folderPath]);

    return (
        <Canvas style={{ width: "500px", height: "500px" }} shadows>
            <ambientLight intensity={2} />
            <directionalLight position={[1, 1, 1]} intensity={1} />

            <group ref={groupRef}>
                {stlMesh && <primitive object={stlMesh} />}
                {glbScene && <primitive object={glbScene} />}
                {meshMesh && <primitive object={meshMesh} />}
            </group>

            <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 6]} />
            <CameraControl controlRef={controlsRef} />
        </Canvas>
    );
};

export default IsosurfaceView;
