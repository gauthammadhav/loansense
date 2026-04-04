import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Activity, ArrowRight, MousePointer2, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as random from 'maath/random/dist/maath-random.esm';
import { useIsMobile } from '../../hooks/useIsMobile';

gsap.registerPlugin(ScrollTrigger);

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
        <PointMaterial transparent color="#C8F135" size={0.04} sizeAttenuation depthWrite={false} opacity={0.25} />
      </Points>
    </group>
  );
}

function MorphingBlob() {
  const meshRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(t / 2) * 0.8;
      meshRef.current.rotation.x = t * 0.15;
      meshRef.current.rotation.y = t * 0.2;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.5}>
      <mesh ref={meshRef} position={[3.5, 0, -4]} scale={1.1}>
        <icosahedronGeometry args={[2, 20]} />
        <MeshDistortMaterial color="#F5F5F7" distort={0.35} speed={2} roughness={0.1} metalness={0.05} clearcoat={1} />
      </mesh>
      <mesh position={[1.5, -2.5, -1]} scale={0.5}>
        <torusGeometry args={[1, 0.4, 16, 32]} />
        <meshStandardMaterial color="#C8F135" wireframe opacity={0.2} transparent />
      </mesh>
    </Float>
  );
}

const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const fragmentShader = `
  uniform float u_time; varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    uv.x += sin(u_time * 0.08 + uv.y * 2.0) * 0.15;
    uv.y += cos(u_time * 0.08 + uv.x * 2.0) * 0.15;
    vec3 c1 = vec3(0.98, 0.98, 0.98);
    vec3 c2 = vec3(0.955, 0.99, 0.94);
    float mix_v = (sin(uv.x * 4.0 + u_time * 0.4) + cos(uv.y * 4.0 + u_time * 0.3)) * 0.5 + 0.5;
    gl_FragColor = vec4(mix(c1, c2, mix_v), 1.0);
  }
`;

function BackgroundShader() {
  const matRef = useRef();
  useFrame((state) => { if (matRef.current) matRef.current.uniforms.u_time.value = state.clock.elapsedTime; });
  return (
    <mesh position={[0, 0, -20]} scale={[100, 100, 1]}>
      <planeGeometry />
      <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={{ u_time: { value: 0 } }} depthWrite={false} />
    </mesh>
  );
}

