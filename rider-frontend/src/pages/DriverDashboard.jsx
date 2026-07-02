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
  const { acceptRide, rejectRide, completeRide, socket } = useSocket();

  const [isOnline, setIsOnline] = useState(false);
  const [rideRequest, setRideRequest] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [earnings, setEarnings] = useState({
    today: 184.50,
    week: 924.80,
    hours: 24
  });

  // Listen for real-time dispatches from riders
  useEffect(() => {
    if (!socket || !isOnline) {
      setRideRequest(null);
      setAwaitingConfirmation(false);
      return;
    }

    socket.on('ride-dispatch', (data) => {
      console.log('Received dispatch offer:', data);
      setRideRequest(data);
    });

    socket.on('ride-withdrawn', (data) => {
      console.log('Ride withdrawn by system:', data);
      if (rideRequest && rideRequest.id === data.rideId && !awaitingConfirmation) {
        setRideRequest(null);
      }
    });

    socket.on('ride-confirmed-by-rider', (data) => {
      console.log('Ride confirmed by rider:', data);
      setAwaitingConfirmation(false);
      setActiveRide(data.ride);
      setRideRequest(null);
    });

    socket.on('ride-declined-by-rider', (data) => {
      console.log('Ride declined by rider:', data);
      setAwaitingConfirmation(false);
      setRideRequest(null);
      alert(data.message || 'The passenger has declined your acceptance.');
    });

    return () => {
      socket.off('ride-dispatch');
      socket.off('ride-withdrawn');
      socket.off('ride-confirmed-by-rider');
      socket.off('ride-declined-by-rider');
    };
  }, [socket, isOnline, rideRequest, awaitingConfirmation]);

  const handleAcceptRide = () => {
    if (!rideRequest) return;

    // Send accept ride event to rider via socket server
    acceptRide({
      rideId: rideRequest.id,
      riderId: rideRequest.riderId,
      driverId: user?._id || user?.id || 'guest_driver',
      driverName: user?.name || 'Alexander Sterling',
      vehicle: user?.vehicle || 'Tesla Model S (White)',
      plate: user?.plate || 'KA-26-M-7788',
      rating: user?.rating || '4.95 ⭐',
      phone: user?.phone || '+91 98765 43210'
    });

    setAwaitingConfirmation(true);
  };

  const handleRejectRide = () => {
    if (!rideRequest) return;

    // Send reject ride event to rider via socket server
    rejectRide({
      rideId: rideRequest.id,
      riderId: rideRequest.riderId
    });

    setRideRequest(null);
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
                  setRideRequest(null);
                  setActiveRide(null);
                  setAwaitingConfirmation(false);
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

            {isOnline && !rideRequest && !activeRide && !awaitingConfirmation && (
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

            {isOnline && awaitingConfirmation && !activeRide && (
              <motion.div
                key="awaiting-confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0"
              >
                <Card className="h-full border border-yellow-500/20 bg-gradient-to-b from-surface-dark to-yellow-950/20 flex flex-col justify-between p-6">
                  <div>
                    <span className="inline-flex px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 animate-pulse">
                      Awaiting Rider Confirm
                    </span>
                    <h3 className="text-2xl font-heading font-bold text-white mb-2">{rideRequest?.riderName}</h3>
                    <p className="text-xs text-text-secondary font-medium">Waiting for passenger to accept your offer...</p>
                    
                    <div className="flex flex-col gap-3 mt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
                        <p className="text-sm font-semibold text-white truncate max-w-[220px]">{rideRequest?.pickup}</p>
                      </div>
                      <div className="w-0.5 h-4 bg-white/20 ml-1"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded bg-error"></div>
                        <p className="text-sm font-semibold text-white truncate max-w-[220px]">{rideRequest?.drop}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4">
                    <svg className="w-8 h-8 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-[11px] text-gray-400 mt-2 font-medium">Connecting match...</span>
                  </div>
                </Card>
              </motion.div>
            )}

            {rideRequest && !awaitingConfirmation && (
              <motion.div
                key="request"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0"
              >
                <Card className="h-full border border-accent/20 bg-gradient-to-b from-surface-dark to-accent/5 flex flex-col justify-between">
                  <div>
                    <span className="inline-flex px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                      Dispatch Offer
                    </span>
                    <h3 className="text-2xl font-heading font-bold text-white mb-4">{rideRequest.riderName}</h3>
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-[10px] text-text-secondary uppercase">Pickup</p>
                        <p className="text-sm font-semibold text-white mt-0.5">{rideRequest.pickup}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-secondary uppercase">Destination</p>
                        <p className="text-sm font-semibold text-white mt-0.5">{rideRequest.drop}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-4 border-y border-white/5 my-4">
                    <div>
                      <p className="text-[10px] text-text-secondary uppercase">Estimated Fare</p>
                      <p className="text-2xl font-heading font-bold text-success mt-0.5">₹{rideRequest.fare}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-text-secondary uppercase">Distance</p>
                      <p className="text-lg font-semibold text-white mt-0.5">{rideRequest.distance}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="secondary" onClick={handleRejectRide} className="flex-1 py-3 text-sm">
                      Decline
                    </Button>
                    <Button variant="accent" onClick={handleAcceptRide} className="flex-1 py-3 text-sm font-semibold">
                      Accept Ride
                    </Button>
                  </div>
                </Card>
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

                  <Button 
                    variant="primary" 
                    onClick={handleCompleteRide} 
                    className="w-full py-4 font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white"
                  >
                    <FiCheckCircle /> Complete Charter
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Map Screen */}
      <div className="w-full md:w-2/3 h-full">
        <MapComponent 
          pickup={activeRide ? activeRide.pickupCoords : (rideRequest ? rideRequest.pickupCoords : null)} 
          drop={activeRide ? activeRide.dropCoords : (rideRequest ? rideRequest.dropCoords : null)} 
        />
      </div>
    </div>
  );
};

export default DriverDashboard;
