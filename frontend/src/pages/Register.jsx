import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { Input, PasswordInput } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, Stars } from '@react-three/drei';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Registration failed');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', backgroundColor: 'var(--light)', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--light) 0%, var(--light2) 50%, rgba(129,140,248,0.06) 100%)', zIndex: 0 }} />

      {/* Left Form Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
        style={{
          width: '45%', minWidth: 420, maxWidth: 560,
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '48px 64px',
          position: 'relative', zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        {/* Logo */}
        <motion.div
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.04 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 48 }}
        >
          <div style={{ width: 34, height: 34, backgroundColor: 'var(--lime)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18 }}>+</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--text)' }}>LoanSense</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 38, color: 'var(--text)', margin: '0 0 8px 0' }}>
          Create Account
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 32px 0' }}>
          Join the next generation of transparent lending.
        </motion.p>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{
                marginBottom: 20, padding: '12px 16px', borderRadius: 12,
                backgroundColor: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                color: 'var(--danger-dark)', fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
              <ShieldCheck size={16} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Full Name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} icon={<User size={18} />} required />
          <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={18} />} required />
          <PasswordInput label="Password" value={password} onChange={e => setPassword(e.target.value)} icon={<Lock size={18} />} showStrength={true} required />
          <div style={{ paddingTop: 8 }}>
            <Button type="submit" loading={isLoading} className="w-full" icon={<ArrowRight size={18} />}>Initialize workspace</Button>
          </div>
        </motion.form>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ marginTop: 28, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--lime-dark)', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--lime-dark)'}>
            Sign in instead
          </Link>
        </motion.p>
      </motion.div>

      {/* Right 3D Panel */}
      <div style={{ flex: 1, position: 'relative', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--light)', opacity: 0.15, zIndex: 10, pointerEvents: 'none' }} />
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }} style={{ width: '100%', height: '100%' }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[-10, -10, -10]} color="#818CF8" intensity={1} />
          <directionalLight position={[10, 10, 10]} color="#C8F135" intensity={1} />
          <Float speed={2} rotationIntensity={0.8} floatIntensity={1.5}>
            <mesh position={[0, 0, 0]} scale={2.8}>
              <octahedronGeometry args={[2, 0]} />
              <MeshDistortMaterial color="#C8F135" distort={0.2} speed={1} roughness={0.1} metalness={0.1} wireframe transparent opacity={1} />
            </mesh>
            <mesh scale={2.5}>
              <octahedronGeometry args={[2, 0]} />
              <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} />
            </mesh>
          </Float>
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} color="#C8F135" />
          <Environment preset="city" />
        </Canvas>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
          style={{
            position: 'absolute', bottom: 40, left: 40, right: 40,
            backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)',
            border: '1px solid var(--glass-border)', borderRadius: 28,
            padding: '28px 32px', zIndex: 20, boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--lime-dark)', animation: 'pulse 2s infinite' }} />
            <span style={{ color: 'var(--lime-dark)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Live Network</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px 0' }}>Join 10,000+ applicants.</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0, maxWidth: 420 }}>Get instant pre-approvals backed by automated SHAP reasoning and algorithmic fairness validation.</p>
        </motion.div>
      </div>
    </div>
  );
}
