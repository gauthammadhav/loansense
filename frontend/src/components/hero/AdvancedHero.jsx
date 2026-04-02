import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Activity, ArrowRight, MousePointer2, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as random from 'maath/random/dist/maath-random.esm';

gsap.registerPlugin(ScrollTrigger);

// Particle System
function ParticleField() {
  const ref = useRef();
  const [sphere] = useState(() => random.inSphere(new Float32Array(3000), { radius: 15 }));
  
  useFrame((state, delta) => {
    if (ref.current) {
        ref.current.rotation.x -= delta / 10;
        ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#C8F135" size={0.05} sizeAttenuation={true} depthWrite={false} opacity={0.4} />
      </Points>
    </group>
  );
}

// Organic Morphing Sphere (ML Brain / Blob)
function MorphingBlob() {
  const meshRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if(meshRef.current) {
        meshRef.current.position.y = Math.sin(t / 2) * 1;
        meshRef.current.rotation.x = t * 0.2;
        meshRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={[3, 1, -5]} scale={1.5}>
        <icosahedronGeometry args={[2, 20]} />
        <MeshDistortMaterial 
          color="#151515" 
          distort={0.4} 
          speed={2} 
          roughness={0.1} 
          metalness={0.8}
          clearcoat={1}
        />
      </mesh>
      
      {/* Floating mini geometry */}
      <mesh position={[-4, 2, -2]} scale={0.5}>
         <octahedronGeometry args={[1, 0]} />
         <meshStandardMaterial color="#C8F135" wireframe opacity={0.3} transparent />
      </mesh>
      <mesh position={[2, -3, -1]} scale={0.7}>
         <torusGeometry args={[1, 0.4, 16, 32]} />
         <meshStandardMaterial color="#C8F135" wireframe opacity={0.3} transparent />
      </mesh>
    </Float>
  );
}

// Background Shader (GLSL)
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    uv.x += sin(u_time * 0.1 + uv.y * 2.0) * 0.2;
    uv.y += cos(u_time * 0.1 + uv.x * 2.0) * 0.2;
    
    vec3 color1 = vec3(0.02, 0.02, 0.02); // Deep Space Black
    vec3 color2 = vec3(0.08, 0.12, 0.02); // Deep Lime / Bio-green
    
    float mixValue = (sin(uv.x * 5.0 + u_time * 0.5) + cos(uv.y * 5.0 + u_time * 0.4)) * 0.5 + 0.5;
    vec3 finalColor = mix(color1, color2, mixValue);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function BackgroundShader() {
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={[0, 0, -20]} scale={[100, 100, 1]}>
      <planeGeometry />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ u_time: { value: 0 } }}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function AdvancedHero() {
  const navigate = useNavigate();
  const heroRef = useRef();
  const textRef = useRef();
  const glassRef = useRef();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 20;
    const y = (clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  useEffect(() => {
    const tl = gsap.timeline();
    
    // Animate text children
    if(textRef.current) {
      const children = Array.from(textRef.current.children);
      tl.fromTo(children, 
        { y: 100, opacity: 0, rotationX: -10 },
        { y: 0, opacity: 1, rotationX: 0, duration: 1.2, stagger: 0.1, ease: 'power4.out', delay: 0.2 }
      );
    }
    
    if(glassRef.current) {
      gsap.fromTo(glassRef.current,
        { y: 150, opacity: 0, scale: 0.9, rotateY: 15 },
        { y: 0, opacity: 1, scale: 1, rotateY: 0, duration: 1.5, ease: 'expo.out', delay: 0.6 }
      );
    }
    
    if(textRef.current && heroRef.current) {
      gsap.to(textRef.current, {
        y: -150,
        opacity: 0,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });
    }
  }, []);

  return (
    <section 
      ref={heroRef} 
      className="relative w-full h-[100vh] min-h-[850px] overflow-hidden bg-[#050505]"
      onMouseMove={handleMouseMove}
    >
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 2]}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} color="#C8F135" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
          
          <BackgroundShader />
          <ParticleField />
          <MorphingBlob />
          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Grid overlay for math/ML aesthetic */}
      <div 
        className="absolute inset-0 z-1 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(#C8F135 1px, transparent 1px), linear-gradient(90deg, #C8F135 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-b from-transparent to-white translate-y-full" />

      {/* Hero Content */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-12 flex flex-col lg:flex-row items-center justify-between pt-16">
        
        {/* Left Column: Text Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start text-white space-y-8" ref={textRef} style={{ perspective: '1000px' }}>
          
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-1.5 pr-4 rounded-full overflow-hidden relative group cursor-default">
            <div className="absolute inset-0 bg-lime/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
            <span className="relative z-10 bg-lime text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(200,241,53,0.5)]">
               <Activity size={12} className="animate-pulse" />
               ML-Powered API
            </span>
            <span className="relative z-10 text-white/80 text-xs font-medium tracking-wide">Decisions under 2 seconds</span>
          </div>
          
          <h1 className="text-[72px] lg:text-[84px] leading-[0.9] font-extrabold tracking-[-0.03em] relative w-full">
            <span className="block text-white w-full">Loans decided.</span>
            <span className="block italic font-bold w-full" style={{ 
               WebkitTextStroke: '2px #C8F135', 
               color: 'transparent',
               textShadow: '0 0 40px rgba(200, 241, 53, 0.2)'
            }}>Reasons included.</span>
          </h1>
          
          <p className="text-lg text-white/50 max-w-lg leading-relaxed font-light mt-4">
            LoanSense predicts application outcomes instantly via SHAP-enabled XGBoost pipelines. Radically transparent lending architecture for the modern financial web.
          </p>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-4 w-full max-w-md">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              className="group relative h-14 w-full flex-1 bg-lime text-black font-bold flex items-center justify-center gap-2 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(200,241,53,0.3)] transition-all hover:shadow-[0_0_30px_rgba(200,241,53,0.5)] border-0 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2 text-[15px]">Check eligibility <ArrowRight size={18} /></span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="h-14 px-8 w-full sm:w-auto rounded-xl border border-white/20 text-white font-medium backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer text-[15px]"
            >
              For Officers
            </motion.button>
          </div>
        </div>

        {/* Right Column: Glassmorphism 2.0 ML Visualization */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-16 lg:mt-0 relative" style={{ perspective: '1200px' }}>
          
          <motion.div 
            ref={glassRef}
            animate={{ x: mousePos.x * -1, y: mousePos.y * -1 }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            className="w-full max-w-md relative z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-lime/30 via-transparent to-lime/10 rounded-[30px] blur-3xl opacity-50 translate-x-4 translate-y-4" />
            
            <div 
              className="relative rounded-[28px] overflow-hidden p-8 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl bg-black/40"
              style={{
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)'
              }}
            >
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-lime to-transparent"
              />

              <div className="mb-8 relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white/90 font-bold text-lg tracking-wide flex items-center gap-2">
                    <Database size={16} className="text-lime" /> Live SHAP Analysis
                  </h3>
                  <div className="animate-pulse bg-lime/20 text-lime px-2 py-0.5 rounded text-[10px] font-bold border border-lime/30">
                     PROCESSING
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                  <div className="w-12 h-12 rounded-full border border-lime/50 flex items-center justify-center bg-lime/10 shadow-[0_0_15px_rgba(200,241,53,0.3)] shrink-0">
                    <Check size={20} className="text-lime" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-[22px] leading-tight mb-0.5">91.4% Confidence</div>
                    <div className="text-white/40 text-[11px] font-mono tracking-wide uppercase">XGBoost DMatrix Inference</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { label: "Credit Depth (780)", val: 85, pos: true },
                    { label: "DTI Ratio (42%)", val: 55, pos: false },
                    { label: "Verified Income", val: 70, pos: true },
                  ].map((item, i) => (
                    <div key={i} className="relative">
                      <div className="flex justify-between text-[11px] text-white/50 mb-2 font-mono uppercase">
                        <span>{item.label}</span>
                        <span className={item.pos ? 'text-lime font-bold' : 'text-rose-400 font-bold'}>
                          {item.pos ? '+' : '-'} {item.val}
                        </span>
                      </div>
                      <div className="w-full bg-black/50 h-[6px] rounded-full overflow-hidden flex inset-shadow-sm">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.val}%` }}
                          transition={{ duration: 1.5, delay: 1 + i * 0.2, type: 'spring', damping: 15 }}
                          className={`h-full ${item.pos ? 'bg-gradient-to-r from-lime/50 to-lime' : 'bg-gradient-to-r from-rose-500/50 to-rose-400'} shadow-[0_0_10px_currentColor]`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-white/40 text-[10px] font-mono tracking-wider">
                <span className="flex items-center gap-1.5"><MousePointer2 size={10} /> INTERACTIVE VERIFIED</span>
                <span className="bg-white/10 px-2 py-0.5 rounded">ID: LNS-998A-0X</span>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, duration: 0.5, type: 'spring' }}
              className="absolute -bottom-6 -right-6 lg:-right-12 bg-white text-black p-4 pr-12 rounded-[20px] shadow-2xl z-20 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/register')}
            >
              <div className="text-sm font-bold tracking-tight mb-1 text-black">What-if Simulator</div>
              <div className="text-[11px] text-black/50 font-medium">Adjust risk parameters live</div>
              <div className="absolute top-0 right-0 w-10 h-10 bg-lime rounded-tr-[20px] rounded-bl-[20px] flex items-center justify-center">
                <ArrowRight size={16} className="-rotate-45" />
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Scroll to explore</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent">
           <motion.div 
              animate={{ y: [0, 24, 48], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="w-px h-4 bg-lime"
           />
        </div>
      </motion.div>
    </section>
  );
}
