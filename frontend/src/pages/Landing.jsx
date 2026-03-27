import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Check, ArrowRight, Activity, Code, FileText, Database, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
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
    <div className="bg-white min-h-screen font-body scroll-smooth text-dark">
      
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm py-4 px-12 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-dark rounded flex items-center justify-center">
            <span className="text-lime text-lg font-bold leading-none">+</span>
          </div>
          <span className="font-heading font-bold text-dark text-xl tracking-tight">LoanSense</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[13px] text-muted font-medium">
          <a href="#features" className="relative group hover:text-lime-dark hover:-translate-y-0.5 transition-all duration-300">
            Features
            <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-lime-dark group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full" />
          </a>
          <a href="#how-it-works" className="relative group hover:text-lime-dark hover:-translate-y-0.5 transition-all duration-300">
            How it works
            <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-lime-dark group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full" />
          </a>
          <a href="#portals" className="relative group hover:text-lime-dark hover:-translate-y-0.5 transition-all duration-300">
            For officers
            <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-lime-dark group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full" />
          </a>
          <a href="#about" className="relative group hover:text-lime-dark hover:-translate-y-0.5 transition-all duration-300">
            About
            <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-lime-dark group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full" />
          </a>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/login')} className="h-9 px-4 text-xs">
            Sign in
          </Button>
          <Button variant="primary" onClick={() => navigate('/register')} className="h-9 px-4 text-xs bg-dark text-white border-dark hover:bg-dark/90">
            Apply now
          </Button>
        </div>
      </nav>

      {/* 2. HERO */}
      <section className="px-12 py-[88px] max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          className="space-y-8"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 bg-dark p-1.5 pr-4 rounded-full border border-dark/10">
            <span className="bg-lime text-dark text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">ML-Powered</span>
            <span className="text-white/80 text-xs font-medium">Decisions in under 2 seconds</span>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="font-heading font-extrabold text-[58px] leading-[1.1] tracking-tight">
            <span className="block text-dark">Loans decided.</span>
            <span className="block text-transparent bg-clip-text" style={{ WebkitTextStroke: '1px var(--lime-dark)', color: 'transparent' }}>Reasons</span>
            <span className="block text-dark">included.</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-base text-muted max-w-md leading-relaxed">
            LoanSense uses machine learning to predict loan approvals instantly — and shows you exactly why, so every decision feels fair and transparent.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex items-center gap-4 pt-4">
            <Button onClick={() => navigate('/register')} className="h-12 px-6 bg-dark text-white hover:bg-dark/90 text-sm">
              Check your eligibility
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')} className="h-12 px-6 text-sm border-dark text-dark flex items-center gap-2">
              Officer portal <ArrowRight size={16} />
            </Button>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="grid grid-cols-3 border border-border rounded-[20px] divide-x divide-border mt-12 overflow-hidden">
            <div className="p-4 text-center">
              <div className="font-heading font-bold text-2xl text-dark mb-1">94%</div>
              <div className="text-[11px] text-muted font-bold uppercase tracking-wider">Model Accuracy</div>
            </div>
            <div className="p-4 text-center">
              <div className="font-heading font-bold text-2xl text-dark mb-1">&lt;2s</div>
              <div className="text-[11px] text-muted font-bold uppercase tracking-wider">Decision Time</div>
            </div>
            <div className="p-4 text-center">
              <div className="font-heading font-bold text-2xl text-dark mb-1">4x</div>
              <div className="text-[11px] text-muted font-bold uppercase tracking-wider">Models Compared</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Col mock UI */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative"
        >
          <div className="bg-[#111111] rounded-[20px] p-8 shadow-2xl border border-white/10 relative z-10 overflow-hidden">
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime to-success origin-left"
            ></motion.div>
            <h3 className="text-white font-heading font-bold text-xl mb-6">SHAP Decision Breakdown</h3>
            <div className="mb-8 flex items-center gap-3">
              <div className="bg-success/20 text-success border border-success/30 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                <Check size={14} /> Approved
              </div>
              <span className="text-white/60 text-sm font-medium">91% confidence</span>
            </div>
            
            <div className="space-y-5">
              {[
                { label: "Credit Score (780)", val: 85, pos: true },
                { label: "Total Income ($120k)", val: 65, pos: true },
                { label: "Debt Ratio (42%)", val: 40, pos: false },
                { label: "Loan Amount ($300k)", val: 20, pos: false }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs text-white/70 mb-2 font-medium">
                    <span>{item.label}</span>
                    <span className={item.pos ? 'text-lime' : 'text-danger'}>{item.pos ? '+ Impact' : '- Impact'}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.val}%` }}
                      transition={{ duration: 1, delay: 1 + i * 0.1, type: 'spring' }}
                      className={`h-full rounded-full ${item.pos ? 'bg-lime' : 'bg-danger'}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="absolute -bottom-6 -right-6 bg-page border border-border rounded-xl p-4 pr-12 shadow-lg z-20 flex items-center gap-4 cursor-pointer hover:-translate-y-1 transition-transform" 
            onClick={() => navigate('/register')}
          >
            <div className="w-8 h-8 rounded-full bg-dark flex items-center justify-center text-lime">
              <Activity size={16} />
            </div>
            <span className="text-sm font-bold text-dark tracking-tight">What-if simulator — Live ↗</span>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="bg-page py-24 px-12 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold text-lime-dark uppercase tracking-widest bg-lime/20 px-3 py-1 rounded-full border border-lime/30 mb-4 inline-block">Features</span>
            <h2 className="font-heading font-extrabold text-[40px] text-dark leading-tight">Everything a modern loan system needs</h2>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { title: 'SHAP explainability', desc: 'Stop guessing why models make decisions. Get feature-level breakdown for every applicant.', tag: 'Transparent AI', icon: <Code /> },
              { title: 'What-if simulator', desc: 'Let applicants adjust their financial parameters live to see how it affects their approval odds.', tag: 'Interactive', icon: <Activity /> },
              { title: 'Self-improving model', desc: 'Automated ML pipelines re-train XGBoost classifiers when new verified data thresholds are met.', tag: 'Adaptive ML', icon: <Database /> },
              { title: 'PDF decision letters', desc: 'Generate compliance-ready decision documents with embedded charts at the click of a button.', tag: 'Auto-generated', icon: <FileText /> },
              { title: '4-model comparison', desc: 'The backend continuously evaluates RandomForest, XGBoost, and Logistic Regression to deploy the best.', tag: 'Multi-model', icon: <Zap /> },
              { title: 'Fairness audit', desc: 'Real-time demographic tracking ensures your approval rates remain unbiased and compliant.', tag: 'Compliance', icon: <Shield /> }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                variants={scaleIn}
                whileHover={{ y: -5, transition: { type: 'spring', stiffness: 400 } }}
                className="bg-white p-8 rounded-[20px] border border-border shadow-sm hover:shadow-xl hover:border-dark/20 transition-all group cursor-default"
              >
                <div className="w-12 h-12 bg-dark rounded-xl flex items-center justify-center text-lime mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg text-dark mb-3">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed mb-6">{f.desc}</p>
                <span className="text-[10px] font-bold text-lime-dark bg-page px-2.5 py-1 rounded border border-border uppercase tracking-wide">{f.tag}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-12 bg-white max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 block">Workflow</span>
          <h2 className="font-heading font-extrabold text-[40px] text-dark leading-tight max-w-md">From application to decision in minutes</h2>
        </div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {[
            { num: '01', title: 'Fill your profile', desc: 'A clean 5-step wizard captures your financial footprint securely.' },
            { num: '02', title: 'Get an instant prediction', desc: 'Our ML engine scores your application in milliseconds.' },
            { num: '03', title: 'Officer reviews', desc: 'A certified loan officer audits the AI suggestion against your timeline.' },
            { num: '04', title: 'Receive your decision', desc: 'Get your final letter with transparent reasons included.' }
          ].map((step, i) => (
            <motion.div 
              key={i} 
              variants={fadeInUp}
              className="bg-[#111111] p-10 rounded-[20px] relative overflow-hidden group hover:bg-dark transition-colors"
            >
              <div className="absolute top-6 right-6 text-[80px] font-heading font-extrabold text-white/[0.03] leading-none group-hover:text-white/[0.08] transition-colors pointer-events-none">
                {step.num}
              </div>
              <h3 className="text-white font-bold text-xl mb-3 relative z-10">{step.title}</h3>
              <p className="text-white/60 text-sm max-w-xs leading-relaxed relative z-10">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. TWO PORTALS SECTION */}
      <section id="portals" className="py-24 px-12 bg-page border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 block">Architecture</span>
            <h2 className="font-heading font-extrabold text-[40px] text-dark leading-tight">Built for applicants and officers</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applicant Card */}
            <div className="bg-white p-12 rounded-[24px] border border-border">
              <h3 className="font-heading font-extrabold text-3xl mb-8 text-dark">For applicants</h3>
              <ul className="space-y-5">
                {[
                  "Guided 5-step loan wizard",
                  "Real-time dynamic decisioning",
                  "SHAP visualizations of logic",
                  "Interactive What-If score simulator",
                  "Secure dashboard tracking",
                  "Downloadable PDF outcome letters"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-dark font-medium text-sm">
                    <div className="w-6 h-6 rounded-full bg-lime/20 flex items-center justify-center text-lime-dark shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Officer Card */}
            <div className="bg-[#111111] p-12 rounded-[24px]">
              <h3 className="font-heading font-extrabold text-3xl mb-8 text-white">For loan officers</h3>
              <ul className="space-y-5">
                {[
                  "FIFO priority queue dashboard",
                  "Full application audit trails",
                  "Side-by-side ML verification",
                  "Mandatory override justifications",
                  "Demographic bias monitoring",
                  "1-click XGBoost retraining pipeline"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-white/90 font-medium text-sm">
                    <div className="w-6 h-6 rounded-full bg-lime flex items-center justify-center text-dark shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA BAND */}
      <section className="py-24 px-12">
        <div className="bg-[#111111] rounded-[24px] max-w-7xl mx-auto p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(var(--lime) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10">
            <h2 className="font-heading font-extrabold text-[48px] text-white mb-4">Ready to find out?</h2>
            <p className="text-white/60 text-lg mb-10 max-w-md mx-auto">Check your eligibility in under 3 minutes. No commitment required.</p>
            <Button onClick={() => navigate('/register')} className="h-14 px-8 bg-lime text-dark hover:bg-lime/90 font-bold text-base border-0">
              Get started free
            </Button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#0A0A0A] pt-20 pb-12 px-12 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-lime rounded flex items-center justify-center">
                  <span className="text-dark text-xs font-bold leading-none">+</span>
                </div>
                <span className="font-heading font-extrabold text-white text-xl tracking-tight">LoanSense</span>
              </div>
              <p className="text-[13px] text-white/50 leading-relaxed max-w-[240px]">
                Democratizing financial decisions through transparent, machine-learning-driven lending logic.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-sm mb-6">Product</h4>
              <ul className="space-y-4 text-[13px] text-white/50">
                <li><a href="#features" className="hover:text-lime transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-lime transition-colors">How it works</a></li>
                <li><a href="#portals" className="hover:text-lime transition-colors">For officers</a></li>
                <li><a href="#" className="hover:text-lime transition-colors">What-if Simulator</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-6">Company</h4>
              <ul className="space-y-4 text-[13px] text-white/50">
                <li><a href="#" className="hover:text-lime transition-colors">About us</a></li>
                <li><a href="#" className="hover:text-lime transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-lime transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-lime transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-6">Legal</h4>
              <ul className="space-y-4 text-[13px] text-white/50">
                <li><a href="#" className="hover:text-lime transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-lime transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-lime transition-colors">Security Center</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[11px] text-white/30 font-medium tracking-wide">
              &copy; {new Date().getFullYear()} LoanSense Financial Technologies. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-white/30">
              {/* Social placeholders */}
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:text-white hover:border-white/30 transition-colors cursor-pointer">
                in
              </div>
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:text-white hover:border-white/30 transition-colors cursor-pointer">
                x
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
