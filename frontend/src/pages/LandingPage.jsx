import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Search, FileText, CheckCircle, ArrowRight, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col pt-6 px-6 sm:px-12 pb-12">
      {/* Navbar */}
      <nav className="flex justify-between items-center glass-panel px-6 py-4 mb-16 mx-auto max-w-6xl w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent1 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Zap size={22} className="fill-current" />
          </div>
          <span className="font-bold text-xl tracking-tight">PlacementAI</span>
        </div>
        <Link 
          to="/chat" 
          className="glass-button px-6 py-2.5 text-primary font-semibold flex items-center gap-2 hover:text-primaryHover"
        >
          Launch Assistant <ArrowRight size={18} />
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-8 text-secondary"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          LPU Student Placement Assistant
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-tight"
        >
          LPU Placement Policy <br />
          <span className="text-gradient">Assistant Workspace</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-xl text-textMuted mb-10 max-w-2xl font-light"
        >
          Multi-agent AI workflow featuring semantic placement policy retrieval, student eligibility rule evaluation, and placement risk analysis.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <Link 
            to="/chat" 
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent1 text-white rounded-full font-semibold text-lg overflow-hidden shadow-xl shadow-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            <span className="absolute inset-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></span>
            Launch Assistant Now
          </Link>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto w-full mt-32 mb-24 z-10">
        <h2 className="text-2xl font-semibold mb-10 text-center">Intelligent Multi-Agent Core</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Search className="text-secondary" size={24} />}
            title="Retrieval Agent"
            desc="Semantically searches LPU placement policy database for relevant rules."
          />
          <FeatureCard 
            icon={<CheckCircle className="text-accent2" size={24} />}
            title="Risk Analysis"
            desc="Flags policy exceptions, offer rejections, and placement conflicts."
          />
          <FeatureCard 
            icon={<FileText className="text-accent1" size={24} />}
            title="Summary Agent"
            desc="Generates concise, citable placement guidelines evaluations."
          />
        </div>
      </section>
      
      {/* Footer */}
      <footer className="text-center text-textMuted text-sm mt-auto z-10">
        <p>&copy; 2026 PlacementAI. LPU Student Assistant Edition.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-card p-6 flex flex-col gap-4">
    <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center shadow-sm">
      {icon}
    </div>
    <h3 className="font-semibold text-lg">{title}</h3>
    <p className="text-textMuted text-sm leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
