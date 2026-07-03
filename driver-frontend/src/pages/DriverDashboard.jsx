import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useSocket from '../hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import MapComponent from '../components/MapComponent';
import { FiTrendingUp, FiClock, FiMap, FiCheckCircle } from 'react-icons/fi';

const DriverDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { acceptRide, rejectRide, completeRide, startRide, socket } = useSocket();

  const [isOnline, setIsOnline] = useState(false);
  const [rideRequests, setRideRequests] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [earnings, setEarnings] = useState({
    today: 184.50,
    week: 924.80,
    hours: 24
  });

  // Listen for real-time dispatches from riders
  useEffect(() => {
    if (!socket || !isOnline) {
      setRideRequests([]);
      return;
    }

    socket.on('ride-dispatch', (data) => {
      console.log('Received dispatch offer:', data);
      setRideRequests(prev => {
        // Prevent duplicates
        if (prev.find(r => r.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    socket.on('ride-withdrawn', (data) => {
      console.log('Ride withdrawn by system:', data);
      setRideRequests(prev => prev.filter(r => r.id !== data.rideId));
    });

    socket.on('ride-confirmed-by-rider', (data) => {
      console.log('Ride confirmed by system (auto-accepted):', data);
      setActiveRide({ ...data.ride, status: 'accepted' });
      setRideRequests([]);
    });

    return () => {
      socket.off('ride-dispatch');
      socket.off('ride-withdrawn');
      socket.off('ride-confirmed-by-rider');
    };
  }, [socket, isOnline]);

  const handleAcceptRide = (request) => {
    if (!request) return;

    // Send accept ride event to rider via socket server
    acceptRide({
      rideId: request.id,
      riderId: request.riderId,
      driverId: user?._id || user?.id || 'guest_driver',
      driverName: user?.name || 'Alexander Sterling',
      vehicle: user?.vehicle || 'Tesla Model S (White)',
      plate: user?.plate || 'KA-26-M-7788',
      rating: user?.rating || '4.95 ⭐',
      phone: user?.phone || '+91 98765 43210'
    });
  };

  const handleRejectRide = (request) => {
    if (!request) return;

    // Send reject ride event to rider via socket server
    rejectRide({
      rideId: request.id,
      riderId: request.riderId
    });

    setRideRequests(prev => prev.filter(r => r.id !== request.id));
  };

  const handleStartRide = () => {
    if (!activeRide) return;

    startRide({
      rideId: activeRide.id,
      riderId: activeRide.riderId
    });

    setActiveRide(prev => ({ ...prev, status: 'started' }));
  };

  const handleCompleteRide = () => {
    if (!activeRide) return;

    // Send complete ride event to rider via socket server
    completeRide({
      rideId: activeRide.id,
      riderId: activeRide.riderId
    });

    setEarnings(prev => ({
      ...prev,
      today: prev.today + activeRide.fare,
      week: prev.week + activeRide.fare,
    }));
    setActiveRide(null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[80vh] pb-8">
      {/* Control Panel */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <Card variant="bento" className="flex flex-col gap-6" glow>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-accent text-[10px] font-bold uppercase tracking-[0.3em] mb-1">// Console</p>
              <h2 className="text-xl font-heading font-extrabold uppercase tracking-tight text-white">Driver Panel</h2>
              <p className="text-xs text-text-secondary">Toggle online availability status</p>
            </div>
            {/* Elegant Status Toggler */}
            <button
              onClick={() => {
                setIsOnline(!isOnline);
                if (isOnline) {
                  setRideRequests([]);
                  setActiveRide(null);
                }
              }}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none ${isOnline ? 'bg-success' : 'bg-white/10'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${isOnline ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-elevated border border-white/8 rounded-xl p-4">
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Today's Take</p>
              <h4 className="text-xl font-heading font-bold text-white mt-1">₹{earnings.today.toFixed(2)}</h4>
            </div>
            <div className="bg-surface-elevated border border-white/8 rounded-xl p-4">
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Online Hours</p>
              <h4 className="text-xl font-heading font-bold text-white mt-1">{earnings.hours}h</h4>
            </div>
          </div>
        </Card>

        {/* Dynamic Action Window (Animate Request or Active Ride info) */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!isOnline && (
              <motion.div
                key="offline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]"
              >
                <FiClock className="text-4xl text-text-secondary/50 mb-3" />
                <h3 className="font-heading font-bold text-white">Currently Offline</h3>
                <p className="text-xs text-text-secondary mt-1">Switch status to Online to begin receiving booking dispatches.</p>
              </motion.div>
            )}

            {isOnline && rideRequests.length === 0 && !activeRide && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 border border-white/5 rounded-2xl bg-white/[0.01]"
              >
                <div className="relative flex h-12 w-12 items-center justify-center mb-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/20 opacity-75"></span>
                  <FiMap className="relative text-2xl text-success" />
                </div>
                <h3 className="font-heading font-bold text-white">Monitoring Feed</h3>
                <p className="text-xs text-text-secondary mt-1">Awaiting premium dispatcher matches nearby...</p>
              </motion.div>
            )}

            {rideRequests.length > 0 && !activeRide && (
              <motion.div
                key="requests-feed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 overflow-y-auto pr-2 pb-2 space-y-4 custom-scrollbar"
              >
                {rideRequests.map(request => (
                  <Card key={request.id} className="w-full border border-accent/20 bg-gradient-to-b from-surface-dark to-accent/5 flex flex-col justify-between p-6 rounded-2xl">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="inline-flex px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Dispatch Offer
                        </span>
                        <span className="text-[10px] text-text-secondary uppercase tracking-widest">{request.vehicleType}</span>
                      </div>
                      <h3 className="text-xl font-heading font-bold text-white mb-4">{request.riderName}</h3>
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="text-[10px] text-text-secondary uppercase">Pickup</p>
                          <p className="text-sm font-semibold text-white mt-0.5">{request.pickup}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-secondary uppercase">Destination</p>
                          <p className="text-sm font-semibold text-white mt-0.5">{request.drop}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-4 border-y border-white/5 my-4">
                      <div>
                        <p className="text-[10px] text-text-secondary uppercase">Estimated Fare</p>
                        <p className="text-xl font-heading font-bold text-success mt-0.5">₹{request.fare}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-text-secondary uppercase">Distance</p>
                        <p className="text-base font-semibold text-white mt-0.5">{request.distance}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-2">
                      <Button variant="secondary" onClick={() => handleRejectRide(request)} className="flex-1 py-3 text-xs">
                        Decline
                      </Button>
                      <Button variant="accent" onClick={() => handleAcceptRide(request)} className="flex-1 py-3 text-xs font-semibold">
                        Accept Ride
                      </Button>
                    </div>
                  </Card>
                ))}
              </motion.div>
            )}

            {activeRide && (
              <motion.div
                key="active"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0"
              >
                <Card className="h-full border border-success/20 bg-gradient-to-b from-surface-dark to-emerald-950/20 flex flex-col justify-between">
                  <div>
                    <span className="inline-flex px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                      Active Charter
                    </span>
                    <h3 className="text-2xl font-heading font-bold text-white mb-2">{activeRide.riderName}</h3>
                    <p className="text-xs text-text-secondary">En route to destination.</p>
                    
                    <div className="flex flex-col gap-3 mt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
                        <p className="text-sm font-semibold text-white">{activeRide.pickup}</p>
                      </div>
                      <div className="w-0.5 h-4 bg-white/20 ml-1"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded bg-error"></div>
                        <p className="text-sm font-semibold text-white">{activeRide.drop}</p>
                      </div>
                    </div>
                  </div>

                  {activeRide.status !== 'started' ? (
                    <Button 
                      variant="primary" 
                      onClick={handleStartRide} 
                      className="w-full py-4 font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white"
                    >
                      <FiCheckCircle /> Start Ride
                    </Button>
                  ) : (
                    <Button 
                      variant="primary" 
                      onClick={handleCompleteRide} 
                      className="w-full py-4 font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white"
                    >
                      <FiCheckCircle /> Complete Charter
                    </Button>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Map Screen */}
      <div className="w-full md:w-2/3 h-full">
        <MapComponent 
          pickup={activeRide ? activeRide.pickupCoords : (rideRequests.length > 0 ? rideRequests[0].pickupCoords : null)} 
          drop={activeRide ? activeRide.dropCoords : (rideRequests.length > 0 ? rideRequests[0].dropCoords : null)} 
        />
      </div>
    </div>
  );
};

export default DriverDashboard;
