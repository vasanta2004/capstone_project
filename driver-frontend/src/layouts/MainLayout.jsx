import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, loginSuccess } from '../redux/slices/authSlice';
import { updateProfileAPI } from '../services/api';

const MainLayout = () => {
  const { isAuthenticated, role, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartEdit = () => {
    setEditName(user?.name || user?.driverName || '');
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setEditError('');
    setIsEditing(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setEditError('');
    try {
      const payload = {
        email: editEmail,
        phone: editPhone
      };
      if (role === 'driver') {
        payload.driverName = editName;
      } else {
        payload.name = editName;
      }
      
      const res = await updateProfileAPI(payload);
      dispatch(loginSuccess(res.data));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setEditError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-text-primary font-sans relative overflow-hidden dot-grid">
      <div className="fixed top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-white/5 rounded-full blur-[120px] pointer-events-none animate-pulse-ring" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center animate-fade-in-up">
        <nav className={`w-full max-w-5xl rounded-full px-6 py-3 flex justify-between items-center transition-all duration-500 border ${scrolled ? 'glass shadow-2xl border-white/10' : 'bg-transparent border-transparent'}`}>
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-black font-heading font-extrabold text-lg">R</span>
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                RideX
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1 text-[12px] font-medium tracking-wide">
              <Link to="/rider" className="px-4 py-2 text-text-secondary hover:text-white transition-colors rounded-full hover:bg-white/5">Ride</Link>
              <Link to="/driver" className="px-4 py-2 text-text-secondary hover:text-white transition-colors rounded-full hover:bg-white/5">Drive</Link>
              <Link to="/admin" className="px-4 py-2 text-text-secondary hover:text-white transition-colors rounded-full hover:bg-white/5">Admin</Link>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                {role === 'admin' && (
                  <Link to="/admin" className="hidden sm:block px-4 py-2 text-[11px] font-bold tracking-widest text-black bg-white rounded-full hover:bg-gray-200 transition-colors">
                    Oversight
                  </Link>
                )}
                {role === 'driver' && (
                  <Link to="/driver" className="hidden sm:block px-4 py-2 text-[11px] font-bold tracking-widest text-black bg-white rounded-full hover:bg-gray-200 transition-colors">
                    Driver Panel
                  </Link>
                )}
                {role === 'rider' && (
                  <Link to="/rider" className="hidden sm:block px-4 py-2 text-[11px] font-bold tracking-widest text-black bg-white rounded-full hover:bg-gray-200 transition-colors">
                    Dashboard
                  </Link>
                )}
                <div className="relative">
                  <div 
                    className="flex items-center gap-3 cursor-pointer select-none hover:opacity-80 transition-opacity bg-white/5 rounded-full pr-4 p-1 border border-white/10"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border border-white/20 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-xs uppercase">
                        {(user?.name || user?.driverName || 'U').split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-white hidden sm:block">
                      {user?.name || user?.driverName || 'User'}
                    </span>
                  </div>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-4 w-80 glass-dark rounded-3xl shadow-2xl p-6 z-50 text-text-primary border border-white/10 animate-fade-in-up">
                      {!isEditing ? (
                        <>
                          <div className="flex flex-col items-center gap-4 border-b border-white/10 pb-6 mb-6">
                            {user?.profileImage ? (
                              <img 
                                src={user.profileImage} 
                                alt="Profile" 
                                className="w-20 h-20 rounded-full border-2 border-white object-cover shadow-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center font-heading font-extrabold text-2xl uppercase shadow-lg">
                                {(user?.name || user?.driverName || 'U').split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                            )}
                            <div className="text-center">
                              <h4 className="font-extrabold text-white text-lg">{user?.name || user?.driverName || 'User'}</h4>
                              <span className="inline-block bg-white/10 text-gray-300 text-[10px] font-bold tracking-widest px-3 py-1 rounded-full mt-2 border border-white/5 uppercase">
                                {role}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-4 text-sm text-gray-300">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Email</span>
                              <span className="font-medium text-white truncate block">{user?.email || 'N/A'}</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Phone</span>
                              <span className="font-medium text-white block">{user?.phone || 'N/A'}</span>
                            </div>
                            
                            {role === 'driver' && user?.vehicleDetails && (
                              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Vehicle Details</span>
                                <div className="flex flex-col gap-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-xs">Model:</span>
                                    <span className="font-semibold text-white text-xs">{user.vehicleDetails.color} {user.vehicleDetails.make} {user.vehicleDetails.model}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-xs">Plate:</span>
                                    <span className="font-bold text-white bg-black/50 px-2 py-0.5 rounded text-xs border border-white/10 tracking-widest">{user.vehicleDetails.licensePlate}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-3 mt-6">
                            <button 
                              onClick={handleStartEdit}
                              className="w-full py-3 bg-white text-black text-xs font-bold tracking-widest rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              EDIT PROFILE
                            </button>
                            <button 
                              onClick={() => {
                                setShowProfileDropdown(false);
                                handleLogout();
                              }}
                              className="w-full py-3 border border-white/10 text-xs font-bold rounded-xl text-white hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              LOG OUT
                            </button>
                          </div>
                        </>
                      ) : (
                        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                          <h3 className="font-bold text-white text-base mb-2">Edit Profile</h3>
                          
                          {editError && (
                            <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center font-medium">
                              {editError}
                            </div>
                          )}

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Full Name</label>
                            <input 
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              required
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Email Address</label>
                            <input 
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              required
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Phone Number</label>
                            <input 
                              type="text"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              required
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                            />
                          </div>

                          <div className="flex gap-3 mt-4">
                            <button 
                              type="button"
                              onClick={() => setIsEditing(false)}
                              disabled={isUpdating}
                              className="flex-1 py-3 border border-white/10 text-xs font-bold tracking-widest rounded-xl text-white hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              CANCEL
                            </button>
                            <button 
                              type="submit"
                              disabled={isUpdating}
                              className="flex-1 py-3 bg-white text-black text-xs font-bold tracking-widest rounded-xl hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isUpdating ? 'SAVING...' : 'SAVE'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-[12px] font-semibold text-text-secondary hover:text-white transition-colors">Log In</Link>
                <Link to="/register" className="px-6 py-2.5 bg-white text-black text-[12px] font-bold rounded-full hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className={`flex-1 relative z-10 w-full pt-32 pb-10 ${isLandingPage ? 'p-0 max-w-none pt-0 pb-0' : 'max-w-7xl mx-auto px-4 md:px-8'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
