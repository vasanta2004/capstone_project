import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentRide: null,
    pickupLocation: null,
    dropLocation: null,
    fareEstimate: null,
    status: 'idle', // 'idle', 'requesting', 'accepted', 'arriving', 'started', 'completed'
    driverDetails: null,
    loading: false,
    error: null
};

const rideSlice = createSlice({
    name: 'ride',
    initialState,
    reducers: {
        setLocations: (state, action) => {
            state.pickupLocation = action.payload.pickup;
            state.dropLocation = action.payload.drop;
        },
        setFareEstimate: (state, action) => {
            state.fareEstimate = action.payload;
        },
        requestRideStart: (state) => {
            state.loading = true;
            state.status = 'requesting';
        },
        rideAccepted: (state, action) => {
            state.status = 'accepted';
            state.currentRide = action.payload.ride;
            state.driverDetails = action.payload.driver;
            state.loading = false;
        },
        updateRideStatus: (state, action) => {
            state.status = action.payload.status;
        },
        clearRide: (state) => {
            state.currentRide = null;
            state.pickupLocation = null;
            state.dropLocation = null;
            state.fareEstimate = null;
            state.status = 'idle';
            state.driverDetails = null;
        }
    }
});

export const { 
    setLocations, 
    setFareEstimate, 
    requestRideStart, 
    rideAccepted, 
    updateRideStatus, 
    clearRide 
} = rideSlice.actions;

export default rideSlice.reducer;
