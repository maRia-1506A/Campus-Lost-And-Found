import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Search, MapPin, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 pt-24 pb-32">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
              Lost it? <span className="text-brand-600">Find it.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              The centralized lost and found platform for university students. 
              Report, search, and recover your belongings with ease.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/lost">
                <Button size="lg" className="w-full sm:w-auto">I Lost Something</Button>
              </Link>
              <Link to="/found">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white shadow-soft">I Found Something</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">A simple, secure process to get your items back to where they belong.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <Search className="w-8 h-8 text-brand-600" />,
                title: "Report & Search",
                desc: "Quickly post a lost or found item with details, photos, and location tags."
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-brand-600" />,
                title: "Secure Verification",
                desc: "Submit a claim with proof of ownership to securely recover your item."
              },
              {
                icon: <Clock className="w-8 h-8 text-brand-600" />,
                title: "Fast Recovery",
                desc: "Connect directly with the finder or loser through our integrated messaging."
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-soft transition-shadow">
                <div className="bg-brand-100 p-4 rounded-full mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
