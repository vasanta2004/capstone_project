import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-background-dark text-text-primary font-sans relative overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative dot-grid border-r border-white/8 flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-accent flex items-center justify-center">
            <span className="text-black font-heading font-extrabold text-lg">R</span>
          </div>
          <span className="font-heading font-extrabold text-2xl uppercase tracking-tight">
            Ride<span className="text-accent">X</span>
          </span>
        </Link>

        <div className="z-10">
          <p className="text-accent text-[10px] font-bold uppercase tracking-[0.4em] mb-4">// Authentication</p>
          <h1 className="font-heading text-5xl xl:text-6xl font-extrabold uppercase leading-[0.95] tracking-tighter">
            Your key<br />to the <span className="gradient-text">city</span>
          </h1>
          <p className="text-text-secondary mt-6 max-w-sm text-sm leading-relaxed">
            Sign in or create an account to access rider, driver, or admin portals.
          </p>
        </div>

        <div className="z-10 flex gap-8 text-[10px] uppercase tracking-widest text-text-secondary">
          <span>Hubli, KA</span>
          <span className="text-accent">●</span>
          <span>Secure login</span>
        </div>

        <div className="absolute bottom-0 right-0 w-64 h-64 border-l border-t border-accent/20 opacity-40" />
        <div className="absolute top-1/3 right-12 w-px h-40 bg-gradient-to-b from-transparent via-accent to-transparent opacity-30" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative">
        <div className="absolute inset-0 dot-grid opacity-50 lg:hidden" />
        <div className="absolute top-6 left-6 lg:hidden z-20">
          <Link to="/" className="font-heading font-extrabold text-xl uppercase">
            Ride<span className="text-accent">X</span>
          </Link>
        </div>
        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default AuthLayout;
