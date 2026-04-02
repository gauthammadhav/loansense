import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Check, ArrowRight, Activity, Code, FileText, Database, Shield, Zap, Sparkles, Binary, MoveRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import AdvancedHero from '../components/hero/AdvancedHero';

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

export default function Landing() {
  const { isAuthenticated, role } = useAuthStore();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  
  // Parallax effects
  const yParallax1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yParallax2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    // Lenis smooth scroll configuration
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      smoothWheel: true,
      wheelMultiplier: 1.2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/${role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <div className="bg-dark min-h-screen font-body scroll-smooth text-white overflow-hidden selection:bg-lime selection:text-dark">
      
      {/* 1. NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-dark/50 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(200,241,53,0.3)]">
            <span className="text-dark text-xl font-bold leading-none">+</span>
          </div>
          <span className="font-heading font-black text-white text-2xl tracking-tight hidden sm:block">LoanSense</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-text-faint">
          {['Features', 'Intelligence', 'Architecture'].map((item) => (
             <a key={item} href={`#${item.toLowerCase()}`} className="relative group hover:text-white transition-colors duration-300">
               {item}
               <span className="absolute -bottom-2 left-1/2 w-0 h-0.5 bg-lime group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full" />
             </a>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/login')} className="h-10 px-5 text-sm font-bold text-white hover:bg-white/10">
            Sign in
          </Button>
          <Button variant="primary" onClick={() => navigate('/register')} className="h-10 px-6 text-sm font-bold shadow-[0_0_20px_rgba(200,241,53,0.2)]">
            Get early access
          </Button>
        </div>
      </nav>

      {/* 2. ADVANCED HERO */}
      <AdvancedHero />

      {/* 3. BENTO GRID FEATURES SECTION */}
      <section id="features" className="py-32 px-6 md:px-12 relative z-10 border-t border-white/5 bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
               <Badge variant="outline" className="mb-6 opacity-80" icon={<Sparkles size={14} />}>Next Gen Toolkit</Badge>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading font-black text-5xl md:text-6xl text-white leading-tight">
               Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime to-success">algorithmic fairness</span> & transparency.
            </motion.h2>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Bento Box 1 - Span 2 */}
            <motion.div variants={scaleIn} className="md:col-span-2 glass rounded-[32px] p-10 border border-white/10 hover:border-lime/30 transition-all group overflow-hidden relative">
               <div className="absolute right-0 top-0 w-64 h-64 bg-lime/10 blur-[80px] rounded-full group-hover:bg-lime/20 transition-all pointer-events-none" />
               <div className="w-14 h-14 bg-dark2 border border-white/10 rounded-2xl flex items-center justify-center text-lime mb-8 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(200,241,53,0.1)]">
                 <Code size={24} />
               </div>
               <h3 className="font-bold text-3xl text-white mb-4 font-heading tracking-tight">SHAP Explainability Maps</h3>
               <p className="text-lg text-text-muted leading-relaxed mb-6 max-w-md">Eliminate black-box lending. Our infrastructure automatically generates feature-level waterfalls indicating exact approval weights.</p>
               <Button variant="ghost" className="px-0 hover:bg-transparent hover:text-lime text-white">Explore the tech <MoveRight size={16} className="ml-2" /></Button>
            </motion.div>

            {/* Bento Box 2 */}
            <motion.div variants={scaleIn} className="glass rounded-[32px] p-10 border border-white/10 hover:border-warning/30 transition-all group overflow-hidden relative">
               <div className="absolute right-0 bottom-0 w-32 h-32 bg-warning/10 blur-[50px] rounded-full group-hover:bg-warning/20 transition-all pointer-events-none" />
               <div className="w-14 h-14 bg-dark2 border border-white/10 rounded-2xl flex items-center justify-center text-warning mb-8 group-hover:scale-110 transition-transform">
                 <Activity size={24} />
               </div>
               <h3 className="font-bold text-2xl text-white mb-4 font-heading tracking-tight">Live Parameter Sweeps</h3>
               <p className="text-md text-text-muted leading-relaxed">Applicants can drag sliders to understand what financial targets yield favorable outcomes instantly.</p>
            </motion.div>

            {/* Bento Box 3 */}
            <motion.div variants={scaleIn} className="glass rounded-[32px] p-10 border border-white/10 hover:border-info/30 transition-all group overflow-hidden relative">
               <div className="absolute left-0 top-0 w-48 h-48 bg-info/10 blur-[60px] rounded-full group-hover:bg-info/20 transition-all pointer-events-none" />
               <div className="w-14 h-14 bg-dark2 border border-white/10 rounded-2xl flex items-center justify-center text-info mb-8 group-hover:scale-110 transition-transform">
                 <Database size={24} />
               </div>
               <h3 className="font-bold text-2xl text-white mb-4 font-heading tracking-tight">XGBoost Retraining</h3>
               <p className="text-md text-text-muted leading-relaxed">System automatically forks new model iterations against incoming distribution drifts.</p>
            </motion.div>

             {/* Bento Box 4 - Span 2 */}
             <motion.div variants={scaleIn} className="md:col-span-2 glass rounded-[32px] p-10 border border-white/10 hover:border-danger/30 transition-all group overflow-hidden relative">
               <div className="absolute right-0 top-0 w-64 h-64 bg-danger/10 blur-[80px] rounded-full group-hover:bg-danger/20 transition-all pointer-events-none" />
               <div className="w-14 h-14 bg-dark2 border border-white/10 rounded-2xl flex items-center justify-center text-danger mb-8 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(248,113,113,0.1)]">
                 <Shield size={24} />
               </div>
               <h3 className="font-bold text-3xl text-white mb-4 font-heading tracking-tight">Hardened Audit Enforcement</h3>
               <p className="text-lg text-text-muted leading-relaxed mb-6 max-w-md">Every manual override requires certified justifications linked securely directly to the ML baseline snapshot.</p>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* 4. HORIZONTAL SCROLL / TIMELINE (Simulated with staggered vertical for now) */}
      <section id="intelligence" className="py-32 px-6 md:px-12 bg-dark2 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
           <motion.div 
             className="lg:w-1/2"
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true, margin: "-100px" }}
           >
             <Badge className="mb-6 opacity-80" icon={<Binary size={14} />}>Inference Architecture</Badge>
             <h2 className="font-heading font-black text-5xl text-white leading-tight mb-6">Frictionless data, <br/>instant routing.</h2>
             <p className="text-xl text-text-muted leading-relaxed mb-10 max-w-lg">From applicant entry to final disbursement, the pipeline never bottlenecks. Random Forests parse 22 dimensions of credit history in 60 milliseconds.</p>
             
             <div className="space-y-8">
               {[
                 { num: '01', title: 'Feature Extraction', desc: 'Raw financial inputs are scaled & normalized via ScikitLearn transformers.' },
                 { num: '02', title: 'Inference Graph', desc: 'Live prediction against memory-resident optimized ONNX/Pickle models.' },
                 { num: '03', title: 'Officer Queue', desc: 'Flags risky anomalies for human intervention while auto-clearing prime applicants.' }
               ].map((step, i) => (
                 <motion.div key={i} className="flex gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-heading font-black text-lime group-hover:scale-110 transition-transform shrink-0">
                       {step.num}
                    </div>
                    <div>
                       <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                       <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
                    </div>
                 </motion.div>
               ))}
             </div>
           </motion.div>
           
           <motion.div 
             style={{ y: yParallax1 }}
             className="lg:w-1/2 relative bg-dark border border-white/10 rounded-[32px] p-8 shadow-2xl h-[600px] w-full hidden md:block"
           >
             {/* Decorative UI elements mimicking the dashboard */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,241,53,0.1),transparent_50%)]" />
             <div className="w-full h-8 flex items-center gap-2 mb-8 border-b border-white/10 pb-4">
                <div className="w-3 h-3 rounded-full bg-danger" />
                <div className="w-3 h-3 rounded-full bg-warning" />
                <div className="w-3 h-3 rounded-full bg-success" />
             </div>

             <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, x: 20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="w-full h-16 bg-white/5 rounded-xl border border-white/10 flex items-center px-4 gap-4"
                  >
                     <div className="w-10 h-10 rounded-lg bg-lime/10" />
                     <div className="flex-1 space-y-2">
                        <div className="w-1/3 h-2 bg-white/20 rounded-full" />
                        <div className="w-1/4 h-2 bg-white/10 rounded-full" />
                     </div>
                     <div className={`w-16 h-6 rounded-full ${i % 2 === 0 ? 'bg-success/20' : 'bg-danger/20'}`} />
                  </motion.div>
                ))}
             </div>
             
             {/* Floating overlay card */}
             <motion.div 
               animate={{ y: [0, -10, 0] }} 
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="absolute -left-12 bottom-20 bg-dark2/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
             >
                <div className="text-[10px] text-lime font-bold uppercase tracking-widest mb-2">Automated Alert</div>
                <div className="text-white font-bold text-lg mb-1">DTI Threshold Crossed</div>
                <div className="text-text-muted text-sm">Routed to strict manual review.</div>
             </motion.div>
           </motion.div>
        </div>
      </section>

      {/* 5. ARCHITECTURE SECTION */}
      <section id="architecture" className="py-32 px-6 md:px-12 border-y border-white/5 relative overflow-hidden bg-dark">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-lime/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 opacity-80" icon={<Check size={14} />}>Dual Interface</Badge>
            <h2 className="font-heading font-black text-5xl text-white leading-tight">One platform.<br/>Two perspectives.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-strong p-12 rounded-[32px] border border-white/10 hover:border-lime/20 transition-all">
              <h3 className="font-heading font-black text-3xl mb-8 text-white">The Applicant</h3>
              <ul className="space-y-6">
                {["Guided 5-step semantic form", "Instant machine inference execution", "SHAP interpretability graphs", "Interactive financial sliders"].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-white/80 font-bold text-md">
                    <div className="w-8 h-8 rounded-full bg-lime/10 flex items-center justify-center text-lime shrink-0 shadow-[0_0_10px_rgba(200,241,53,0.1)]">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="bg-dark2 p-12 rounded-[32px] border border-white/5 hover:border-white/20 transition-all">
              <h3 className="font-heading font-black text-3xl mb-8 text-white">The Officer</h3>
              <ul className="space-y-6">
                {["Live priority SLA queueing", "Side-by-side audit telemetry", "Mandatory override protocols", "Macro-level dataset drift analytics"].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-white/80 font-bold text-md">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                      <ArrowRight size={14} strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. CTA BAND */}
      <section className="py-32 px-6 md:px-12 bg-dark">
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="glass-strong rounded-[48px] max-w-5xl mx-auto p-16 md:p-24 pl-16 text-center shadow-2xl relative overflow-hidden border border-white/10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,241,53,0.15),transparent_70%)] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-heading font-black text-5xl md:text-6xl text-white mb-6 tracking-tight">Deploy inference.</h2>
            <p className="text-xl text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed">Join edge-tier lending institutions processing risk matrices securely and transparently in milliseconds.</p>
            <Button onClick={() => navigate('/register')} variant="primary" className="h-16 px-10 text-lg font-bold shadow-[0_0_30px_rgba(200,241,53,0.3)] hover:scale-105 transition-transform bg-lime text-dark border-none">
              Initialize Workspace
            </Button>
          </div>
        </motion.div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#050508] pt-24 pb-12 px-6 md:px-12 mt-auto border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center">
                  <span className="text-dark text-xl font-bold leading-none">+</span>
                </div>
                <span className="font-heading font-black text-white text-2xl tracking-tight">LoanSense</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed max-w-xs font-medium">
                Democratizing structured financial analysis workflows via modern interpretable algorithms.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Platform</h4>
              <ul className="space-y-4 text-sm font-bold text-text-muted">
                <li><a href="#features" className="hover:text-lime transition-colors">Risk Assessment</a></li>
                <li><a href="#intelligence" className="hover:text-lime transition-colors">Data Pipelines</a></li>
                <li><a href="#architecture" className="hover:text-lime transition-colors">Officer Portals</a></li>
                <li><a href="#" className="hover:text-lime transition-colors">Model Metrics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Organization</h4>
              <ul className="space-y-4 text-sm font-bold text-text-muted">
                <li><a href="#" className="hover:text-lime transition-colors">Research Labs</a></li>
                <li><a href="#" className="hover:text-lime transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-lime transition-colors">Press Config</a></li>
                <li><a href="#" className="hover:text-lime transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Compliance</h4>
              <ul className="space-y-4 text-sm font-bold text-text-muted">
                <li><a href="#" className="hover:text-lime transition-colors">Privacy Node</a></li>
                <li><a href="#" className="hover:text-lime transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-lime transition-colors">Security Certs</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-text-faint font-bold tracking-widest uppercase">
              &copy; {new Date().getFullYear()} LoanSense Architecture. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
