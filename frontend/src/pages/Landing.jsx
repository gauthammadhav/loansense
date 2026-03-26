import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Activity, Code, FileText, Database, Shield, Zap } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.12, delayChildren: 0.2 } 
  }
};

export default function Landing() {
  const { isAuthenticated, role } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/${role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <div className="bg-white min-h-screen font-body scroll-smooth text-dark overflow-x-hidden">
      
      {/* 1. NAVBAR */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border py-4 px-12 flex items-center justify-between"
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <div className="w-7 h-7 bg-dark rounded flex items-center justify-center">
            <span className="text-lime text-lg font-bold leading-none">+</span>
          </div>
          <span className="font-heading font-bold text-dark text-xl tracking-tight">LoanSense</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[13px] text-muted font-bold uppercase tracking-wider">
          <a href="#features" className="hover:text-lime-dark transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-lime-dark transition-colors">Process</a>
          <a href="#portals" className="hover:text-lime-dark transition-colors">Portals</a>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/login')} className="h-10 px-5 text-xs font-bold uppercase tracking-widest border-2">
            Sign in
          </Button>
          <Button variant="primary" onClick={() => navigate('/register')} className="h-10 px-5 text-xs font-bold uppercase tracking-widest bg-dark text-white border-dark hover:bg-dark/90 shadow-lg">
            Apply now
          </Button>
        </div>
      </motion.nav>

      {/* 2. HERO */}
      <section className="px-12 py-[120px] max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-10"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 bg-dark p-2 pr-5 rounded-full border border-white/10 shadow-xl">
            <span className="bg-lime text-dark text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">System v1.2</span>
            <span className="text-white/90 text-xs font-bold tracking-tight">AI decisions in under 2 seconds</span>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="font-heading font-extrabold text-[72px] lg:text-[84px] leading-[0.95] tracking-tighter">
            <span className="block text-dark">Loans decided.</span>
            <span className="block text-transparent bg-clip-text" style={{ WebkitTextStroke: '2px var(--lime-dark)', color: 'transparent' }}>Reasons</span>
            <span className="block text-dark">included.</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-lg text-muted max-w-md leading-relaxed font-medium">
            LoanSense leverages neural networks to predict loan approvals instantly — provides precise SHAP feature impact metrics for total transparency.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex items-center gap-6 pt-4">
            <Button onClick={() => navigate('/register')} className="h-14 px-8 bg-dark text-white hover:bg-dark/90 text-sm font-bold shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] group">
              Check Eligibility <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="grid grid-cols-3 border-2 border-border rounded-[32px] divide-x-2 divide-border overflow-hidden bg-page/30 backdrop-blur-sm shadow-inner">
            <div className="p-6 text-center">
              <div className="font-heading font-bold text-3xl text-dark mb-1">94%</div>
              <div className="text-[10px] text-muted font-extrabold uppercase tracking-widest">Accuracy</div>
            </div>
            <div className="p-6 text-center">
              <div className="font-heading font-bold text-3xl text-dark mb-1">&lt;2s</div>
              <div className="text-[10px] text-muted font-extrabold uppercase tracking-widest">Latency</div>
            </div>
            <div className="p-6 text-center">
              <div className="font-heading font-bold text-3xl text-dark mb-1">4x</div>
              <div className="text-[10px] text-muted font-extrabold uppercase tracking-widest">Verified Algos</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Col mock UI */}
        <motion.div 
          initial={{ opacity: 0, x: 50, rotate: 2 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="bg-[#111111] rounded-[32px] p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] border border-white/10 relative z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-lime via-success to-lime shadow-[0_0_20px_var(--lime)]"></div>
            <h3 className="text-white font-heading font-bold text-2xl mb-8">SHAP Decision Breakdown</h3>
            <div className="mb-10 flex items-center gap-4">
              <div className="bg-success text-dark px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-success/20">
                <Check size={16} strokeWidth={4} /> Approved
              </div>
              <span className="text-white/60 text-sm font-bold tracking-tighter">Confidence: 91.4%</span>
            </div>
            
            <div className="space-y-6">
              {[
                { label: "Credit Score (780)", val: 85, pos: true },
                { label: "Total Income ($120k)", val: 65, pos: true },
                { label: "Debt Ratio (42%)", val: 35, pos: false },
                { label: "Loan Amount ($300k)", val: 20, pos: false }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold text-white/50 mb-2.5 uppercase tracking-widest">
                    <span>{item.label}</span>
                    <span className={item.pos ? 'text-lime' : 'text-danger'}>{item.pos ? '+ Contribution' : '- Risk Factor'}</span>
                  </div>
                  <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.val}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                      className={`h-full rounded-full shadow-lg ${item.pos ? 'bg-lime' : 'bg-danger'}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="absolute -bottom-10 -right-10 bg-white border-4 border-page rounded-[24px] p-6 shadow-2xl z-20 flex items-center gap-6 cursor-pointer group" 
            onClick={() => navigate('/register')}
          >
            <div className="w-12 h-12 rounded-2xl bg-dark flex items-center justify-center text-lime shadow-xl group-hover:rotate-12 transition-transform">
              <Activity size={24} />
            </div>
            <div>
              <span className="block text-xs font-black uppercase tracking-widest text-muted mb-1">Interactive</span>
              <span className="block text-lg font-bold text-dark tracking-tight">What-if simulator — Live ↗</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="bg-page/50 py-32 px-12 border-y border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--dark) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-24"
          >
            <span className="text-[11px] font-black text-lime-dark uppercase tracking-[0.2em] bg-lime/15 px-4 py-1.5 rounded-full border border-lime/20 mb-6 inline-block">Architecture Features</span>
            <h2 className="font-heading font-extrabold text-[52px] text-dark leading-tight tracking-tight">Everything a modern loan system needs</h2>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { title: 'SHAP explainability', desc: 'Stop guessing why models make decisions. Get feature-level breakdown for every single application.', tag: 'Transparency', icon: <Code /> },
              { title: 'What-if simulator', desc: 'Let applicants adjust their financial parameters live to see how it affects their approval likelihood.', tag: 'Interaction', icon: <Activity /> },
              { title: 'Self-improving model', desc: 'Automated ML pipelines re-train XGBoost classifiers when new verified data thresholds are reached.', tag: 'Adaptive ML', icon: <Database /> },
              { title: 'PDF decision letters', desc: 'Generate compliance-ready decision documents with embedded SHAP charts at the click of a button.', tag: 'Operations', icon: <FileText /> },
              { title: '4-algo evaluation', desc: 'The system continuously evaluates RandomForest, XGBoost, and DecisionTrees to deploy the apex performer.', tag: 'Optimization', icon: <Zap /> },
              { title: 'Bias & Fairness audit', desc: 'Real-time demographic tracking ensures your approval rates remain unbiased and fully compliant.', tag: 'Compliance', icon: <Shield /> }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[32px] border border-border hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:border-lime/30 transition-all group relative overflow-hidden"
              >
                <div className="w-14 h-14 bg-dark rounded-2xl flex items-center justify-center text-lime mb-8 group-hover:scale-110 group-hover:bg-lime group-hover:text-dark transition-all duration-500 shadow-xl shadow-dark/10">
                  {f.icon}
                </div>
                <h3 className="font-bold text-xl text-dark mb-4 tracking-tight">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed mb-8 font-medium italic">"{f.desc}"</p>
                <span className="text-[10px] font-black text-lime-dark bg-page/50 px-3 py-1.5 rounded-lg border border-border uppercase tracking-widest">{f.tag}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-32 px-12 bg-white max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <span className="text-[11px] font-black text-muted uppercase tracking-[0.2em] mb-4 block">Deployment Cycle</span>
          <h2 className="font-heading font-extrabold text-[52px] text-dark leading-none tracking-tighter max-w-md">From request to outcome in minutes</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[
            { num: '01', title: 'Data Profiling', desc: 'A clean 5-step wizard captures your financial footprint securely with real-time validation.' },
            { num: '02', title: 'Inference Engine', desc: 'Our ML models score your parameters against 10,000+ historical data points in seconds.' },
            { num: '03', title: 'Human Oversight', desc: 'A certified loan officer audits the AI suggestion alongside a complete audit timeline.' },
            { num: '04', title: 'Decision Output', desc: 'Receive your final outcome letter with transparent reasoning and compliance data included.' }
          ].map((step, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-[#111111] p-12 rounded-[32px] relative overflow-hidden group hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="absolute top-8 right-8 text-[120px] font-heading font-black text-white/[0.03] leading-none group-hover:text-white/[0.07] transition-all duration-700 pointer-events-none select-none">
                {step.num}
              </div>
              <h3 className="text-white font-bold text-2xl mb-4 relative z-10 tracking-tight">{step.title}</h3>
              <p className="text-white/50 text-base max-w-xs leading-relaxed relative z-10 font-medium">{step.desc}</p>
              <div className="mt-8 relative z-10 w-12 h-1 bg-lime/20 group-hover:w-full transition-all duration-700"></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. TWO PORTALS SECTION */}
      <section id="portals" className="py-32 px-12 bg-page border-y border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-20"
          >
            <h2 className="font-heading font-extrabold text-[52px] text-dark leading-tight tracking-tighter">Dual-Core Banking Experience</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Applicant Card */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-14 rounded-[40px] border-2 border-border shadow-soft relative group"
            >
              <div className="absolute top-10 right-10 bg-page p-4 rounded-3xl opacity-20 group-hover:opacity-100 transition-opacity">
                <UserIcon className="text-dark" size={32} />
              </div>
              <h3 className="font-heading font-black text-4xl mb-10 text-dark tracking-tighter">Applicants</h3>
              <ul className="space-y-6">
                {[
                  "Guided 5-step intuitive loan wizard",
                  "Real-time AI-driven score prediction",
                  "SHAP feature visualizations for logic",
                  "Sandbox What-If simulator suite",
                  "Secure history tracking analytics",
                  "Automated PDF decision generation"
                ].map((item, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-5 text-dark font-bold text-sm tracking-tight"
                  >
                    <div className="w-7 h-7 rounded-xl bg-lime/20 flex items-center justify-center text-lime-dark shrink-0">
                      <Check size={14} strokeWidth={4} />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            {/* Officer Card */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#111111] p-14 rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5 group"
            >
               <div className="absolute top-10 right-10 bg-white/5 p-4 rounded-3xl opacity-20 group-hover:opacity-100 transition-opacity">
                <Shield className="text-lime" size={32} />
              </div>
              <h3 className="font-heading font-black text-4xl mb-10 text-white tracking-tighter">Officers</h3>
              <ul className="space-y-6">
                {[
                  "FIFO priority task queue dashboard",
                  "Comprehensive AI audit trails",
                  "Dual-view ML verification metrics",
                  "Forced override accountability logging",
                  "Demographic statistical bias monitoring",
                  "Instant XGBoost retraining controls"
                ].map((item, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-5 text-white/90 font-bold text-sm tracking-tight"
                  >
                    <div className="w-7 h-7 rounded-xl bg-lime flex items-center justify-center text-dark shrink-0 shadow-[0_0_15px_var(--lime)]">
                      <Check size={14} strokeWidth={4} />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. CTA BAND */}
      <section className="py-32 px-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#111111] rounded-[48px] max-w-7xl mx-auto p-20 text-center shadow-[0_60px_120px_-30px_rgba(0,0,0,0.7)] relative overflow-hidden group"
        >
          <div className="absolute inset-0 opacity-15 group-hover:scale-110 transition-transform duration-[20s]" style={{ backgroundImage: 'radial-gradient(var(--lime) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <h2 className="font-heading font-extrabold text-[64px] text-white mb-6 leading-none tracking-tighter">Ready to find out?</h2>
            <p className="text-white/50 text-xl mb-12 max-w-lg mx-auto font-medium">Quantify your risk and reveal your credit approval potential in under 3 minutes.</p>
            <Button onClick={() => navigate('/register')} className="h-16 px-12 bg-lime text-dark hover:bg-lime/90 font-black text-xs uppercase tracking-[0.3em] border-0 shadow-[0_0_50px_rgba(200,241,53,0.3)] hover:shadow-[0_0_80px_rgba(200,241,53,0.5)] transition-all">
              Initialize Application
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-white border-t border-border py-12 px-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-dark rounded flex items-center justify-center shadow-lg">
            <span className="text-lime text-xs font-black leading-none">+</span>
          </div>
          <span className="font-heading font-bold text-dark text-lg tracking-tighter">LoanSense</span>
        </div>
        
        <div className="text-[10px] text-muted font-black uppercase tracking-[0.4em]">
          Banking & FinTech Engineering Core
        </div>
        
        <div className="text-[10px] font-black text-muted flex items-center gap-3">
          <span className="bg-page border border-border px-3 py-1 rounded-full text-[9px] tracking-widest uppercase">System v1.2</span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}

const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
