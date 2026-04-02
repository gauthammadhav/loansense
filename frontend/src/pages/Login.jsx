import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, Stars, Trail } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

function OrbitingParticles() {
  const ref = React.useRef();
  const [sphere] = useState(() => random.inSphere(new Float32Array(500), { radius: 10 }));
  
  useFrame((state, delta) => {
    if(ref.current) {
      ref.current.rotation.y += delta * 0.2;
      ref.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <group ref={ref}>
      {Array.from({ length: 50 }).map((_, i) => (
        <Trail key={i} target={null} width={0.5} length={10} color={'#C8F135'} attenuation={(t) => t * t}>
          <mesh position={[
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15
          ]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#C8F135" />
          </mesh>
        </Trail>
      ))}
    </group>
  );
}

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
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Login failed');
      
      const meResponse = await fetch('http://localhost:8000/auth/me', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });
      if (!meResponse.ok) throw new Error('Failed to retrieve user profile');
      const userData = await meResponse.json();
      
      setAuth(userData, data.access_token, userData.role);
      navigate(`/${userData.role}/dashboard`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen w-full flex bg-dark relative overflow-hidden">
      {/* Animated Setup Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark2 to-[#1a220a] z-0" />
      <div className="page-grid z-0" />

      {/* Left Form Panel */}
      <motion.div 
        className="w-full lg:w-[45%] h-full min-h-screen flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative z-10"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 mb-16 cursor-pointer" 
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center text-dark font-bold">+</div>
            <span className="font-heading font-bold text-2xl tracking-tight text-white">LoanSense</span>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate="show">
            <motion.h1 variants={fadeUp} className="text-4xl font-heading font-bold text-white mb-2">Welcome back</motion.h1>
            <motion.p variants={fadeUp} className="text-text-muted mb-10 text-sm">Sign in to access your predictions and workspace.</motion.p>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                   initial={{ opacity: 0, y: -10, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: -10, scale: 0.95 }}
                   className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium flex items-center gap-2"
                >
                  <ShieldCheck size={18} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form variants={staggerContainer} onSubmit={handleLogin} className="space-y-5">
              <motion.div variants={fadeUp}>
                <Input 
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                  required
                />
              </motion.div>
              
              <motion.div variants={fadeUp}>
                <Input 
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  required
                />
              </motion.div>

              <motion.div variants={fadeUp} className="pt-4">
                <Button type="submit" loading={isLoading} className="w-full" icon={<ArrowRight size={18} />}>
                  Sign in securely
                </Button>
              </motion.div>
            </motion.form>

            <motion.div variants={fadeUp} className="mt-8 text-center sm:text-left">
               <span className="text-text-muted text-sm">Don't have an account? </span>
               <Link to="/register" className="text-lime hover:text-white transition-colors text-sm font-medium inline-block ml-1">
                 Create account
               </Link>
            </motion.div>

          </motion.div>
        </div>
      </motion.div>

      {/* Right Canvas Visualization */}
      <div className="hidden lg:block lg:w-[55%] relative z-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-dark pointer-events-none z-10 opacity-20" />
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} color="#C8F135" intensity={1} />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
            <mesh position={[0, 0, 0]} scale={2.5}>
              <icosahedronGeometry args={[2, 24]} />
              <MeshDistortMaterial color="#0A0A0F" distort={0.4} speed={2} roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh scale={2.6}>
              <icosahedronGeometry args={[2, 4]} />
              <meshStandardMaterial color="#C8F135" wireframe transparent opacity={0.15} />
            </mesh>
          </Float>
          <OrbitingParticles />
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="city" />
        </Canvas>
        
        {/* Value Prop Overlay */}
        <motion.div 
          className="absolute bottom-12 left-12 right-12 glass-strong p-8 z-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={24} className="text-lime" />
            <span className="text-lime font-bold text-sm tracking-widest uppercase">Enterprise Grade ML</span>
          </div>
          <h2 className="text-3xl font-heading text-white font-bold mb-3">Instant logic. No black boxes.</h2>
          <p className="text-text-muted text-lg max-w-lg">LoanSense utilizes heavily constrained XGBoost gradients to evaluate risk without bias.</p>
        </motion.div>
      </div>
    </div>
  );
}
