import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMapPin, FiClock, FiShield, FiTrendingUp } from 'react-icons/fi';

const Marquee = () => (
  <div className="overflow-hidden border-y border-white/5 bg-black py-4">
    <div className="animate-marquee whitespace-nowrap flex">
      {[...Array(4)].map((_, i) => (
        <span key={i} className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 mx-12">
          HUBLI · KARNATAKA · RIDEX · PREMIUM MOBILITY · 24/7 AVAILABILITY · SEAMLESS TRANSIT ·
        </span>
      ))}
    </div>
  </div>
);

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const portals = [
    {
      to: '/login',
      title: 'BOOK A RIDE',
      subtitle: 'Go anywhere, anytime.',
      desc: 'Experience seamless mobility across the city with real-time tracking and premium comfort.',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop',
    }
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white selection:bg-white selection:text-black">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
          <img 
            src="https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?q=80&w=2072&auto=format&fit=crop" 
            alt="Cityscape" 
            className="w-full h-full object-cover opacity-30 scale-105 animate-pulse-ring"
          />
        </div>

        <motion.div 
          style={{ y: y1, opacity: opacity1 }}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-[10px] font-bold tracking-[0.3em] uppercase mb-8">
              The New Standard
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
            className="font-heading font-extrabold text-[clamp(3.5rem,8vw,8rem)] leading-[0.85] tracking-tighter uppercase mb-6"
          >
            Move <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              Different
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light"
          >
            A premium mobility platform designed for Hubli. 
            Experience unparalleled comfort, speed, and reliability.
          </motion.p>
        </motion.div>
      </section>

      <Marquee />

      {/* Portals Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {portals.map((portal, idx) => (
            <motion.div
              key={portal.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: idx * 0.2 }}
            >
              <Link 
                to={portal.to}
                className="group relative block h-[500px] rounded-3xl overflow-hidden bg-surface-dark border border-white/10 hover:border-white/30 transition-all duration-500"
              >
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500 z-10" />
                  <img 
                    src={portal.image} 
                    alt={portal.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                  />
                </div>
                
                <div className="relative z-20 h-full p-10 flex flex-col justify-between">
                  <div>
                    <h2 className="font-heading text-5xl md:text-6xl font-extrabold text-white uppercase tracking-tight">
                      {portal.title}
                    </h2>
                    <p className="text-xl text-white/90 mt-2 font-medium">{portal.subtitle}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-300 max-w-sm mb-8 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                      {portal.desc}
                    </p>
                    <div className="inline-flex items-center gap-3 bg-white text-black px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                      Enter Portal <FiArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="md:col-span-2 bento-card p-10 flex flex-col justify-between min-h-[300px]">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <FiMapPin className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold mb-3">Live Tracking</h3>
              <p className="text-gray-400 max-w-md">Watch your ride approach in real-time. Our advanced mapping infrastructure ensures you know exactly when to step outside.</p>
            </div>
          </div>
          
          <div className="bento-card p-10 flex flex-col justify-between min-h-[300px]">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <FiClock className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold mb-3">3 Min</h3>
              <p className="text-gray-400">Average pickup time across all our service zones.</p>
            </div>
          </div>
          
          <div className="bento-card p-10 flex flex-col justify-between min-h-[300px]">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <FiShield className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold mb-3">Verified</h3>
              <p className="text-gray-400">Every driver is thoroughly vetted for your safety and peace of mind.</p>
            </div>
          </div>

          <div className="md:col-span-2 bento-card p-10 flex flex-col justify-between min-h-[300px] bg-gradient-to-br from-white/10 to-transparent">
            <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center mb-6">
              <FiTrendingUp className="text-xl" />
            </div>
            <div>
              <h3 className="text-4xl font-extrabold mb-3">10,000+ Rides</h3>
              <p className="text-gray-400 max-w-md">Completed this month alone. Join the fastest growing mobility network in the region.</p>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default LandingPage;
