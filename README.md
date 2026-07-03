# RideX - Premium Ride-Hailing Platform

RideX is a comprehensive, real-time ride-hailing application built with a modern web stack. It provides a seamless experience for riders to book rides and for drivers to accept and manage them. 

## Project Architecture

This repository contains a full-stack application divided into four main components:

1. **`backend`**: The Node.js/Express server that powers the platform.
2. **`frontend`**: The main landing page and general user interface.
3. **`rider-frontend`**: The dedicated application for riders to book rides, track drivers, and manage their trips.
4. **`driver-frontend`**: The dedicated application for drivers to receive dispatch offers, accept rides, and complete charters.

## Features

- **Real-Time Dispatch System**: Built with Socket.io for instantaneous communication between riders and drivers.
- **Interactive Maps & Geocoding**: Utilizes Mapbox GL and OpenStreetMap (Nominatim) for precise location tracking, route drawing, and address search.
- **Progressive Ride Tracking**: Live state management tracking rides from "Requested" -> "Accepted" -> "In Progress" -> "Completed".
- **Authentication**: Secure user authentication using JWT and bcrypt.
- **Dynamic Pricing**: Distance-based fare calculation with multiple ride tier options (e.g., RideX, Comfort, RideBlack).
- **Responsive Design**: Premium, animated UI built with React, Tailwind CSS v4, and Framer Motion.

## Tech Stack

### Frontend (Rider, Driver, Main)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v7
- **Maps**: Mapbox GL
- **Animations**: Framer Motion
- **Icons**: React Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Authentication**: JSON Web Tokens (JWT) & bcrypt
- **Email/Notifications**: Nodemailer

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### Installation & Setup

1. **Backend**
   ```bash
   cd backend
   npm install
   # Create a .env file with PORT, MONGO_URI, JWT_SECRET, etc.
   npm run dev
   ```

2. **Rider Frontend**
   ```bash
   cd rider-frontend
   npm install
   npm run dev
   ```

3. **Driver Frontend**
   ```bash
   cd driver-frontend
   npm install
   npm run dev
   ```

4. **Main Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Workflow Example
1. Start the **backend** and both **rider-frontend** and **driver-frontend** dev servers.
2. Log in as a Driver in the driver-frontend and toggle your status to **Online**.
3. Log in as a Rider in the rider-frontend and enter your pickup and drop-off locations.
4. Select a ride type and click **Request Ride**.
5. The driver receives a real-time **Dispatch Offer** and clicks **Accept Ride**.
6. The rider sees the ride is **Accepted (Driver Arriving)**.
7. The driver clicks **Start Ride**, changing the rider's view to **In Progress**.
8. The driver clicks **Complete Charter**, successfully finishing the trip.
