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
        grp1: new THREE.MeshStandardMaterial({ color: 0x54fdfd, metalness: 0.1, roughness: 0.1 }), // Carbon
        default: new THREE.MeshStandardMaterial({ color: 0x54fdfd, metalness: 0.1, roughness: 0.1 }) // Default
    },
    pndit: {
        grp7241: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.1, roughness: 0.1 }), // H
        grp12039: new THREE.MeshStandardMaterial({ color: 0xFF0000, metalness: 0.1, roughness: 0.1 }), // O
        grp13757: new THREE.MeshStandardMaterial({ color: 0xFFFF00, metalness: 0.1, roughness: 0.1 }), // S
        grp11585: new THREE.MeshStandardMaterial({ color: 0x00008B, metalness: 0.1, roughness: 0.1 })  // N
    },
    p3ht: {
        grp7241: new THREE.MeshStandardMaterial({ color: 0xFFFF00, metalness: 0.1, roughness: 0.1 }), // S
        grp3621: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.1, roughness: 0.1 })  // H
    },
    fout: {
        grp7241: new THREE.MeshStandardMaterial({ color: 0xFFFF00, metalness: 0.1, roughness: 0.5 }), // S
        grp8689: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.1, roughness: 0.5 }), // H
        grp13395: new THREE.MeshStandardMaterial({ color: 0xFF0000, metalness: 0.1, roughness: 0.5 }), // O
        grp14843: new THREE.MeshStandardMaterial({ color: 0xFFB6C1, metalness: 0.1, roughness: 0.5 })  // ??
    },
    fin: {
        grp7241: new THREE.MeshStandardMaterial({ color: 0xFFFF00, metalness: 0.1, roughness: 0.1 }), // S
        grp8689: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.1, roughness: 0.1 }), // H
        grp13395: new THREE.MeshStandardMaterial({ color: 0xFF0000, metalness: 0.1, roughness: 0.1 }), // O
        grp14843: new THREE.MeshStandardMaterial({ color: 0xFFB6C1, metalness: 0.1, roughness: 0.1})  // ??
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

                if (files["Isoober.stl"]) {
                    stlLoader.load(files["Isoober.stl"], (geometry) => {
                        
                        geometry.computeVertexNormals();
                        const mesh = new THREE.Mesh(
                            geometry,
                            new THREE.MeshPhongMaterial({ color:'#4d83f0', 
                                roughness: 0.2,
                                metalness: 0.0,         
                                side: THREE.DoubleSide,     
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
                        console.log("Object Name:", objectName);
                        console.log("GLTF Children:", gltf.scene.children);
                        console.log(gltf.scene.children.find(child => 
                            child.name.includes(objectName)
                        ))
                        const mainObject = gltf.scene.children.find(child => 
                            child.name.includes("")
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
                              mesh.castShadow = true;
                              mesh.receiveShadow = true;
                              const outlineMaterial = new THREE.MeshBasicMaterial({
                                color: 0x222222,
                                side: THREE.BackSide
                              });
                              
                              const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial);
                              outlineMesh.scale.set(1.005, 1.005, 1.005); 
                              mesh.add(outlineMesh);
                            }
                          });

                        setGlbScene(gltf.scene);
                        console.log("Loaded color.glb with colored atoms");
                    });
                }

                
            } catch (error) {
                console.error("Error loading models:", error);
            }
        };

        loadModels();
    }, [folderPath]);
    
    return (
        <Canvas style={{ width: "100%", height: "100%" }} shadows onCreated={({ gl }) => {
            gl.toneMapping = THREE.NoToneMapping;
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
          >
            <ambientLight intensity={3.4} />


            <directionalLight
                position={[2, 5, 3]}
                intensity={10}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-near={0.5}
                shadow-camera-far={20}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />
            
            <directionalLight
                position={[-2, -3, -3]}
                intensity={10}
                color="#aaaaaa"
            />
            <group ref={groupRef}>
                {stlMesh && <primitive object={stlMesh} castShadow
  receiveShadow />}
                {glbScene && <primitive object={glbScene} castShadow
  receiveShadow contour/>}
                {meshMesh && <primitive object={meshMesh} castShadow
  receiveShadow/>}
            </group>

            <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 6]} />
            <CameraControl controlRef={controlsRef} />
            
        </Canvas>
    );
};

export default IsosurfaceView;
