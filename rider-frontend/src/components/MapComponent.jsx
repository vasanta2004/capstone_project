import { useEffect, useRef } from 'react';

const MapComponent = ({ pickup, drop, matchedDriver }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const driversRef = useRef([]);
  const animateRef = useRef(null);

  // Convert props to standard coordinate values or defaults (Hubli, India)
  const pickupLng = pickup ? parseFloat(pickup[0]) : 75.1489;
  const pickupLat = pickup ? parseFloat(pickup[1]) : 15.3506;
  const dropLng = drop ? parseFloat(drop[0]) : 75.1306;
  const dropLat = drop ? parseFloat(drop[1]) : 15.3500;

  // 1. Initialize Map Container on Mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const L = window.L;
    if (!L) {
      console.error("Leaflet CDN was not loaded in index.html");
      return;
    }

    // Create Map instance centered on Pickup coordinates on startup
    const mapInstance = L.map(mapContainerRef.current, {
      center: [pickupLat, pickupLng],
      zoom: 15,
      zoomControl: false
    });
    mapRef.current = mapInstance;

    // Load beautiful, clean Voyager light street tiles (matches your Uber screenshot!)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(mapInstance);

    // Zoom controls at top right
    L.control.zoom({ position: 'topright' }).addTo(mapInstance);

    // Create custom pulsing driver car markers (like Uber's active drivers!)
    const carIconHtml = `
      <div class="relative w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow-xl rounded-full transition-all duration-1000">
        <div class="absolute inset-0 rounded-full bg-black/5 animate-ping"></div>
        <svg class="w-4 h-4 text-black relative z-10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM6 16c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
        </svg>
      </div>
    `;
    const carIcon = L.divIcon({
      html: carIconHtml,
      className: 'custom-car-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Spawn 5 driver cars scattered around the pickup area
    const drivers = [];
    for (let i = 0; i < 5; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.015;
      const offsetLng = (Math.random() - 0.5) * 0.015;
      const marker = L.marker([pickupLat + offsetLat, pickupLng + offsetLng], { icon: carIcon }).addTo(mapInstance);
      drivers.push({
        marker,
        lat: pickupLat + offsetLat,
        lng: pickupLng + offsetLng
      });
    }
    driversRef.current = drivers;

    // Animate cars every 2.5 seconds to simulate active city drivers moving
    const interval = setInterval(() => {
      // Skip updates if animation matching is currently active
      if (animateRef.current) return;

      driversRef.current.forEach(d => {
        d.lat += (Math.random() - 0.5) * 0.0004;
        d.lng += (Math.random() - 0.5) * 0.0004;
        d.marker.setLatLng([d.lat, d.lng]);
      });
    }, 2500);

    return () => {
      clearInterval(interval);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Handle dynamic pickup, drop off, and routing changes
  useEffect(() => {
    const mapInstance = mapRef.current;
    if (!mapInstance) return;

    const L = window.L;

    // Clear previous route pins and polylines
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // 📍 Pickup Marker (glowing green circle like Uber)
    const pickupHtml = `
      <div class="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-xl">
        <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
      </div>
    `;
    const pickupIcon = L.divIcon({
      html: pickupHtml,
      className: 'route-pickup-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    const mPickup = L.marker([pickupLat, pickupLng], { icon: pickupIcon }).addTo(mapInstance)
      .bindPopup('<b>Pickup Location</b><br>Selected')
      .openPopup();
    markersRef.current.push(mPickup);

    // 🏁 Dropoff Marker (glowing red circle)
    const dropHtml = `
      <div class="flex items-center justify-center w-7 h-7 rounded-full bg-red-500 border-2 border-white shadow-xl">
        <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
      </div>
    `;
    const dropIcon = L.divIcon({
      html: dropHtml,
      className: 'route-drop-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    const mDrop = L.marker([dropLat, dropLng], { icon: dropIcon }).addTo(mapInstance)
      .bindPopup('<b>Destination Point</b><br>Selected');
    markersRef.current.push(mDrop);

    // 🛣️ Sleek, Solid Black Polyline (Uber Brand style)
    const polyline = L.polyline([
      [pickupLat, pickupLng],
      [dropLat, dropLng]
    ], {
      color: '#000000', // Sleek black solid polyline like Uber!
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(mapInstance);
    polylineRef.current = polyline;

    // Force map layout re-calculation (fixes grey panels / container rendering bugs)
    mapInstance.invalidateSize();

    // Fit map bounds to show both pins perfectly with comfort margins
    const bounds = L.latLngBounds([
      [pickupLat, pickupLng],
      [dropLat, dropLng]
    ]);
    mapInstance.fitBounds(bounds, { padding: [60, 60] });

  }, [pickupLng, pickupLat, dropLng, dropLat]);

  // 3. Match Driver: Trigger Smooth Arrival Animation simulation in 3D
  useEffect(() => {
    const mapInstance = mapRef.current;
    if (!mapInstance || !matchedDriver || driversRef.current.length === 0) {
      // Restore normal opacity of all drivers if driver is cancelled/unmatched
      if (!matchedDriver && driversRef.current.length > 0) {
        driversRef.current.forEach(d => d.marker.setOpacity(1.0));
      }
      return;
    }

    // Choose the first generic driver marker to act as the matched driver car
    const matchedCar = driversRef.current[0];
    if (!matchedCar) return;

    // 1. Highlight matched car, fade out all other generic cars
    driversRef.current.forEach((d, idx) => {
      if (idx !== 0) {
        d.marker.setOpacity(0.20);
      } else {
        d.marker.setOpacity(1.0);
        d.marker.bindPopup(`<b>${matchedDriver.name}</b><br>${matchedDriver.vehicle}<br>Arriving in 3 mins...`).openPopup();
      }
    });

    // 2. Animate coordinates smoothly from current spot to pickup coordinate
    const startLat = matchedCar.lat;
    const startLng = matchedCar.lng;
    const targetLat = pickupLat;
    const targetLng = pickupLng;
    const duration = 7500; // Smooth 7.5 seconds drive simulation
    let startTime = null;

    const animateDrive = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      // Smooth Easing out formula
      const easeProgress = 1 - Math.pow(1 - progress, 2);

      // Interpolate coordinates
      const currentLat = startLat + (targetLat - startLat) * easeProgress;
      const currentLng = startLng + (targetLng - startLng) * easeProgress;

      // Update positions
      matchedCar.marker.setLatLng([currentLat, currentLng]);
      matchedCar.lat = currentLat;
      matchedCar.lng = currentLng;

      if (progress < 1.0) {
        animateRef.current = requestAnimationFrame(animateDrive);
      } else {
        // Complete arrival trigger popup
        matchedCar.marker.bindPopup(`<b>${matchedDriver.name} has arrived!</b><br>Meet at your pickup point.`).openPopup();
        animateRef.current = null;
      }
    };

    animateRef.current = requestAnimationFrame(animateDrive);

    return () => {
      if (animateRef.current) {
        cancelAnimationFrame(animateRef.current);
        animateRef.current = null;
      }
    };
  }, [matchedDriver, pickupLat, pickupLng]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gray-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Header Overlay Info */}
      <div className="absolute top-4 left-4 glass px-4 py-2 rounded-full text-xs font-semibold tracking-wider text-black z-10 flex items-center gap-1.5 shadow-md border border-white/20 bg-white/80">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        Interactive Live Street Map
      </div>
    </div>
  );
};

export default MapComponent;