export default function AdvancedHero() {
  const navigate = useNavigate();
  const heroRef = useRef();
  const textRef = useRef();
  const glassRef = useRef();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 16;
    const y = (e.clientY / window.innerHeight - 0.5) * 16;
    setMousePos({ x, y });
  };

  useEffect(() => {
    const tl = gsap.timeline();
    if (textRef.current) {
      tl.fromTo(Array.from(textRef.current.children),
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: 'power4.out', delay: 0.2 }
      );
    }
    if (glassRef.current) {
      gsap.fromTo(glassRef.current,
        { y: 100, opacity: 0, scale: 0.92 },
        { y: 0, opacity: 1, scale: 1, duration: 1.4, ease: 'expo.out', delay: 0.5 }
      );
    }
  }, []);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      style={{ position: 'relative', width: '100%', height: isMobile ? 'auto' : '100vh', minHeight: isMobile ? 'auto' : 800, overflow: 'hidden', backgroundColor: 'var(--light)', paddingBottom: isMobile ? 60 : 0 }}
    >
      {/* 3D Canvas — DISABLED on mobile for performance */}
      {!isMobile && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.65 }}>
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 1.5]}>
            <color attach="background" args={['#FAFAFA']} />
            <ambientLight intensity={1.2} />
            <directionalLight position={[10, 10, 10]} intensity={0.8} color="#C8F135" />
            <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ffffff" />
            <BackgroundShader />
            <ParticleField />
            <MorphingBlob />
            <Environment preset="city" />
          </Canvas>
        </div>
      )}

      {/* Grid overlay */}
      {!isMobile && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.15,
          backgroundImage: 'linear-gradient(rgba(155,191,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(155,191,0,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      )}

      {/* Hero Content — properly padded */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', height: isMobile ? 'auto' : '100%',
        maxWidth: 1280, margin: '0 auto',
        padding: isMobile ? '100px 20px 40px' : '0 48px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: isMobile ? 'flex-start' : 'space-between',
        gap: isMobile ? 32 : 48,
        paddingTop: isMobile ? 100 : 80,
        boxSizing: 'border-box',
      }}>

        {/* Left: Text */}
        <div ref={textRef} style={{ flex: isMobile ? 'none' : '0 0 48%', maxWidth: isMobile ? '100%' : 560, width: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? 18 : 24, textAlign: isMobile ? 'center' : 'left', alignItems: isMobile ? 'center' : 'flex-start' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            backgroundColor: 'rgba(250,250,250,0.9)', backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)', borderRadius: 999,
            padding: '6px 16px 6px 6px', alignSelf: 'flex-start',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span style={{
              backgroundColor: 'var(--lime)', color: 'var(--text)',
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              padding: '4px 10px', borderRadius: 999,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Activity size={11} style={{ animation: 'pulse 2s infinite' }} />
              ML-Powered API
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>Decisions under 2 seconds</span>
          </div>

          {/* Headline */}
          <div style={{ margin: 0 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: isMobile ? 'clamp(32px, 8vw, 48px)' : 'clamp(52px, 5vw, 80px)',
              lineHeight: 1.05,
              color: 'var(--text)',
              margin: 0,
            }}>
              Loans decided.
            </h1>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontStyle: 'italic',
              fontSize: isMobile ? 'clamp(32px, 8vw, 48px)' : 'clamp(52px, 5vw, 80px)',
              lineHeight: 1.05,
              color: 'var(--text-muted)',
              margin: '4px 0 0 0',
            }}>
              Reasons included.
            </h1>
          </div>

          {/* Subtitle */}
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.75, margin: 0, maxWidth: 460 }}>
            LoanSense predicts application outcomes instantly via SHAP-enabled XGBoost pipelines. Radically transparent lending architecture for the modern financial web.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 12 : 16, marginTop: 8, width: isMobile ? '100%' : 'auto' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                height: 52, padding: '0 32px', borderRadius: 12, width: isMobile ? '100%' : 'auto',
                backgroundColor: 'var(--lime)', color: 'var(--text)',
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                border: 'none', boxShadow: 'var(--shadow-md)',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            >
              Check eligibility <ArrowRight size={17} />
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                height: 52, padding: '0 28px', borderRadius: 12, width: isMobile ? '100%' : 'auto',
                backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                color: 'var(--text)', fontWeight: 600, fontSize: 15, cursor: 'pointer',
                border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--light3)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.85)'}
            >
              For Officers
            </button>
          </div>
        </div>

        {/* Right: Glass Card */}
        {!isMobile && <div style={{ flex: '0 0 44%', maxWidth: 480, position: 'relative' }}>
          <motion.div
            ref={glassRef}
            animate={{ x: mousePos.x * -0.6, y: mousePos.y * -0.6 }}
            transition={{ type: 'spring', stiffness: 60, damping: 22 }}
            style={{ position: 'relative' }}
          >
            {/* Glow backdrop */}
            <div style={{
              position: 'absolute', inset: -8,
              background: 'linear-gradient(135deg, rgba(200,241,53,0.25), rgba(129,140,248,0.15))',
              borderRadius: 36, filter: 'blur(30px)', opacity: 0.7,
              transform: 'translate(8px, 8px)',
            }} />

            {/* Main card */}
            <div style={{
              position: 'relative',
              backgroundColor: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(40px)',
              border: '1px solid var(--glass-border)',
              borderRadius: 28,
              padding: 32,
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
            }}>
              {/* Scanning line animation */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: 2, background: 'linear-gradient(90deg, transparent, var(--lime-dark), transparent)' }}
              />

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16, color: 'var(--text)', margin: 0 }}>
                  <Database size={15} style={{ color: 'var(--lime-dark)', flexShrink: 0 }} />
                  Live SHAP Analysis
                </h3>
                <span style={{
                  backgroundColor: 'rgba(200,241,53,0.15)', color: 'var(--lime-dark)',
                  border: '1px solid var(--lime)', borderRadius: 5,
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', letterSpacing: '0.05em',
                  animation: 'pulse 2s infinite',
                }}>PROCESSING</span>
              </div>

              {/* Confidence row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
                backgroundColor: 'white', padding: '14px 16px', borderRadius: 14,
                border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: 'rgba(200,241,53,0.12)', border: '1px solid var(--lime-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={18} style={{ color: 'var(--lime-dark)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--text)', lineHeight: 1.2 }}>91.4% Confidence</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>XGBoost DMatrix Inference</div>
                </div>
              </div>

              {/* SHAP bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  { label: 'Credit Depth (780)', val: 85, pos: true },
                  { label: 'DTI Ratio (42%)', val: 55, pos: false },
                  { label: 'Verified Income', val: 70, pos: true },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ fontWeight: 700, color: item.pos ? 'var(--success-dark)' : 'var(--danger-dark)' }}>{item.pos ? '+' : '-'} {item.val}</span>
                    </div>
                    <div style={{ width: '100%', height: 6, backgroundColor: 'var(--light3)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.val}%` }}
                        transition={{ duration: 1.5, delay: 1 + i * 0.2, type: 'spring', damping: 15 }}
                        style={{ height: '100%', borderRadius: 99, backgroundColor: item.pos ? 'var(--success)' : 'var(--danger)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--glass-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.06em', color: 'var(--text-muted)',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MousePointer2 size={10} /> INTERACTIVE VERIFIED
                </span>
                <span style={{ backgroundColor: 'var(--light3)', padding: '3px 8px', borderRadius: 5 }}>ID: LNS-998A-0X</span>
              </div>
            </div>

            {/* What-if Simulator chip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, duration: 0.5, type: 'spring' }}
              onClick={() => navigate('/register')}
              style={{
                position: 'absolute', bottom: -20, right: -20,
                backgroundColor: 'white', border: '1px solid var(--glass-border)',
                borderRadius: 18, padding: '14px 48px 14px 16px',
                boxShadow: 'var(--shadow-xl)', cursor: 'pointer',
                zIndex: 20, overflow: 'hidden',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>What-if Simulator</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Adjust risk parameters live</div>
              <div style={{
                position: 'absolute', top: 0, right: 0, width: 38, height: 38,
                backgroundColor: 'var(--lime)', borderRadius: '0 18px 0 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ArrowRight size={15} style={{ transform: 'rotate(-45deg)' }} />
              </div>
            </motion.div>
          </motion.div>
        </div>}
      </div>

      {/* Scroll indicator — hide on mobile */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          style={{
            position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 10,
          }}
        >
          <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700 }}>Scroll to explore</span>
          <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, var(--glass-border), transparent)', position: 'relative' }}>
            <motion.div
              animate={{ y: [0, 32, 48], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              style={{ width: 1, height: 14, backgroundColor: 'var(--lime-dark)' }}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}
