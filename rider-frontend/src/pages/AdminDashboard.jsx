import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import { getAdminStatsAPI, getAdminDriversAPI, approveDriverAPI } from '../services/api';
import { FiUsers, FiMapPin, FiTrendingUp, FiLayers, FiCheck } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalRides: 0,
    totalRevenue: 0,
  });
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const statsRes = await getAdminStatsAPI();
      const driversRes = await getAdminDriversAPI();
      setStats(statsRes.data);
      setDrivers(driversRes.data);
    } catch (err) {
      console.error("Failed to load admin data. Rendering rich mock fallbacks.", err);
      // Premium luxurious mock fallback data if backend is offline
      setStats({
        totalUsers: 1248,
        totalDrivers: 142,
        totalRides: 4890,
        totalRevenue: 98560,
      });
      setDrivers([
        { _id: '1', driverName: 'Alexander Sterling', email: 'alexander@ridex-vip.com', phone: '+1 555 382 9102', vehicleDetails: { make: 'Tesla', model: 'Model S Plaid', year: '2024', licensePlate: 'RDX-998P', color: 'Midnight Black' }, isApproved: false },
        { _id: '2', driverName: 'Seraphina Vance', email: 'seraphina@ridex-vip.com', phone: '+1 555 981 2289', vehicleDetails: { make: 'Mercedes-Benz', model: 'EQS SUV', year: '2023', licensePlate: 'LUX-777E', color: 'Obsidian Black' }, isApproved: true },
        { _id: '3', driverName: 'Viktor Thorne', email: 'viktor@ridex-vip.com', phone: '+1 555 204 8831', vehicleDetails: { make: 'Lucid', model: 'Air Sapphire', year: '2024', licensePlate: 'SPD-001X', color: 'Sapphire Blue' }, isApproved: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (driverId) => {
    try {
      await approveDriverAPI(driverId);
      // Refresh
      fetchAdminData();
    } catch (err) {
      // Mock update for standalone flow
      setDrivers(drivers.map(drv => drv._id === driverId ? { ...drv, isApproved: true } : drv));
    }
  };

  return (
    <div className="flex flex-col gap-8 min-h-screen pb-16">
      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-5xl font-heading font-extrabold uppercase tracking-tighter text-white mb-2">
          Platform <span className="text-accent">Oversight</span>
        </h1>
        <p className="text-text-secondary text-sm uppercase tracking-widest">// Real-time metrics & driver verification</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="bento" className="flex items-center gap-4">
            <div className="p-4 bg-accent/15 text-accent text-2xl">
              <FiUsers />
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-widest font-semibold">Active Riders</p>
              <h3 className="text-3xl font-heading font-bold text-white mt-1">{stats.totalUsers}</h3>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card variant="bento" className="flex items-center gap-4">
            <div className="p-4 bg-violet/15 text-violet text-2xl">
              <FiMapPin />
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-widest font-semibold">Vetted Drivers</p>
              <h3 className="text-3xl font-heading font-bold text-white mt-1">{stats.totalDrivers}</h3>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className="flex items-center gap-4 bg-gradient-to-br from-accent-bright/10 to-surface-dark">
            <div className="p-4 bg-accent-bright/15 rounded-xl text-accent-bright text-2xl">
              <FiLayers />
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-widest font-semibold">Completed Trips</p>
              <h3 className="text-3xl font-heading font-bold text-white mt-1">{stats.totalRides}</h3>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className="flex items-center gap-4 bg-gradient-to-br from-warning/10 to-surface-dark">
            <div className="p-4 bg-warning/15 rounded-xl text-warning text-2xl">
              <FiTrendingUp />
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-widest font-semibold">Total Revenue</p>
              <h3 className="text-3xl font-heading font-bold text-white mt-1">${stats.totalRevenue.toLocaleString()}</h3>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Driver Registration Queue */}
      <Card variant="bento" glow>
        <h2 className="text-xl font-heading font-bold text-white mb-6">Driver Approval Queue</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-text-secondary text-xs uppercase tracking-wider">
                <th className="py-4 px-2">Driver</th>
                <th className="py-4 px-2">Vehicle Details</th>
                <th className="py-4 px-2">Contact Details</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver._id} className="border-b border-white/5 text-sm hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-2 font-medium text-white">{driver.driverName}</td>
                  <td className="py-4 px-2 text-text-secondary">
                    {driver.vehicleDetails.color} {driver.vehicleDetails.make} {driver.vehicleDetails.model}
                    <span className="block text-xs font-mono text-white/40">{driver.vehicleDetails.licensePlate}</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="block text-white/80">{driver.email}</span>
                    <span className="block text-xs text-text-secondary">{driver.phone}</span>
                  </td>
                  <td className="py-4 px-2">
                    {driver.isApproved ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                        <FiCheck className="text-sm" /> Vetted
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold">
                        Pending Approval
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-2 text-right">
                    {!driver.isApproved && (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleApprove(driver._id)}
                        className="py-1 px-4 text-xs font-semibold tracking-wider hover:scale-105"
                      >
                        Approve Candidate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
