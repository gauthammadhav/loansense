import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Check, ArrowRight, Activity, Code, FileText, Database, Shield, Zap } from 'lucide-react';

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
      <nav className="sticky top-0 z-50 bg-white border-b border-border py-4 px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-dark rounded flex items-center justify-center">
            <span className="text-lime text-lg font-bold leading-none">+</span>
          </div>
          <span className="font-heading font-bold text-dark text-xl tracking-tight">LoanSense</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[13px] text-muted font-medium">
          <a href="#features" className="hover:text-dark transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-dark transition-colors">How it works</a>
          <a href="#portals" className="hover:text-dark transition-colors">For officers</a>
          <a href="#about" className="hover:text-dark transition-colors">About</a>
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
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 bg-dark p-1.5 pr-4 rounded-full border border-dark/10">
            <span className="bg-lime text-dark text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">ML-Powered</span>
            <span className="text-white/80 text-xs font-medium">Decisions in under 2 seconds</span>
          </div>
          
          <h1 className="font-heading font-extrabold text-[58px] leading-[1.1] tracking-tight">
            <span className="block text-dark">Loans decided.</span>
            <span className="block text-transparent bg-clip-text" style={{ WebkitTextStroke: '1px var(--lime-dark)', color: 'transparent' }}>Reasons</span>
            <span className="block text-dark">included.</span>
          </h1>
          
          <p className="text-base text-muted max-w-md leading-relaxed">
            LoanSense uses machine learning to predict loan approvals instantly — and shows you exactly why, so every decision feels fair and transparent.
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <Button onClick={() => navigate('/register')} className="h-12 px-6 bg-dark text-white hover:bg-dark/90 text-sm">
              Check your eligibility
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')} className="h-12 px-6 text-sm border-dark text-dark flex items-center gap-2">
              Officer portal <ArrowRight size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-3 border border-border rounded-[20px] divide-x divide-border mt-12 overflow-hidden">
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
          </div>
        </div>

        {/* Right Col mock UI */}
        <div className="relative">
          <div className="bg-[#111111] rounded-[20px] p-8 shadow-2xl border border-white/10 relative z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime to-success"></div>
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
                    <div 
                      className={`h-full rounded-full ${item.pos ? 'bg-lime' : 'bg-danger'}`} 
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute -bottom-6 -right-6 bg-page border border-border rounded-xl p-4 pr-12 shadow-lg z-20 flex items-center gap-4 cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate('/register')}>
            <div className="w-8 h-8 rounded-full bg-dark flex items-center justify-center text-lime">
              <Activity size={16} />
            </div>
            <span className="text-sm font-bold text-dark tracking-tight">What-if simulator — Live ↗</span>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="bg-page py-24 px-12 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold text-lime-dark uppercase tracking-widest bg-lime/20 px-3 py-1 rounded-full border border-lime/30 mb-4 inline-block">Features</span>
            <h2 className="font-heading font-extrabold text-[40px] text-dark leading-tight">Everything a modern loan system needs</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'SHAP explainability', desc: 'Stop guessing why models make decisions. Get feature-level breakdown for every applicant.', tag: 'Transparent AI', icon: <Code /> },
              { title: 'What-if simulator', desc: 'Let applicants adjust their financial parameters live to see how it affects their approval odds.', tag: 'Interactive', icon: <Activity /> },
              { title: 'Self-improving model', desc: 'Automated ML pipelines re-train XGBoost classifiers when new verified data thresholds are met.', tag: 'Adaptive ML', icon: <Database /> },
              { title: 'PDF decision letters', desc: 'Generate compliance-ready decision documents with embedded charts at the click of a button.', tag: 'Auto-generated', icon: <FileText /> },
              { title: '4-model comparison', desc: 'The backend continuously evaluates RandomForest, XGBoost, and Logistic Regression to deploy the best.', tag: 'Multi-model', icon: <Zap /> },
              { title: 'Fairness audit', desc: 'Real-time demographic tracking ensures your approval rates remain unbiased and compliant.', tag: 'Compliance', icon: <Shield /> }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-[20px] border border-border hover:shadow-xl hover:border-dark/20 transition-all group">
                <div className="w-12 h-12 bg-dark rounded-xl flex items-center justify-center text-lime mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg text-dark mb-3">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed mb-6">{f.desc}</p>
                <span className="text-[10px] font-bold text-lime-dark bg-page px-2.5 py-1 rounded border border-border uppercase tracking-wide">{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-12 bg-white max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 block">Workflow</span>
          <h2 className="font-heading font-extrabold text-[40px] text-dark leading-tight max-w-md">From application to decision in minutes</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { num: '01', title: 'Fill your profile', desc: 'A clean 5-step wizard captures your financial footprint securely.' },
            { num: '02', title: 'Get an instant prediction', desc: 'Our ML engine scores your application in milliseconds.' },
            { num: '03', title: 'Officer reviews', desc: 'A certified loan officer audits the AI suggestion against your timeline.' },
            { num: '04', title: 'Receive your decision', desc: 'Get your final letter with transparent reasons included.' }
          ].map((step, i) => (
            <div key={i} className="bg-[#111111] p-10 rounded-[20px] relative overflow-hidden group">
              <div className="absolute top-6 right-6 text-[80px] font-heading font-extrabold text-white/[0.03] leading-none group-hover:text-white/[0.08] transition-colors pointer-events-none">
                {step.num}
              </div>
              <h3 className="text-white font-bold text-xl mb-3 relative z-10">{step.title}</h3>
              <p className="text-white/60 text-sm max-w-xs leading-relaxed relative z-10">{step.desc}</p>
            </div>
          ))}
        </div>
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
      <footer className="bg-white border-t border-border py-8 px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-dark rounded flex items-center justify-center">
            <span className="text-lime text-[10px] font-bold leading-none">+</span>
          </div>
          <span className="font-heading font-bold text-dark text-sm">LoanSense</span>
        </div>
        
        <div className="text-[11px] text-muted font-medium">
          College Mini Project · Banking & FinTech Domain
        </div>
        
        <div className="text-[11px] text-muted font-medium bg-page px-3 py-1 rounded-full border border-border">
          v1.1 · Design System Updated
        </div>
      </footer>
    </div>
  );
}
