import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useSocket from '../hooks/useSocket';
import MapComponent from '../components/MapComponent';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';

const HUBLI_STREETS = [
  { name: 'Hubli Junction (Railway Station)', coords: [75.1489, 15.3506] },
  { name: 'Kittur Rani Chennamma Circle', coords: [75.1306, 15.3500] },
  { name: 'Gokul Road', coords: [75.0965, 15.3524] },
  { name: 'Vidyanagar', coords: [75.1299, 15.3711] },
  { name: 'Keshwapur', coords: [75.1479, 15.3611] },
  { name: 'Unkal Lake', coords: [75.1061, 15.3780] },
  { name: 'Hubli Airport', coords: [75.0847, 15.3617] }
];

const RiderDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { requestRide, confirmRide, declineDriver, socket } = useSocket();

  const [pickup, setPickup] = useState('SSS Hubballi Junction, Hubli, Karnataka');
  const [drop, setDrop] = useState('Kittur Rani Chennamma Circle, Hubli, Karnataka');
  
  // Autocomplete Suggestions State
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDrop, setLoadingDrop] = useState(false);

  const [searching, setSearching] = useState(false);
  const [rideRequested, setRideRequested] = useState(false);
  const [matchedDriver, setMatchedDriver] = useState(null);
  const [selectedType, setSelectedType] = useState('RideX');
  const [rideStatus, setRideStatus] = useState('none');

  // Coordinates state
  const [pickupCoords, setPickupCoords] = useState([75.1489, 15.3506]);
  const [dropCoords, setDropCoords] = useState([75.1306, 15.3500]);

  // Handle real-time socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('ride-accepted', (data) => {
      console.log('Ride accepted by driver:', data);
      setSearching(false);
      setMatchedDriver(data.driver);
      setRideStatus('accepted');
    });

    socket.on('ride-started', (data) => {
      console.log('Ride started:', data);
      setRideStatus('started');
    });

    socket.on('ride-rejected', (data) => {
      console.log('Ride rejected:', data);
      setSearching(false);
      setRideRequested(false);
      setMatchedDriver(null);
      setRideStatus('none');
      alert(data.message || 'No drivers accepted your booking request.');
    });

    socket.on('ride-completed', (data) => {
      console.log('Ride completed successfully:', data);
      alert('You have arrived at your destination! Thank you for riding with RideX.');
      setSearching(false);
      setRideRequested(false);
      setMatchedDriver(null);
      setRideStatus('completed');
    });

    return () => {
      socket.off('ride-accepted');
      socket.off('ride-started');
      socket.off('ride-rejected');
      socket.off('ride-completed');
    };
  }, [socket]);

  // Ride types configuration (with base prices)
  const rideTypes = [
    { id: 'RideX', name: 'RideX', base: 60, eta: '3 mins', desc: 'Affordable everyday rides', icon: '🚗' },
    { id: 'Comfort', name: 'Comfort', base: 110, eta: '5 mins', desc: 'Newer sedans with top drivers', icon: '🚙' },
    { id: 'RideBlack', name: 'RideBlack', base: 190, eta: '2 mins', desc: 'Premium luxury VIP travel', icon: '🖤' }
  ];

  // Dynamic Distance & Price Calculation based on coordinates
  const getDistance = (c1, c2) => {
    const dx = c1[0] - c2[0];
    const dy = c1[1] - c2[1];
    return Math.sqrt(dx * dx + dy * dy) * 111; // Approximate km distance
  };

  const distance = getDistance(pickupCoords, dropCoords);
  
  const calculatePrice = (base) => {
    return Math.round(base + distance * 14);
  };

  // Real-time Nominatim Geocoding Autocomplete Search
  const fetchPickupSuggestions = async (query) => {
    setPickup(query);
    if (query.trim().length < 3) {
      setPickupSuggestions([]);
      return;
    }
    setLoadingPickup(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setPickupSuggestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPickup(false);
    }
  };

  const fetchDropSuggestions = async (query) => {
    setDrop(query);
    if (query.trim().length < 3) {
      setDropSuggestions([]);
      return;
    }
    setLoadingDrop(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setDropSuggestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDrop(false);
    }
  };

  const handleSelectPickup = (item) => {
    setPickup(item.display_name);
    setPickupCoords([parseFloat(item.lon), parseFloat(item.lat)]);
    setPickupSuggestions([]);
  };

  const handleSelectDrop = (item) => {
    setDrop(item.display_name);
    setDropCoords([parseFloat(item.lon), parseFloat(item.lat)]);
    setDropSuggestions([]);
  };

  const handleBookRide = (e) => {
    e.preventDefault();
    setSearching(true);
    setRideRequested(true);
    setMatchedDriver(null);
    setRideStatus('searching');

    const calculatedFare = calculatePrice(rideTypes.find(t => t.id === selectedType).base);

    // Dispatch the actual ride request to the socket server
    requestRide({
      riderId: user?._id || user?.id || 'guest_rider',
      riderName: user?.name || 'Rider Passenger',
      pickup,
      drop,
      pickupCoords,
      dropCoords,
      fare: calculatedFare,
      distance: distance.toFixed(2),
      vehicleType: selectedType
    });
  };

  const handleCancelRide = () => {
    setSearching(false);
    setRideRequested(false);
    setMatchedDriver(null);
    setRideStatus('none');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[80vh]">
      {/* Booking Panel */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full"
        >
          <Card variant="bento" className="h-full flex flex-col justify-between overflow-y-auto max-h-[80vh] p-6" glow>
            <AnimatePresence mode="wait">
              {/* STATE 1: RIDE CONFIRMED & DRIVER MATCHED */}
              {matchedDriver && (
                <motion.div
                  key="matched"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-5 py-2"
                >
                  <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2.5 rounded-full text-xs font-semibold self-start border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    {rideStatus === 'accepted' ? 'Ride Confirmed • Arriving in 3 mins' : 'Ride In Progress • Heading to destination'}
                  </div>

                  {/* Progress Tracker */}
                  <div className="flex items-center justify-between mt-2 mb-4 px-2">
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${rideStatus === 'accepted' || rideStatus === 'started' ? 'bg-accent text-black shadow-[0_0_10px_rgba(212,255,0,0.5)]' : 'bg-surface-elevated text-gray-400'}`}>✓</div>
                      <span className={`text-[10px] font-bold uppercase ${rideStatus === 'accepted' || rideStatus === 'started' ? 'text-white' : 'text-gray-500'}`}>Accepted</span>
                    </div>
                    <div className={`flex-1 h-1 mx-2 rounded-full ${rideStatus === 'started' ? 'bg-accent' : 'bg-surface-elevated'}`}></div>
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${rideStatus === 'started' ? 'bg-accent text-black shadow-[0_0_10px_rgba(212,255,0,0.5)]' : 'bg-surface-elevated text-gray-400'}`}>{rideStatus === 'started' ? '✓' : '2'}</div>
                      <span className={`text-[10px] font-bold uppercase ${rideStatus === 'started' ? 'text-white' : 'text-gray-500'}`}>In Progress</span>
                    </div>
                    <div className="flex-1 h-1 mx-2 rounded-full bg-surface-elevated"></div>
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-surface-elevated text-gray-400">3</div>
                      <span className="text-[10px] font-bold uppercase text-gray-500">Completed</span>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-heading font-extrabold text-white">Meet your driver</h2>

                  {/* Driver luxury card */}
                  <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg text-white">{matchedDriver.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{matchedDriver.vehicle}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-white/10 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                          {matchedDriver.rating}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-3">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">License Plate</span>
                        <span className="inline-block bg-yellow-400 text-black border-2 border-black font-mono font-extrabold px-3 py-0.5 rounded text-sm shadow-sm tracking-wide mt-1">
                          {matchedDriver.plate}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Contact</span>
                        <a href={`tel:${matchedDriver.phone}`} className="text-xs font-semibold text-accent hover:underline mt-1 block">
                          {matchedDriver.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Trip details summary */}
                  <div className="text-xs text-gray-400 flex flex-col gap-2 px-1">
                    <div className="flex justify-between">
                      <span>Pickup:</span>
                      <span className="font-medium text-white truncate max-w-[200px]">{pickup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dropoff:</span>
                      <span className="font-medium text-white truncate max-w-[200px]">{drop}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fare Paid:</span>
                      <span className="font-bold text-white">₹{calculatePrice(rideTypes.find(t => t.id === selectedType).base)}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCancelRide} 
                    fullWidth 
                    variant="danger" 
                    className="py-3.5 mt-2"
                  >
                    Cancel Ride
                  </Button>
                </motion.div>
              )}

              {/* STATE 2: SEARCHING & RADAR MATCHING */}
              {searching && !matchedDriver && (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 gap-6 text-center"
                >
                  {/* Radar Wave Animation */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-accent/10 animate-ping duration-1000"></div>
                    <div className="absolute w-20 h-20 rounded-full bg-accent/5 animate-pulse"></div>
                    <div className="w-12 h-12 bg-accent flex items-center justify-center shadow-[0_0_30px_rgba(212,255,0,0.3)]">
                      <svg className="w-6 h-6 text-black animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-heading font-extrabold text-white">Finding your ride...</h3>
                    <p className="text-xs text-gray-400 px-6">
                      Matching your request with nearest available active {selectedType} drivers in the area
                    </p>
                  </div>

                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-4">
                    <div className="bg-accent h-full rounded-full animate-[loading_3.5s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                  </div>

                  <Button 
                    onClick={handleCancelRide} 
                    fullWidth 
                    variant="secondary" 
                    className="py-3 mt-6"
                  >
                    Cancel Request
                  </Button>
                </motion.div>
              )}

              {/* STATE 3: INPUT SEARCH & VEHICLE SELECT */}
              {!rideRequested && (
                <motion.div
                  key="booking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-5"
                >
                  <h2 className="text-2xl font-heading font-extrabold uppercase tracking-tight text-white">Where to?</h2>
                  <form onSubmit={handleBookRide} className="flex flex-col gap-4">
                    <div className="relative">
                      <div className="absolute left-4 top-10 w-2 h-2 rounded-full bg-success"></div>
                      <div className="absolute left-4.5 top-14 bottom-4 w-0.5 bg-white/20"></div>
                      <div className="absolute left-4 bottom-5 w-2 h-2 rounded-none bg-error"></div>
                      
                      <div className="pl-10 flex flex-col gap-5">
                        {/* Pickup Autocomplete Search */}
                        <div className="relative">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Pickup Location</label>
                          <Input 
                            placeholder="Search pickup city or address..." 
                            value={pickup}
                            onChange={(e) => fetchPickupSuggestions(e.target.value)}
                            required
                          />
                          {loadingPickup && (
                            <div className="absolute right-3 bottom-3 text-[10px] text-gray-400">Searching...</div>
                          )}
                          {pickupSuggestions.length > 0 && (
                            <ul className="absolute left-0 right-0 mt-1.5 bg-surface-dark border border-white/10 shadow-2xl rounded-xl z-20 max-h-48 overflow-y-auto">
                              {pickupSuggestions.map((item, index) => (
                                <li 
                                  key={index}
                                  onClick={() => handleSelectPickup(item)}
                                  className="px-4 py-2.5 text-[11px] text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer border-b border-white/5 last:border-b-0 transition-colors font-medium"
                                >
                                  📍 {item.display_name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Dropoff Autocomplete Search */}
                        <div className="relative">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Dropoff Location</label>
                          <Input 
                            placeholder="Search destination city or address..." 
                            value={drop}
                            onChange={(e) => fetchDropSuggestions(e.target.value)}
                            required
                          />
                          {loadingDrop && (
                            <div className="absolute right-3 bottom-3 text-[10px] text-gray-400">Searching...</div>
                          )}
                          {dropSuggestions.length > 0 && (
                            <ul className="absolute left-0 right-0 mt-1.5 bg-surface-dark border border-white/10 shadow-2xl rounded-xl z-20 max-h-48 overflow-y-auto">
                              {dropSuggestions.map((item, index) => (
                                <li 
                                  key={index}
                                  onClick={() => handleSelectDrop(item)}
                                  className="px-4 py-2.5 text-[11px] text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer border-b border-white/5 last:border-b-0 transition-colors font-medium"
                                >
                                  🏁 {item.display_name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Select Hubli Streets */}
                    <div className="mt-4 flex flex-col gap-2">
                      <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Quick Select (Hubli Streets)</h3>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {HUBLI_STREETS.map((street) => (
                          <div 
                            key={street.name}
                            className="flex items-center justify-between gap-1.5 p-2 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl text-[11px] text-gray-300 transition-all"
                          >
                            <span className="font-semibold truncate" title={street.name}>{street.name}</span>
                            <div className="flex gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setPickup(street.name);
                                  setPickupCoords(street.coords);
                                }}
                                title="Set as Pickup"
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 transition-colors text-[10px]"
                              >
                                📍
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDrop(street.name);
                                  setDropCoords(street.coords);
                                }}
                                title="Set as Dropoff"
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500/30 text-red-400 transition-colors text-[10px]"
                              >
                                🏁
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ride Options Selection Grid (Uber Style) */}
                    <div className="mt-4 flex flex-col gap-2.5">
                      <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Suggested Rides</h3>
                      <div className="flex flex-col gap-2">
                        {rideTypes.map((type) => {
                          const isSelected = selectedType === type.id;
                          const calculatedPrice = calculatePrice(type.base);
                          
                          return (
                            <div
                              key={type.id}
                              onClick={() => setSelectedType(type.id)}
                              className={`flex items-center justify-between p-3.5 border cursor-pointer transition-all duration-300 ${
                                isSelected 
                                  ? 'border-accent bg-accent/10 text-white neon-border' 
                                  : 'border-white/10 bg-surface-elevated hover:border-white/20 text-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{type.icon}</span>
                                <div>
                                  <div className="font-bold text-sm flex items-center gap-1.5">
                                    {type.name}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                      isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'
                                    }`}>
                                      {type.eta}
                                    </span>
                                  </div>
                                  <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {type.desc}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-sm">₹{calculatedPrice}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        type="submit" 
                        fullWidth 
                        variant="primary" 
                        disabled={searching || !pickup || !drop}
                        className="py-4 font-bold"
                      >
                        Request {rideTypes.find(t => t.id === selectedType).name}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>

      {/* Map View */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full md:w-2/3 h-full"
      >
        <MapComponent 
          pickup={pickupCoords} 
          drop={dropCoords} 
          matchedDriver={matchedDriver}
        />
      </motion.div>
    </div>
  );
};

export default RiderDashboard;
