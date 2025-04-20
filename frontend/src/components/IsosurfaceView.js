import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { fetchModelFiles } from "../utils/api";


const materialCache = {};

const materialPresets = {
    all: {
        grp1: new THREE.MeshStandardMaterial({ color: 0xD4D4D4, metalness: 0.1, roughness: 0.5 }), // Carbon
        default: new THREE.MeshStandardMaterial({ color: 0xD4D4D4, metalness: 0.1, roughness: 0.5 }) // Default
    },
    pndit: {
        grp7241: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.1, roughness: 0.5 }), // H
        grp12039: new THREE.MeshStandardMaterial({ color: 0xFF0000, metalness: 0.1, roughness: 0.5 }), // O
        grp13757: new THREE.MeshStandardMaterial({ color: 0xFFFF00, metalness: 0.1, roughness: 0.5 }), // S
        grp11585: new THREE.MeshStandardMaterial({ color: 0x00008B, metalness: 0.1, roughness: 0.5 })  // N
    },
    p3ht: {
        grp7241: new THREE.MeshStandardMaterial({ color: 0xFFFF00, metalness: 0.1, roughness: 0.5 }), // S
        grp3621: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.1, roughness: 0.5 })  // H
    },
    fout: {
        grp7241: new THREE.MeshStandardMaterial({ color: 0xFFFF00, metalness: 0.1, roughness: 0.5 }), // S
        grp8689: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.1, roughness: 0.5 }), // H
        grp13395: new THREE.MeshStandardMaterial({ color: 0xFF0000, metalness: 0.1, roughness: 0.5 }), // O
        grp14843: new THREE.MeshStandardMaterial({ color: 0xFFB6C1, metalness: 0.1, roughness: 0.5 })  // ??
    },
    fin: {
        grp7241: new THREE.MeshStandardMaterial({ color: 0xFFFF00, metalness: 0.1, roughness: 0.5 }), // S
        grp8689: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.1, roughness: 0.5 }), // H
        grp13395: new THREE.MeshStandardMaterial({ color: 0xFF0000, metalness: 0.1, roughness: 0.5 }), // O
        grp14843: new THREE.MeshStandardMaterial({ color: 0xFFB6C1, metalness: 0.1, roughness: 0.5 })  // ??
    }
};

const getAtomMaterial = (groupName, moleculeName) => {
    const preset = { ...materialPresets.all, ...materialPresets[moleculeName] };

    if (!materialCache[groupName]) {
        const material = preset[groupName] || preset.default;

        if (!preset[groupName]) {
            console.warn(`⚠️ Unknown group: ${groupName} for molecule: ${moleculeName}`);
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
                                roughness: 0.8,         
                                metalness: 0.0,         
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
                              const moleculeName = folderPath.split("/")[0];
                              console.log(moleculeName)
                              const material = getAtomMaterial(groupName, moleculeName);
                          
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
        <Canvas style={{ width: "100%", height: "100%" }} shadows>
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
