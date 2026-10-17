import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeDEnvironmentConfig } from '../types/lyrics';

interface ThreeDBackgroundProps {
  config?: ThreeDEnvironmentConfig;
  className?: string;
}

export const ThreeDBackground: React.FC<ThreeDBackgroundProps> = ({
  config,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!config || !config.enabled || config.sceneType === 'none') {
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Create Three.js Scene, Camera, and WebGLRenderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.0025);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 40);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Attach canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Mouse parallax tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = x * 0.4;
      mouse.targetY = y * 0.4;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Color parsing
    const primaryColor = new THREE.Color(config.primaryColor || '#f59e0b');
    const secondaryColor = new THREE.Color(config.secondaryColor || '#6366f1');

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(primaryColor.getHex(), 2.5, 120);
    pointLight.position.set(0, 15, 25);
    scene.add(pointLight);

    // Clean-up list for meshes and animators
    const animators: ((time: number, delta: number) => void)[] = [];
    const disposables: { dispose: () => void }[] = [];

    // SCENE GENERATION BASED ON CONFIG TYPE
    if (config.sceneType === 'celestial-nebula') {
      // 1. Volumetric 3D Stars
      const starCount = config.particleCount || 1800;
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);
      const starSizes = new Float32Array(starCount);

      for (let i = 0; i < starCount; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 200;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 160;
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 240;

        const mixRatio = Math.random();
        const c = primaryColor.clone().lerp(secondaryColor, mixRatio);
        starColors[i * 3] = c.r;
        starColors[i * 3 + 1] = c.g;
        starColors[i * 3 + 2] = c.b;

        starSizes[i] = Math.random() * 2.2 + 0.8;
      }

      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
      disposables.push(starGeo);

      // Procedural circular soft point sprite
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
      grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      const starTexture = new THREE.CanvasTexture(canvas);
      disposables.push(starTexture);

      const starMat = new THREE.PointsMaterial({
        size: 3.2,
        vertexColors: true,
        map: starTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      disposables.push(starMat);

      const starField = new THREE.Points(starGeo, starMat);
      scene.add(starField);

      // Nebula clouds (smooth rotating organic rings)
      const cloudGroup = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const torusGeo = new THREE.TorusGeometry(20 + i * 12, 6 + i * 2, 16, 60);
        const torusMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? primaryColor : secondaryColor,
          wireframe: true,
          transparent: true,
          opacity: 0.08,
          blending: THREE.AdditiveBlending,
        });
        disposables.push(torusGeo, torusMat);
        const cloud = new THREE.Mesh(torusGeo, torusMat);
        cloud.rotation.x = Math.PI / 3 + i * 0.4;
        cloudGroup.add(cloud);
      }
      scene.add(cloudGroup);

      animators.push((t, d) => {
        const spd = config.speed * 0.4;
        starField.rotation.y = t * 0.02 * spd;
        cloudGroup.rotation.z = t * 0.015 * spd;
        cloudGroup.rotation.y = t * 0.01 * spd;

        // Infinite forward flight sensation
        const positions = starGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < starCount; i++) {
          positions[i * 3 + 2] += d * 18 * spd;
          if (positions[i * 3 + 2] > 60) {
            positions[i * 3 + 2] = -140;
          }
        }
        starGeo.attributes.position.needsUpdate = true;
      });
    } else if (config.sceneType === 'cathedral-rays') {
      // 2. Volumetric God Rays & Sanctuary Motes
      const rayGroup = new THREE.Group();
      const numRays = 8;
      for (let i = 0; i < numRays; i++) {
        const rayGeo = new THREE.CylinderGeometry(0.8, 12, 120, 18, 1, true);
        const rayMat = new THREE.MeshBasicMaterial({
          color: primaryColor,
          transparent: true,
          opacity: 0.045 + Math.random() * 0.03,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        disposables.push(rayGeo, rayMat);
        const ray = new THREE.Mesh(rayGeo, rayMat);
        ray.position.set((i - numRays / 2) * 14, 25, -20);
        ray.rotation.z = -0.3 + (i / numRays) * 0.35;
        ray.rotation.x = 0.2;
        rayGroup.add(ray);
      }
      scene.add(rayGroup);

      // Rising Golden Motes
      const moteCount = config.particleCount || 1000;
      const moteGeo = new THREE.BufferGeometry();
      const motePos = new Float32Array(moteCount * 3);
      for (let i = 0; i < moteCount; i++) {
        motePos[i * 3] = (Math.random() - 0.5) * 90;
        motePos[i * 3 + 1] = (Math.random() - 0.5) * 80;
        motePos[i * 3 + 2] = (Math.random() - 0.5) * 70;
      }
      moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
      disposables.push(moteGeo);

      const moteMat = new THREE.PointsMaterial({
        size: 2.4,
        color: primaryColor,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });
      disposables.push(moteMat);
      const motes = new THREE.Points(moteGeo, moteMat);
      scene.add(motes);

      animators.push((t, d) => {
        const spd = config.speed;
        rayGroup.rotation.y = Math.sin(t * 0.25 * spd) * 0.08;

        const pos = moteGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < moteCount; i++) {
          pos[i * 3 + 1] += d * 5 * spd; // gently rising upward
          pos[i * 3] += Math.sin(t + i) * 0.02 * spd;
          if (pos[i * 3 + 1] > 40) {
            pos[i * 3 + 1] = -40;
          }
        }
        moteGeo.attributes.position.needsUpdate = true;
      });
    } else if (config.sceneType === 'kinetic-waves') {
      // 3. Kinetic Undulating Wireframe Waves (Ocean of Grace)
      const planeWidth = 140;
      const planeHeight = 100;
      const segW = 60;
      const segH = 45;
      const planeGeo = new THREE.PlaneGeometry(planeWidth, planeHeight, segW, segH);
      planeGeo.rotateX(-Math.PI / 2.3);
      planeGeo.translate(0, -14, -10);
      disposables.push(planeGeo);

      const planeMat = new THREE.MeshBasicMaterial({
        color: primaryColor,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      disposables.push(planeMat);
      const terrain = new THREE.Mesh(planeGeo, planeMat);
      scene.add(terrain);

      // Accent particles on wave crests
      const crestCount = 400;
      const crestGeo = new THREE.BufferGeometry();
      const crestPos = new Float32Array(crestCount * 3);
      for (let i = 0; i < crestCount; i++) {
        crestPos[i * 3] = (Math.random() - 0.5) * 120;
        crestPos[i * 3 + 1] = -12;
        crestPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      }
      crestGeo.setAttribute('position', new THREE.BufferAttribute(crestPos, 3));
      disposables.push(crestGeo);

      const crestMat = new THREE.PointsMaterial({
        size: 3.0,
        color: secondaryColor,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      disposables.push(crestMat);
      const crestPoints = new THREE.Points(crestGeo, crestMat);
      scene.add(crestPoints);

      const originalPositions = planeGeo.attributes.position.clone();

      animators.push((t) => {
        const spd = config.speed * 1.5;
        const pos = planeGeo.attributes.position;
        const orig = originalPositions.array as Float32Array;
        const current = pos.array as Float32Array;

        for (let i = 0; i < pos.count; i++) {
          const u = orig[i * 3];
          const v = orig[i * 3 + 2];
          // Harmonic wave calculation
          const wave1 = Math.sin(u * 0.08 + t * spd) * 3.5;
          const wave2 = Math.cos(v * 0.09 + t * spd * 0.8) * 2.5;
          const wave3 = Math.sin((u + v) * 0.05 + t * spd * 1.2) * 1.5;

          current[i * 3 + 1] = orig[i * 3 + 1] + wave1 + wave2 + wave3;
        }
        pos.needsUpdate = true;
      });
    } else if (config.sceneType === 'sacred-halo') {
      // 4. Sacred Geometric Halo & Golden Aura
      const haloGroup = new THREE.Group();

      // Outer Main Torus
      const torusGeo = new THREE.TorusGeometry(16, 0.75, 24, 80);
      const torusMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        emissive: primaryColor,
        emissiveIntensity: 0.6,
        roughness: 0.25,
        metalness: 0.9,
      });
      disposables.push(torusGeo, torusMat);
      const torus = new THREE.Mesh(torusGeo, torusMat);
      haloGroup.add(torus);

      // Inner Interlocking Torus
      const innerGeo = new THREE.TorusGeometry(12, 0.4, 20, 60);
      const innerMat = new THREE.MeshStandardMaterial({
        color: secondaryColor,
        emissive: secondaryColor,
        emissiveIntensity: 0.5,
        wireframe: true,
      });
      disposables.push(innerGeo, innerMat);
      const inner = new THREE.Mesh(innerGeo, innerMat);
      haloGroup.add(inner);

      // Floating Icosahedron Core
      const coreGeo = new THREE.IcosahedronGeometry(5, 1);
      const coreMat = new THREE.MeshBasicMaterial({
        color: primaryColor,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
      disposables.push(coreGeo, coreMat);
      const core = new THREE.Mesh(coreGeo, coreMat);
      haloGroup.add(core);

      haloGroup.position.set(0, 2, -5);
      scene.add(haloGroup);

      // Orbiting Aura Motes
      const ringParticleCount = 600;
      const ringGeo = new THREE.BufferGeometry();
      const ringPos = new Float32Array(ringParticleCount * 3);
      for (let i = 0; i < ringParticleCount; i++) {
        const theta = (i / ringParticleCount) * Math.PI * 2;
        const rad = 17 + (Math.random() - 0.5) * 4;
        ringPos[i * 3] = Math.cos(theta) * rad;
        ringPos[i * 3 + 1] = Math.sin(theta) * rad;
        ringPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      }
      ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
      disposables.push(ringGeo);

      const ringMat = new THREE.PointsMaterial({
        size: 2.2,
        color: primaryColor,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
      });
      disposables.push(ringMat);
      const ringPoints = new THREE.Points(ringGeo, ringMat);
      haloGroup.add(ringPoints);

      animators.push((t) => {
        const spd = config.speed;
        torus.rotation.x = t * 0.25 * spd;
        torus.rotation.y = t * 0.35 * spd;
        inner.rotation.x = -t * 0.3 * spd;
        inner.rotation.y = t * 0.4 * spd;
        core.rotation.y = t * 0.5 * spd;
        ringPoints.rotation.z = -t * 0.2 * spd;
      });
    } else if (config.sceneType === 'constellation') {
      // 5. Interconnected 3D Constellation Nodes
      const nodeCount = 85;
      const nodeGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(nodeCount * 3);
      const velocities: THREE.Vector3[] = [];

      for (let i = 0; i < nodeCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 90;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        velocities.push(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.15,
            (Math.random() - 0.5) * 0.15,
            (Math.random() - 0.5) * 0.15
          )
        );
      }
      nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      disposables.push(nodeGeo);

      const nodeMat = new THREE.PointsMaterial({
        size: 3.5,
        color: primaryColor,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      disposables.push(nodeMat);
      const nodePoints = new THREE.Points(nodeGeo, nodeMat);
      scene.add(nodePoints);

      // Connecting lines geometry
      const maxLines = (nodeCount * (nodeCount - 1)) / 2;
      const linePositions = new Float32Array(maxLines * 6);
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      disposables.push(lineGeo);

      const lineMat = new THREE.LineBasicMaterial({
        color: secondaryColor,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
      });
      disposables.push(lineMat);
      const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(linesMesh);

      animators.push((t, d) => {
        const spd = config.speed;
        const pos = nodeGeo.attributes.position.array as Float32Array;

        // Move nodes
        for (let i = 0; i < nodeCount; i++) {
          pos[i * 3] += velocities[i].x * spd;
          pos[i * 3 + 1] += velocities[i].y * spd;
          pos[i * 3 + 2] += velocities[i].z * spd;

          // Bounce limits
          if (Math.abs(pos[i * 3]) > 48) velocities[i].x *= -1;
          if (Math.abs(pos[i * 3 + 1]) > 32) velocities[i].y *= -1;
          if (Math.abs(pos[i * 3 + 2]) > 28) velocities[i].z *= -1;
        }
        nodeGeo.attributes.position.needsUpdate = true;

        // Reconnect lines within proximity distance
        let lineIdx = 0;
        const lineArr = lineGeo.attributes.position.array as Float32Array;
        const connectDistSq = 22 * 22;

        for (let i = 0; i < nodeCount; i++) {
          for (let j = i + 1; j < nodeCount; j++) {
            const dx = pos[i * 3] - pos[j * 3];
            const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
            const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
            const distSq = dx * dx + dy * dy + dz * dz;

            if (distSq < connectDistSq) {
              lineArr[lineIdx++] = pos[i * 3];
              lineArr[lineIdx++] = pos[i * 3 + 1];
              lineArr[lineIdx++] = pos[i * 3 + 2];

              lineArr[lineIdx++] = pos[j * 3];
              lineArr[lineIdx++] = pos[j * 3 + 1];
              lineArr[lineIdx++] = pos[j * 3 + 2];
            }
          }
        }
        lineGeo.setDrawRange(0, lineIdx / 3);
        lineGeo.attributes.position.needsUpdate = true;
      });
    }

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Camera parallax / orbit choreography
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      if (config.cameraMotion === 'orbit') {
        const orbitRadius = 42;
        const angle = elapsed * 0.08 * config.speed;
        camera.position.x = Math.sin(angle) * orbitRadius + mouse.x * 6;
        camera.position.z = Math.cos(angle) * orbitRadius;
        camera.position.y = Math.sin(angle * 0.5) * 5 + mouse.y * 6;
        camera.lookAt(0, 0, 0);
      } else if (config.cameraMotion === 'interactive') {
        camera.position.x = mouse.x * 14;
        camera.position.y = mouse.y * 10;
        camera.position.z = 40;
        camera.lookAt(0, 0, 0);
      } else {
        // gentle drift
        camera.position.x = Math.sin(elapsed * 0.15) * 3 + mouse.x * 5;
        camera.position.y = Math.cos(elapsed * 0.12) * 2 + mouse.y * 5;
        camera.lookAt(0, 0, 0);
      }

      animators.forEach((fn) => fn(elapsed, delta));
      renderer.render(scene, camera);
    };

    renderLoop();

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);

      disposables.forEach((item) => {
        try {
          item.dispose();
        } catch {
          // ignore
        }
      });
      renderer.dispose();
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [config]);

  if (!config || !config.enabled || config.sceneType === 'none') {
    return null;
  }

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
    />
  );
};
