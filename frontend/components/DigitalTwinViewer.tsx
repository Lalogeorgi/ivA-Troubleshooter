'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, RotateCcw } from 'lucide-react';

interface DigitalTwinViewerProps {
  activeMeshNodeId?: string | null;
  highlightedComponent?: string | null;
  onSelectComponent?: (meshNodeId: string) => void;
}

export function DigitalTwinViewer({
  activeMeshNodeId,
  highlightedComponent,
  onSelectComponent,
}: DigitalTwinViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(activeMeshNodeId || null);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  const meshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (activeMeshNodeId) {
      setSelectedNode(activeMeshNodeId);
    }
  }, [activeMeshNodeId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1120); // Nocturnal Slate
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2); // Light blue key
    dirLight1.position.set(15, 25, 20);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf43f5e, 0.6); // Warm accent fill
    dirLight2.position.set(-20, 10, -15);
    scene.add(dirLight2);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x334155, 0x1e293b);
    gridHelper.position.y = -6;
    scene.add(gridHelper);

    // 3. Build BioMed Analyzer X200 Physical Geometry
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const meshes = new Map<string, THREE.Mesh>();

    // A. Main Chassis Body
    const chassisGeo = new THREE.BoxGeometry(22, 11, 14);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.set(0, -0.5, 0);
    chassis.receiveShadow = true;
    rootGroup.add(chassis);

    // Chassis Acrylic Top Cover
    const coverGeo = new THREE.BoxGeometry(22.2, 0.4, 14.2);
    const coverMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.25,
    });
    const cover = new THREE.Mesh(coverGeo, coverMat);
    cover.position.set(0, 5.2, 0);
    rootGroup.add(cover);

    // B. Subsystem 1: Fluidics Manifold & Syringe Pump P-102 (Left Bay: BAY-FL-01)
    const fluidicsBayGeo = new THREE.BoxGeometry(7, 8, 9);
    const fluidicsBayMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.3,
    });
    const fluidicsBay = new THREE.Mesh(fluidicsBayGeo, fluidicsBayMat);
    fluidicsBay.position.set(-6.5, 0, 0);
    rootGroup.add(fluidicsBay);

    // Component: Syringe Pump P-102 (Cylinder + Stepper Motor Base)
    const pumpGroup = new THREE.Group();
    pumpGroup.position.set(-6.5, 0.5, 1);

    const pumpBaseGeo = new THREE.BoxGeometry(2.2, 2.2, 2.2);
    const pumpBaseMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const pumpBase = new THREE.Mesh(pumpBaseGeo, pumpBaseMat);
    pumpGroup.add(pumpBase);

    const pumpCylinderGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.5, 24);
    const pumpCylinderMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant cyan/blue
      roughness: 0.2,
      metalness: 0.5,
    });
    const pumpCylinder = new THREE.Mesh(pumpCylinderGeo, pumpCylinderMat);
    pumpCylinder.position.set(0, 2.5, 0);
    (pumpCylinder as any).userData = { meshNodeId: 'PUMP_P102', name: 'Syringe Pump P-102' };
    pumpGroup.add(pumpCylinder);
    meshes.set('PUMP_P102', pumpCylinder);

    rootGroup.add(pumpGroup);

    // Component: Manifold Pressure Sensor PS-23
    const sensorGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.4, 16);
    const sensorMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Gold / Yellow
      roughness: 0.3,
      metalness: 0.7,
    });
    const sensorMesh = new THREE.Mesh(sensorGeo, sensorMat);
    sensorMesh.rotation.z = Math.PI / 2;
    sensorMesh.position.set(-4.5, 1.8, 1);
    (sensorMesh as any).userData = { meshNodeId: 'SENSOR_PS23', name: 'Pressure Sensor PS-23' };
    rootGroup.add(sensorMesh);
    meshes.set('SENSOR_PS23', sensorMesh);

    // Component: 3-Way Pinch Valve V-04
    const valveGeo = new THREE.BoxGeometry(1.2, 1.5, 1.2);
    const valveMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7, // Purple
      roughness: 0.4,
      metalness: 0.6,
    });
    const valveMesh = new THREE.Mesh(valveGeo, valveMat);
    valveMesh.position.set(-6.5, -2, 1);
    (valveMesh as any).userData = { meshNodeId: 'VALVE_V04', name: '3-Way Solenoid Valve V-04' };
    rootGroup.add(valveMesh);
    meshes.set('VALVE_V04', valveMesh);

    // C. Subsystem 2: Optics & Photometer Bench (Center Bay: BAY-OP-01)
    const opticsBayGeo = new THREE.BoxGeometry(6, 6, 8);
    const opticsBayMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.8,
      metalness: 0.2,
    });
    const opticsBay = new THREE.Mesh(opticsBayGeo, opticsBayMat);
    opticsBay.position.set(0.5, -1, 0);
    rootGroup.add(opticsBay);

    // Component: Halogen Lamp LS-01
    const lampGeo = new THREE.SphereGeometry(0.9, 16, 16);
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Warm Amber
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });
    const lampMesh = new THREE.Mesh(lampGeo, lampMat);
    lampMesh.position.set(-0.8, -0.5, 0);
    (lampMesh as any).userData = { meshNodeId: 'LAMP_LS01', name: 'Halogen Lamp LS-01' };
    rootGroup.add(lampMesh);
    meshes.set('LAMP_LS01', lampMesh);

    // Component: Quartz Micro Flow Cell FC-01
    const flowCellGeo = new THREE.BoxGeometry(1.4, 2.2, 1.4);
    const flowCellMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const flowCellMesh = new THREE.Mesh(flowCellGeo, flowCellMat);
    flowCellMesh.position.set(1.8, -0.5, 0);
    (flowCellMesh as any).userData = { meshNodeId: 'FLOWCELL_FC01', name: 'Quartz Flow Cell FC-01' };
    rootGroup.add(flowCellMesh);
    meshes.set('FLOWCELL_FC01', flowCellMesh);

    // D. Subsystem 3: Robotic Pipetting Tower & Arm (Right Bay: BAY-RB-01)
    const towerGeo = new THREE.CylinderGeometry(0.7, 0.7, 9, 20);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
    const towerMesh = new THREE.Mesh(towerGeo, towerMat);
    towerMesh.position.set(7.5, 1, -2);
    rootGroup.add(towerMesh);

    // Component: Sample Arm ARM-SAMPLE
    const armGeo = new THREE.BoxGeometry(6, 0.6, 1.2);
    const armMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Emerald Green
      metalness: 0.7,
      roughness: 0.3,
    });
    const armMesh = new THREE.Mesh(armGeo, armMat);
    armMesh.position.set(5.5, 4.5, -0.5);
    (armMesh as any).userData = { meshNodeId: 'ARM_SAMPLE', name: 'Pipettor Arm ARM-01' };
    rootGroup.add(armMesh);
    meshes.set('ARM_SAMPLE', armMesh);

    meshesRef.current = meshes;

    // 4. Mouse Controls (Orbit Rotation & Zoom)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      rootGroup.rotation.y += deltaX * 0.008;
      rootGroup.rotation.x = Math.max(-0.6, Math.min(0.6, rootGroup.rotation.x + deltaY * 0.008));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(15, Math.min(50, camera.position.z + e.deltaY * 0.03));
    };

    // Raycaster for clicking on components
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(rootGroup.children, true);

      for (const hit of intersects) {
        const userData = (hit.object as any).userData;
        if (userData && userData.meshNodeId) {
          setSelectedNode(userData.meshNodeId);
          if (onSelectComponent) onSelectComponent(userData.meshNodeId);
          break;
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('click', onClick);

    // 5. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow idle rotation if user is not dragging and isRotating is true
      if (!isDragging && isRotating) {
        rootGroup.rotation.y += 0.003;
      }

      // Highlight active / selected node with pulsing emissive glow
      meshes.forEach((mesh, nodeId) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const isHighlighted = nodeId === activeMeshNodeId || nodeId === selectedNode;

        if (isHighlighted) {
          const pulse = (Math.sin(elapsedTime * 6) + 1) / 2;
          mat.emissive = new THREE.Color(0xef4444); // Red pulse for active issue/investigation
          mat.emissiveIntensity = 0.5 + pulse * 0.8;
        } else {
          mat.emissive = new THREE.Color(0x000000);
          mat.emissiveIntensity = 0;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 500;
      const newHeight = container.clientHeight || 400;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [isRotating, activeMeshNodeId, selectedNode, onSelectComponent]);

  return (
    <div className="flex flex-col h-full bg-[#0a1120] border border-[#1e2e4a] rounded-2xl overflow-hidden shadow-xl">
      {/* 3D Viewport Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111c30] border-b border-[#1e2e4a]">
        <div className="flex items-center gap-2.5">
          <Box className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Spatial Digital Twin (BioMed X200)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`min-h-[36px] px-3 py-1.5 text-xs font-mono font-semibold rounded-xl border transition-colors focus-ring ${
              isRotating
                ? 'bg-sky-950/80 border-sky-700/60 text-sky-300'
                : 'bg-[#0a1120] border-[#1e2e4a] text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Auto Rotation"
          >
            <RotateCcw className="w-3.5 h-3.5 inline mr-1.5" />
            {isRotating ? 'Rotating' : 'Paused'}
          </button>
        </div>
      </div>

      {/* WebGL Canvas Container */}
      <div className="relative flex-1 min-h-[360px] cursor-grab active:cursor-grabbing" ref={containerRef}>
        {/* Floating Component HUD Overlay */}
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex items-end justify-between">
          <div className="bg-[#111c30]/95 backdrop-blur-md border border-[#2a3d60] rounded-xl p-3.5 text-xs shadow-xl max-w-sm pointer-events-auto">
            <div className="text-slate-400 uppercase tracking-wider font-mono text-[10px] mb-1 font-semibold">
              Active Spatial Inspection
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
              <span className="font-bold text-white text-sm">
                {selectedNode ? selectedNode : 'Overview Mode (All Subsystems)'}
              </span>
            </div>
            {selectedNode === 'PUMP_P102' && (
              <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                Syringe Dispense Pump P-102 (P/N 948-230-01). Bay BAY-FL-01. Stepper motor CAN node 12.
              </p>
            )}
            {selectedNode === 'SENSOR_PS23' && (
              <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                Line Pressure Transducer PS-23 (P/N 948-510-23). Nominal 114–126 kPa. Analog 4–20mA.
              </p>
            )}
            {selectedNode === 'VALVE_V04' && (
              <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                3-Way Pinch Valve V-04 (P/N 948-112-04). GPIO High-Side driver. Fluidics manifold block.
              </p>
            )}
            {selectedNode === 'LAMP_LS01' && (
              <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                Pre-focused 12V 20W Tungsten-Halogen Source LS-01. Photometer bench BAY-OP-01.
              </p>
            )}
            {selectedNode === 'FLOWCELL_FC01' && (
              <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                Quartz Micro Flow Cell FC-01 (10mm path length). Absorbance 340–800nm.
              </p>
            )}
            {selectedNode === 'ARM_SAMPLE' && (
              <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                Dual-axis robotic pipettor tower ARM-01 with Z-axis optical flag sensor.
              </p>
            )}
          </div>

          <div className="bg-[#111c30]/90 backdrop-blur border border-[#1e2e4a] rounded-lg px-2.5 py-1 text-[10px] text-slate-400 font-mono">
            Drag to Orbit • Scroll to Zoom
          </div>
        </div>
      </div>

      {/* Component Quick Selector Tabs */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#111c30] border-t border-[#1e2e4a] overflow-x-auto text-xs">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold mr-1 shrink-0">
          Jump to:
        </span>
        {[
          { id: 'PUMP_P102', label: 'Pump P-102' },
          { id: 'SENSOR_PS23', label: 'Sensor PS-23' },
          { id: 'VALVE_V04', label: 'Valve V-04' },
          { id: 'LAMP_LS01', label: 'Lamp LS-01' },
          { id: 'FLOWCELL_FC01', label: 'Flow Cell' },
          { id: 'ARM_SAMPLE', label: 'Pipettor Arm' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setSelectedNode(item.id);
              if (onSelectComponent) onSelectComponent(item.id);
            }}
            className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-mono whitespace-nowrap transition-all focus-ring ${
              selectedNode === item.id
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold'
                : 'bg-[#0a1120] text-slate-400 hover:text-slate-200 border border-[#1e2e4a]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
