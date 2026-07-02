const socketIo = require('socket.io');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const initializeSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // Store active rides dynamically in memory for matching state coordination
    const activeRides = new Map();

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        // 1. Join Rider Room
        socket.on('join-rider', (riderId) => {
            console.log(`Rider joined room: ${riderId}`);
            socket.join(riderId);
        });

        // 2. Join Driver Room
        socket.on('join-driver', (driverId) => {
            console.log(`Driver joined room: ${driverId}`);
            socket.join('drivers'); // Joins global driver fleet broadcast channel
            socket.join(driverId);  // Joins specific driver channel
        });

        // 3. Rider requests a cab
        socket.on('request-ride', async (rideDetails) => {
            console.log(`Ride requested by ${rideDetails.riderName}:`, rideDetails);
            
            const rideId = `ride_${Date.now()}`;
            const rideRequest = {
                ...rideDetails,
                id: rideId,
                status: 'searching'
            };

            activeRides.set(rideId, rideRequest);

            // Dispatch trip details to ALL online drivers
            io.to('drivers').emit('ride-dispatch', rideRequest);

            // Fetch user info from database and send notifications
            if (rideDetails.riderId && rideDetails.riderId !== 'guest_rider') {
                try {
                    const user = await User.findById(rideDetails.riderId);
                    if (user) {
                        // Send Email Notification
                        if (user.email) {
                            sendEmail({
                                email: user.email,
                                subject: 'RideX: Your Booking is Placed',
                                message: `Hello ${user.name},\n\nWe have received your RideX booking request!\n\nDetails:\nPickup: ${rideDetails.pickup}\nDropoff: ${rideDetails.drop}\nFare Estimate: ₹${rideDetails.fare}\nDistance: ${rideDetails.distance} km\n\nWe are matching you with nearby drivers. You will receive a request to confirm once a driver accepts your ride.\n\nBest regards,\nRideX Team`
                            }).catch(err => console.error(`Error sending email to ${user.email}:`, err.message));
                        }
                        
                        // Print Simulated SMS
                        if (user.phone) {
                            console.log(`\n--- SIMULATED SMS SENT ---`);
                            console.log(`To: ${user.phone}`);
                            console.log(`Message: RideX Alert: Booking requested from ${rideDetails.pickup} to ${rideDetails.drop}. Fare: Rs.${rideDetails.fare}. Waiting for driver acceptance and your final confirmation.`);
                            console.log(`---------------------------\n`);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user for booking notifications:', error.message);
                }
            }

            // --- INSTANT DEMO MATCHING ---
            // The user wants to bypass "Finding your ride..." entirely.
            // We will instantly assign a mock driver and accept the ride.
            setTimeout(() => {
                const ride = activeRides.get(rideId);
                if (ride && ride.status === 'searching') {
                    console.log(`[Instant Demo] Auto-simulating driver acceptance for ride ${rideId}`);
                    
                    const mockDriver = {
                        driverId: 'demo_driver_999',
                        driverName: 'Ramesh (Demo Driver)',
                        vehicle: ride.vehicleType === 'RideBlack' ? 'Mercedes S-Class' : 'Toyota Innova (White)',
                        plate: 'KA 25 M 7890',
                        rating: '4.9',
                        phone: '+91 98765 43210'
                    };
                    
                    ride.status = 'accepted';
                    ride.driver = mockDriver;
                    activeRides.set(rideId, ride);

                    // Notify specific Rider room that driver is matched and confirmed instantly
                    socket.emit('ride-accepted', {
                        rideId,
                        driver: mockDriver,
                        pickupCoords: ride.pickupCoords,
                        dropCoords: ride.dropCoords
                    });

                    // Notify all other drivers that the ride is withdrawn/taken
                    io.to('drivers').emit('ride-withdrawn', { rideId });
                }
            }, 500); // 500ms delay just for a tiny realistic pause, practically instant.
            // -----------------------------
        });

        // 4. Driver accepts the cab (Fast-Track: First to accept gets the ride instantly)
        socket.on('accept-ride', async (data) => {
            const { rideId, driverId, driverName, vehicle, plate, rating, phone } = data;
            console.log(`Ride ${rideId} accepted directly by driver ${driverName} (${driverId})`);

            const ride = activeRides.get(rideId);
            // Only allow acceptance if the ride is still searching (first-come, first-serve)
            if (ride && ride.status === 'searching') {
                // Change state directly to accepted, bypassing the proposed/pending state
                ride.status = 'accepted';
                ride.driver = { driverId, driverName, vehicle, plate, rating, phone };
                activeRides.set(rideId, ride);

                // Notify specific Rider room that driver is matched and confirmed instantly
                io.to(ride.riderId).emit('ride-accepted', {
                    rideId,
                    driver: ride.driver,
                    pickupCoords: ride.pickupCoords,
                    dropCoords: ride.dropCoords
                });

                // Notify this specific Driver that they successfully claimed the ride
                socket.emit('ride-confirmed-by-rider', {
                    rideId,
                    ride
                });

                // Notify all OTHER drivers that the ride is withdrawn/taken
                socket.broadcast.to('drivers').emit('ride-withdrawn', { rideId });

                // Send email confirmation
                if (ride.riderId && ride.riderId !== 'guest_rider') {
                    try {
                        const user = await User.findById(ride.riderId);
                        if (user) {
                            if (user.email) {
                                sendEmail({
                                    email: user.email,
                                    subject: 'RideX: Booking Confirmed!',
                                    message: `Hello ${user.name},\n\nYour RideX booking is officially confirmed!\n\nDriver Details:\nName: ${ride.driver.driverName}\nVehicle: ${ride.driver.vehicle}\nPlate: ${ride.driver.plate}\nPhone: ${ride.driver.phone}\n\nPickup: ${ride.pickup}\nDropoff: ${ride.drop}\nFare: ₹${ride.fare}\n\nYour driver is arriving shortly.\n\nThank you for choosing RideX!`
                                }).catch(err => console.error(`Error sending confirmation email:`, err.message));
                            }
                            
                            if (user.phone) {
                                console.log(`\n--- SIMULATED SMS SENT ---`);
                                console.log(`To: ${user.phone}`);
                                console.log(`Message: RideX: Ride confirmed! Driver ${ride.driver.driverName} (${ride.driver.plate}) is arriving in 3 mins. Call: ${ride.driver.phone}. Fare: Rs.${ride.fare}.`);
                                console.log(`---------------------------\n`);
                            }
                        }
                    } catch (error) {
                        console.error('Error sending confirmation notifications:', error.message);
                    }
                }
            }
        });

        // 5. Driver rejects the cab
        socket.on('reject-ride', (data) => {
            const { rideId, riderId } = data;
            console.log(`Ride ${rideId} rejected by driver`);

            const ride = activeRides.get(rideId);
            if (ride) {
                ride.status = 'rejected';
                activeRides.set(rideId, ride);

                // Notify specific Rider that request was rejected (no cab)
                io.to(riderId).emit('ride-rejected', {
                    rideId,
                    message: 'No cabs available nearby. Your request was declined.'
                });
            }
        });

        // 6. Complete Trip
        socket.on('complete-ride', (data) => {
            const { rideId, riderId } = data;
            console.log(`Ride ${rideId} completed successfully`);

            const ride = activeRides.get(rideId);
            if (ride) {
                ride.status = 'completed';
                activeRides.delete(rideId);

                // Notify Rider that trip is completed
                io.to(riderId).emit('ride-completed', { rideId });
            }
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

module.exports = initializeSocket;
