import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const deliveryIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path fill="#3b82f6" d="M12.5 0C5.6 0 0 5.6 0 12.5S12.5 41 12.5 41 25 19.4 25 12.5 19.4 0 12.5 0zm0 19c-3.6 0-6.5-2.9-6.5-6.5S8.9 6 12.5 6s6.5 2.9 6.5 6.5S16.1 19 12.5 19z"/>
      <circle fill="white" cx="12.5" cy="12.5" r="4"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const pickupIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path fill="#10b981" d="M12.5 0C5.6 0 0 5.6 0 12.5S12.5 41 12.5 41 25 19.4 25 12.5 19.4 0 12.5 0zm0 19c-3.6 0-6.5-2.9-6.5-6.5S8.9 6 12.5 6s6.5 2.9 6.5 6.5S16.1 19 12.5 19z"/>
      <circle fill="white" cx="12.5" cy="12.5" r="4"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const destinationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64=' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path fill="#ef4444" d="M12.5 0C5.6 0 0 5.6 0 12.5S12.5 41 12.5 41 25 19.4 25 12.5 19.4 0 12.5 0zm0 19c-3.6 0-6.5-2.9-6.5-6.5S8.9 6 12.5 6s6.5 2.9 6.5 6.5S16.1 19 12.5 19z"/>
      <circle fill="white" cx="12.5" cy="12.5" r="4"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapComponentProps {
  deliveryLocation?: { lat: number; lng: number } | null;
  pickupAddress?: string;
  deliveryAddress?: string;
  orderStatus?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({
  deliveryLocation = null,
  pickupAddress = '',
  deliveryAddress = '',
  orderStatus = 'pending'
}) => {
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);

  useEffect(() => {
    geocodeAddresses();
  }, [pickupAddress, deliveryAddress]);

  useEffect(() => {
    if (deliveryLocation && pickupCoords && deliveryCoords) {
      updateRoutePath();
    }
  }, [deliveryLocation, pickupCoords, deliveryCoords]);

  const geocodeAddresses = async () => {
    try {
      // For demo purposes, we'll use mock coordinates
      // In a real app, you'd use a geocoding service like Google Maps, Mapbox, or Nominatim
      
      // Mock pickup coordinates (e.g., restaurant location)
      setPickupCoords({ lat: 12.9716, lng: 77.5946 }); // Bangalore center
      
      // Mock delivery coordinates (offset from pickup)
      setDeliveryCoords({ 
        lat: 12.9716 + (Math.random() - 0.5) * 0.02, 
        lng: 77.5946 + (Math.random() - 0.5) * 0.02 
      });
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
  };

  const updateRoutePath = () => {
    if (!deliveryLocation || !pickupCoords || !deliveryCoords) return;

    const path: [number, number][] = [];
    
    // Add pickup location
    path.push([pickupCoords.lat, pickupCoords.lng]);
    
    // Add current delivery location if in transit
    if (orderStatus === 'in_transit') {
      path.push([deliveryLocation.lat, deliveryLocation.lng]);
    }
    
    // Add destination
    path.push([deliveryCoords.lat, deliveryCoords.lng]);
    
    setRoutePath(path);
  };

  const getMapCenter = (): [number, number] => {
    if (deliveryLocation) {
      return [deliveryLocation.lat, deliveryLocation.lng];
    }
    if (pickupCoords) {
      return [pickupCoords.lat, pickupCoords.lng];
    }
    return [12.9716, 77.5946]; // Default to Bangalore
  };

  const getMapBounds = () => {
    const locations = [];
    
    if (pickupCoords) locations.push([pickupCoords.lat, pickupCoords.lng]);
    if (deliveryCoords) locations.push([deliveryCoords.lat, deliveryCoords.lng]);
    if (deliveryLocation) locations.push([deliveryLocation.lat, deliveryLocation.lng]);
    
    if (locations.length > 1) {
      return locations as [number, number][];
    }
    return null;
  };

  return (
    <div className="h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={getMapCenter()}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        bounds={getMapBounds() || undefined}
        boundsOptions={{ padding: [20, 20] }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Pickup Location */}
        {pickupCoords && (
          <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={pickupIcon}>
            <Popup>
              <div>
                <strong>Pickup Location</strong>
                <br />
                {pickupAddress}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Delivery Partner Current Location */}
        {deliveryLocation && (
          <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={deliveryIcon}>
            <Popup>
              <div>
                <strong>Delivery Partner</strong>
                <br />
                Current Location
                <br />
                Status: {orderStatus.replace('_', ' ').toUpperCase()}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Destination Location */}
        {deliveryCoords && (
          <Marker position={[deliveryCoords.lat, deliveryCoords.lng]} icon={destinationIcon}>
            <Popup>
              <div>
                <strong>Delivery Location</strong>
                <br />
                {deliveryAddress}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Route Path */}
        {routePath.length > 1 && (
          <Polyline
            positions={routePath}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
