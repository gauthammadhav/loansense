import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import apiClient from '../api/client';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, Stars } from '@react-three/drei';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      
      const meResponse = await apiClient.get('/auth/me', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });
      const userData = meResponse.data;

      setAuth(userData, data.access_token, userData.role);
      navigate(`/${userData.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', backgroundColor: 'var(--light)', position: 'relative', overflow: 'hidden' }}>
      {/* Background gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--light) 0%, var(--light2) 60%, rgba(200,241,53,0.08) 100%)', zIndex: 0 }} />

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
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 56 }}
        >
          <div style={{ width: 34, height: 34, backgroundColor: 'var(--lime)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18 }}>+</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--text)' }}>LoanSense</span>
        </motion.div>

        {/* Heading */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 38, color: 'var(--text)', margin: '0 0 8px 0' }}>
          Welcome back
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 36px 0' }}>
          Sign in to access your predictions and workspace.
        </motion.p>

        {/* Error */}
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

        {/* Form */}
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={18} />} required />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} icon={<Lock size={18} />} required />
          <div style={{ paddingTop: 8 }}>
            <Button type="submit" loading={isLoading} className="w-full" icon={<ArrowRight size={18} />}>Sign in securely</Button>
          </div>
        </motion.form>

        {/* Link */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ marginTop: 28, fontSize: 13, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--lime-dark)', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--lime-dark)'}>
            Create account
          </Link>
        </motion.p>
      </motion.div>

      {/* Right 3D Panel */}
      <div style={{ flex: 1, position: 'relative', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--light)', opacity: 0.15, zIndex: 10, pointerEvents: 'none' }} />
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }} style={{ width: '100%', height: '100%' }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 10]} color="#C8F135" intensity={1} />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
            {/* Blob — scaled down so it stays inside the cage */}
            <mesh position={[0, 0, 0]} scale={2.55}>
              <icosahedronGeometry args={[2, 24]} />
              <MeshDistortMaterial color="#FAFAFA" distort={0.35} speed={2} roughness={0.2} metalness={0.1} />
            </mesh>
            {/* Wireframe cage — larger than blob, more visible */}
            <mesh scale={2.8}>
              <icosahedronGeometry args={[2, 4]} />
              <meshStandardMaterial color="#C8F135" wireframe transparent opacity={0.55} />
            </mesh>
          </Float>
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} color="#C8F135" />
          <Environment preset="city" />
        </Canvas>

        {/* Value prop overlay */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
          style={{
            position: 'absolute', bottom: 40, left: 40, right: 40,
            backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)',
            border: '1px solid var(--glass-border)', borderRadius: 28,
            padding: '28px 32px', zIndex: 20, boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <ShieldCheck size={22} style={{ color: 'var(--lime-dark)' }} />
            <span style={{ color: 'var(--lime-dark)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Enterprise Grade ML</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px 0' }}>Instant logic. No black boxes.</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>LoanSense utilizes heavily constrained XGBoost gradients to evaluate risk without bias.</p>
        </motion.div>
      </div>
    </div>
  );
}
