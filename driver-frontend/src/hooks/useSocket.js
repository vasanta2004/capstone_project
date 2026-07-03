import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const useSocket = () => {
    const socket = useRef(null);
    const { token, role, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!token) return;

        // Initialize socket connection
        socket.current = io(SOCKET_SERVER_URL, {
            query: { token }
        });

        socket.current.on('connect', () => {
            console.log('Connected to Socket server:', socket.current.id);
            
            // Join specific room based on role or ID
            if (role === 'driver' && user) {
                socket.current.emit('join-driver', user._id || user.id);
            } else if (role === 'rider' && user) {
                socket.current.emit('join-rider', user._id || user.id);
            }
        });

        // Cleanup on unmount
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [token, role, user]);

    const requestRide = (rideDetails) => {
        if (socket.current) {
            socket.current.emit('request-ride', rideDetails);
        }
    };

    const updateLocation = (location) => {
        if (socket.current && role === 'driver') {
            socket.current.emit('update-location', location);
        }
    };

    const acceptRide = (data) => {
         if (socket.current && role === 'driver') {
            socket.current.emit('accept-ride', data);
        }
    };

    const rejectRide = (data) => {
        if (socket.current && role === 'driver') {
            socket.current.emit('reject-ride', data);
        }
    };

    const completeRide = (data) => {
        if (socket.current && role === 'driver') {
            socket.current.emit('complete-ride', data);
        }
    };

    const startRide = (data) => {
        if (socket.current && role === 'driver') {
            socket.current.emit('start-ride', data);
        }
    };

    const confirmRide = (data) => {
        if (socket.current && role === 'rider') {
            socket.current.emit('rider-confirm-ride', data);
        }
    };

    const declineDriver = (data) => {
        if (socket.current && role === 'rider') {
            socket.current.emit('rider-decline-driver', data);
        }
    };

    return { 
        socket: socket.current, 
        requestRide, 
        updateLocation, 
        acceptRide, 
        rejectRide, 
        completeRide,
        startRide,
        confirmRide,
        declineDriver
    };
};

export default useSocket;
