import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, 
  MapPin, 
  Check, 
  Crosshair, 
  Navigation, 
  Building, 
  Home, 
  Sparkles, 
  X, 
  CheckCircle2, 
  HelpCircle,
  Compass
} from 'lucide-react';
import { 
  searchLocationOSM, 
  reverseGeocodeOSMDetails, 
  OsmSearchResult, 
  OsmAddressDetails 
} from '../../utils/osm';
import { PropertyCoordinates } from '../../types';

interface OsmLocationPickerProps {
  coordinates?: PropertyCoordinates;
  propertyName?: string;
  onChange: (coords: PropertyCoordinates) => void;
  onSave?: (coords: PropertyCoordinates) => void;
}

export const OsmLocationPicker: React.FC<OsmLocationPickerProps> = ({
  coordinates = { lat: 39.1677, lng: -120.1452, address: 'Lake Tahoe, CA' },
  propertyName = 'Property',
  onChange,
  onSave,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OsmSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Structured address fields
  const [houseNumber, setHouseNumber] = useState(coordinates.houseNumber || '');
  const [road, setRoad] = useState(coordinates.road || '');
  const [landmark, setLandmark] = useState(coordinates.landmark || '');
  const [city, setCity] = useState(coordinates.city || '');
  const [fullAddress, setFullAddress] = useState(coordinates.address || 'Lake Tahoe, CA');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: coordinates.lat || 39.1677,
    lng: coordinates.lng || -120.1452,
  });

  // Modification tracking for visual hierarchy & grayed out state
  const [hasChanges, setHasChanges] = useState(false);
  const [hasSearchHit, setHasSearchHit] = useState(false);
  const [showSaveLocationPrompt, setShowSaveLocationPrompt] = useState(false);
  const [confirmedNotice, setConfirmedNotice] = useState(false);

  // Custom refined pin icon matching Guest Assistant sage theme
  const createSagePinIcon = () => {
    return L.divIcon({
      className: 'custom-osm-pin',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 18px; height: 18px; background: rgba(42, 68, 54, 0.25); border-radius: 9999px; transform: scale(2.2); animation: pulse 2s infinite;"></div>
          <div style="width: 38px; height: 38px; background: #2A4436; border: 3px solid #FFFFFF; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 6px 18px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="transform: rotate(45deg); color: #FFFFFF; font-size: 15px; font-weight: bold;">⌂</div>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
    });
  };

  // Helper to reverse geocode and populate fields
  const updateAddressFromCoords = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    setHasChanges(true);
    setShowSaveLocationPrompt(true);
    try {
      const details: OsmAddressDetails = await reverseGeocodeOSMDetails(lat, lng);
      setCurrentCoords({ lat, lng });
      setFullAddress(details.displayName);

      if (details.houseNumber && !houseNumber) {
        setHouseNumber(details.houseNumber);
      }
      if (details.road) {
        setRoad(details.road);
      }
      if (details.city || details.suburb) {
        setCity(details.city || details.suburb || '');
      }

      // Propagate change
      const newCoords: PropertyCoordinates = {
        lat,
        lng,
        address: details.displayName,
        houseNumber: houseNumber || details.houseNumber || '',
        road: details.road || road,
        landmark,
        city: details.city || city,
      };
      onChange(newCoords);
    } catch (err) {
      console.warn('Geocoding error', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = coordinates.lat || 39.1677;
    const initialLng = coordinates.lng || -120.1452;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      scrollWheelZoom: false,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Draggable Doorstep Marker
    const marker = L.marker([initialLat, initialLng], {
      icon: createSagePinIcon(),
      draggable: true,
      autoPan: true,
    }).addTo(map);

    marker.bindPopup(
      `<div style="font-family: sans-serif; font-size: 12px; font-weight: bold; color: #1C1B18; padding: 2px;">
        📍 Doorstep Pin
        <div style="font-size: 10px; font-weight: normal; color: #78756E; margin-top: 2px;">Exact entrance for guests</div>
      </div>`
    );

    // Click map to reposition pin
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      map.panTo([lat, lng], { animate: true });
      await updateAddressFromCoords(lat, lng);
    });

    // Drag marker to pinpoint doorstep
    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      await updateAddressFromCoords(pos.lat, pos.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sync external coordinates changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && coordinates.lat && coordinates.lng) {
      const currentPos = markerRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - coordinates.lat) > 0.0001 ||
        Math.abs(currentPos.lng - coordinates.lng) > 0.0001
      ) {
        markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
        mapInstanceRef.current.panTo([coordinates.lat, coordinates.lng], { animate: true });
      }
      if (coordinates.address) setFullAddress(coordinates.address);
      if (coordinates.houseNumber) setHouseNumber(coordinates.houseNumber);
      if (coordinates.road) setRoad(coordinates.road);
      if (coordinates.landmark) setLandmark(coordinates.landmark);
      if (coordinates.city) setCity(coordinates.city);
    }
  }, [coordinates.lat, coordinates.lng, coordinates.address]);

  // Handle Search Submission
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearchHit(true);
    const results = await searchLocationOSM(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  // Select Search Result from dropdown
  const handleSelectSearchResult = (result: OsmSearchResult) => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    mapInstanceRef.current.flyTo([result.lat, result.lng], 16, { duration: 1.2 });
    markerRef.current.setLatLng([result.lat, result.lng]);
    setCurrentCoords({ lat: result.lat, lng: result.lng });
    setFullAddress(result.display_name);
    setHasChanges(true);
    setHasSearchHit(true);
    setShowSaveLocationPrompt(true);

    if (result.addressDetails) {
      if (result.addressDetails.houseNumber) setHouseNumber(result.addressDetails.houseNumber);
      if (result.addressDetails.road) setRoad(result.addressDetails.road);
      if (result.addressDetails.city || result.addressDetails.suburb) {
        setCity(result.addressDetails.city || result.addressDetails.suburb || '');
      }
    }

    setSearchResults([]);
    setSearchQuery('');

    const newCoords: PropertyCoordinates = {
      lat: result.lat,
      lng: result.lng,
      address: result.display_name,
      houseNumber: result.addressDetails?.houseNumber || houseNumber,
      road: result.addressDetails?.road || road,
      landmark,
      city: result.addressDetails?.city || city,
    };
    onChange(newCoords);
  };

  // Re-center on current pin
  const handleRecenter = () => {
    if (mapInstanceRef.current && currentCoords.lat && currentCoords.lng) {
      mapInstanceRef.current.setView([currentCoords.lat, currentCoords.lng], 16);
    }
  };

  // Confirm & Save Exact Address
  const handleConfirmLocation = () => {
    // Construct refined address
    const parts = [
      houseNumber.trim(),
      propertyName.trim(),
      road.trim(),
      city.trim(),
    ].filter(Boolean);

    const refinedAddress = parts.length > 0 ? parts.join(', ') : fullAddress;

    const confirmed: PropertyCoordinates = {
      lat: currentCoords.lat,
      lng: currentCoords.lng,
      address: refinedAddress,
      houseNumber: houseNumber.trim(),
      road: road.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
    };

    onChange(confirmed);
    if (onSave) {
      onSave(confirmed);
    }

    setHasChanges(false);
    setShowSaveLocationPrompt(false);
    setHasSearchHit(false);
    setConfirmedNotice(true);
    setTimeout(() => setConfirmedNotice(false), 3500);
  };

  return (
    <div className="space-y-4">
      {/* 1. Swiggy / Zomato Style Top Search Bar */}
      <div className="relative">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#78756E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search house, street, society or landmark (e.g., Tahoe City, CA)..."
              className="w-full pl-10 pr-24 py-3 rounded-2xl bg-[#F6F4F0] border border-black/10 text-xs sm:text-sm text-[#1C1B18] placeholder-[#78756E] focus:outline-none focus:border-[#2A4436] focus:bg-white shadow-soft-sm transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-20 text-[#78756E] hover:text-[#1C1B18] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 px-3.5 py-1.5 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-semibold shadow-soft-sm active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-60"
            >
              {isSearching ? 'Finding...' : 'Search'}
            </button>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-40 mt-1.5 bg-white rounded-2xl border border-black/10 shadow-soft-lg overflow-hidden animate-fade-in divide-y divide-black/5 max-h-64 overflow-y-auto">
              <div className="px-3.5 py-2 bg-[#FAF8F5] text-[11px] font-bold text-[#78756E] uppercase tracking-wider flex items-center justify-between">
                <span>Select Matched Address</span>
                <span className="text-[10px] lowercase font-normal">{searchResults.length} places found</span>
              </div>
              {searchResults.map((res, i) => {
                const parts = res.display_name.split(',');
                const primary = parts[0];
                const secondary = parts.slice(1).join(',').trim();
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full px-4 py-3 text-left text-xs hover:bg-[#FAF8F5] transition-colors flex items-start gap-3 group"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[#1C1B18] text-xs truncate group-hover:text-[#2A4436] transition-colors">
                        {primary}
                      </div>
                      <div className="text-[11px] text-[#78756E] truncate mt-0.5">
                        {secondary || primary}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </form>
      </div>

      {/* 2. Map Canvas Frame with Doorstep Pinning Overlay */}
      <div className="relative rounded-3xl overflow-hidden border border-black/10 shadow-soft-card bg-[#FAF8F5] h-[220px] sm:h-[250px]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Top Floating Badge: Doorstep Guidance Pill */}
        <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-black/10 shadow-soft-card text-xs font-semibold text-[#1C1B18] flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2A4436] animate-pulse" />
            <span>Tap map or drag pin to your front door</span>
          </div>
          {isReverseGeocoding && (
            <span className="text-[10px] text-[#78756E] font-normal animate-pulse">
              Finding address...
            </span>
          )}
        </div>

        {/* Bottom Floating Control Buttons */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={handleRecenter}
            className="p-2 rounded-xl bg-white/95 text-[#2A4436] shadow-soft-card hover:bg-white border border-black/10 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Recenter on Doorstep Pin"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Center Pin</span>
          </button>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-white/95 text-[#1C1B18] hover:text-[#2A4436] shadow-soft-card hover:bg-white border border-black/10 text-xs font-semibold transition-all flex items-center gap-1.5"
            title="Preview in Google Maps"
          >
            <Compass className="w-3.5 h-3.5 text-[#2A4436]" />
            <span className="hidden sm:inline">Google Maps ↗</span>
          </a>
        </div>

        {/* Floating Save Location Pin Button on Map */}
        {showSaveLocationPrompt && (
          <div className="absolute bottom-3 right-3 z-20 animate-fade-in shadow-xl">
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap border border-white/20"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Save Pin</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Doorstep Pin Summary Header */}
      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#2A4436] uppercase tracking-wider">
                Pinned Doorstep
              </span>
            </div>
            <p className="text-xs font-bold text-[#1C1B18] truncate mt-0.5">
              {fullAddress.split(',')[0]}
            </p>
            <p className="text-[11px] text-[#78756E] truncate mt-0.5">
              {fullAddress}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="font-mono text-[10px] bg-white px-2 py-1 rounded-lg border border-black/10 text-[#2A4436] font-semibold">
            {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* 4. Structured Address Details (Styled to match pinned doorstep element) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-black/5 space-y-4">
        <div className="border-b border-black/5 pb-2.5">
          <h3 className="font-serif text-sm sm:text-base font-bold text-[#1C1B18]">
            Address & Entry Notes
          </h3>
          <p className="text-[11px] text-[#78756E] mt-0.5">
            Simple details to help your guests reach your door smoothly.
          </p>
        </div>

        {/* Input Grid: House No, Street, Landmark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
              House / Villa / Unit No. <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={houseNumber}
              onChange={(e) => {
                setHouseNumber(e.target.value);
                setHasChanges(true);
              }}
              placeholder="e.g. Chalet 4, Unit 12B, or Main Gate"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-xs text-[#1C1B18] font-medium focus:outline-none focus:border-[#2A4436] transition-all"
            />
            <span className="text-[10px] text-[#78756E] mt-1 block">
              Helps guests identify the right door or cottage
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
              Street / Road / Area
            </label>
            <input
              type="text"
              value={road}
              onChange={(e) => {
                setRoad(e.target.value);
                setHasChanges(true);
              }}
              placeholder="e.g. 745 West Lake Boulevard"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] transition-all"
            />
            <span className="text-[10px] text-[#78756E] mt-1 block">
              Auto-filled from map pin, edit if needed
            </span>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
              Helpful Arrival Note for Guests
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => {
                setLandmark(e.target.value);
                setHasChanges(true);
              }}
              placeholder="e.g. Opposite West Shore Marina, take gravel driveway behind the cedar tree"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] transition-all"
            />
            <span className="text-[10px] text-[#78756E] mt-1 block">
              Helps guests locate the driveway and front door easily
            </span>
          </div>
        </div>
      </div>

      {/* Separate Action Button Block for Clear Visual Hierarchy */}
      <div className="pt-1">
        <button
          type="button"
          disabled={!hasChanges}
          onClick={handleConfirmLocation}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
            hasChanges
              ? 'bg-[#2A4436] hover:bg-[#20362B] active:scale-[0.99] text-white shadow-soft-sm cursor-pointer'
              : 'bg-[#E5E2DC] text-[#8C8880] cursor-not-allowed border border-black/5'
          }`}
        >
          <Check className={`w-4 h-4 ${hasChanges ? 'stroke-[2.5]' : 'opacity-40'}`} />
          <span>{hasChanges ? 'Save Address & Doorstep Pin' : 'Address & Doorstep Pin Saved'}</span>
        </button>

        {confirmedNotice && (
          <div className="mt-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Doorstep pin & address saved to backend!</span>
          </div>
        )}
      </div>
    </div>
  );
};
