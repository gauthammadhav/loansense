import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { Input, PasswordInput } from '../components/ui/Input';
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
      {Array.from({ length: 40 }).map((_, i) => (
        <Trail key={i} target={null} width={0.5} length={15} color={'#C8F135'} attenuation={(t) => t * t}>
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
      
      // Auto-redirect to login
      navigate('/login');
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
        className="w-full lg:w-[45%] h-full min-h-screen flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative z-10 py-12"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 mb-12 cursor-pointer inline-flex" 
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center text-dark font-bold">+</div>
            <span className="font-heading font-bold text-2xl tracking-tight text-white">LoanSense</span>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate="show">
            <motion.h1 variants={fadeUp} className="text-4xl font-heading font-bold text-white mb-2">Create Account</motion.h1>
            <motion.p variants={fadeUp} className="text-text-muted mb-8 text-sm">Join the next generation of transparent lending.</motion.p>
            
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

            <motion.form variants={staggerContainer} onSubmit={handleRegister} className="space-y-4">
              <motion.div variants={fadeUp}>
                <Input 
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={<User size={18} />}
                  required
                />
              </motion.div>

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
                <PasswordInput 
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  showStrength={true}
                  required
                />
              </motion.div>

              <motion.div variants={fadeUp} className="pt-4">
                <Button type="submit" loading={isLoading} className="w-full" icon={<ArrowRight size={18} />}>
                  Initialize workspace
                </Button>
              </motion.div>
            </motion.form>

            <motion.div variants={fadeUp} className="mt-8 text-center sm:text-left">
               <span className="text-text-muted text-sm">Already have an account? </span>
               <Link to="/login" className="text-lime hover:text-white transition-colors text-sm font-medium inline-block ml-1">
                 Sign in instead
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
          <directionalLight position={[-10, -10, -10]} color="#818CF8" intensity={1} />
          <directionalLight position={[10, 10, 10]} color="#C8F135" intensity={1} />
          <Float speed={2} rotationIntensity={0.8} floatIntensity={1.5}>
            <mesh position={[0, 0, 0]} scale={2.8}>
              <octahedronGeometry args={[2, 0]} />
              <MeshDistortMaterial color="#0A0A0F" distort={0.2} speed={1} roughness={0.1} metalness={0.9} wireframe />
            </mesh>
            <mesh scale={2.5}>
              <octahedronGeometry args={[2, 0]} />
              <meshStandardMaterial color="#111118" transparent opacity={0.9} />
            </mesh>
          </Float>
          <OrbitingParticles />
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="city" />
        </Canvas>
        
        {/* Value Prop Overlay */}
        <motion.div 
          className="absolute bottom-12 right-12 left-12 glass-strong p-8 z-20 overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
        >
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(200,241,53,0.1),transparent)] animate-[spin_4s_linear_infinite] opacity-50" />
          <div className="relative z-10">
             <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                <span className="text-lime font-bold text-xs tracking-widest uppercase">Live Network</span>
             </div>
             <h2 className="text-3xl font-heading text-white font-bold mb-3">Join 10,000+ applicants.</h2>
             <p className="text-text-muted text-lg max-w-md">Get instant pre-approvals backed by automated SHAP reasoning and algorithmic fairness validation.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
