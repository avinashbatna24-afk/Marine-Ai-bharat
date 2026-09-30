import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  Hexagon, 
  CheckCircle2, 
  PauseCircle, 
  AlertTriangle,
  Bell,
  Anchor,
  Compass,
  X,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { getGeofences, checkGeofence } from '../api/geofenceApi';
import { adaptGeofenceModel } from '../api/adapters';

const INITIAL_GEOFENCES = [
  {
    id: 'geo-1',
    name: 'Restricted Area',
    description: 'High risk restricted zone',
    type: 'Restricted',
    status: 'Active',
    createdOn: 'May 19, 2025 09:30 AM',
    area: '120.5 km²',
    alerts: 1,
    coordinates: [
      [16.95, 82.38],
      [17.08, 82.55],
      [16.90, 82.65],
      [16.82, 82.48]
    ]
  },
  {
    id: 'geo-2',
    name: 'Safe Zone',
    description: 'Safe navigation area',
    type: 'Safe',
    status: 'Active',
    createdOn: 'May 18, 2025 03:15 PM',
    area: '98.3 km²',
    alerts: 0,
    coordinates: [
      [16.92, 82.68],
      [17.02, 82.82],
      [16.85, 82.90],
      [16.80, 82.72]
    ]
  },
  {
    id: 'geo-3',
    name: 'Port Area',
    description: 'Port operations zone',
    type: 'Port',
    status: 'Active',
    createdOn: 'May 17, 2025 11:20 AM',
    area: '75.6 km²',
    alerts: 0,
    coordinates: [
      [16.78, 82.35],
      [16.85, 82.45],
      [16.70, 82.50],
      [16.65, 82.38]
    ]
  },
  {
    id: 'geo-4',
    name: 'Fishing Zone',
    description: 'Designated fishing area',
    type: 'Fishing',
    status: 'Inactive',
    createdOn: 'May 16, 2025 08:45 AM',
    area: '60.2 km²',
    alerts: 0,
    isCircle: true,
    center: [16.92, 82.25],
    radius: 12000
  },
  {
    id: 'geo-5',
    name: 'Kakinada Anchorage Zone',
    description: 'Commercial vessel mooring perimeter',
    type: 'Port',
    status: 'Active',
    createdOn: 'May 14, 2025 02:10 PM',
    area: '42.1 km²',
    alerts: 0,
    coordinates: [[16.98, 82.28], [17.04, 82.35], [16.95, 82.40]]
  }
];

export default function GeofencesPage() {
  const [geofences, setGeofences] = useState(INITIAL_GEOFENCES);
  const [isFallback, setIsFallback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState(null);

  // New Geofence Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Restricted',
    status: 'Active',
    area: '50.0 km²'
  });

  useEffect(() => {
    let isMounted = true;
    async function loadGeofenceData() {
      try {
        const res = await getGeofences({ latitude: 16.98, longitude: 82.24 });
        if (!isMounted) return;
        setIsFallback(res.isFallback);
        if (res.data && res.data.length > 0) {
          const adapted = res.data.map(adaptGeofenceModel).filter(Boolean);
          if (adapted.length > 0) {
            setGeofences(adapted);
          }
        }
      } catch {
        // Fallback is handled inside service
      }
    }
    loadGeofenceData();
    return () => { isMounted = false; };
  }, []);

  // Calculate Summary Statistics
  const totalGeofences = geofences.length;
  const activeGeofences = geofences.filter(g => g.status === 'Active').length;
  const inactiveGeofences = geofences.filter(g => g.status === 'Inactive').length;
  const triggeredGeofences = geofences.filter(g => g.alerts > 0).length;

  // Filter Geofences
  const filteredGeofences = useMemo(() => {
    return geofences.filter((g) => {
      const matchesSearch = 
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'All Status' ||
        (statusFilter === 'Triggered' ? g.alerts > 0 : g.status === statusFilter);

      const matchesType = 
        typeFilter === 'All Types' || g.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [geofences, searchQuery, statusFilter, typeFilter]);

  // Paginated Geofences
  const totalPages = Math.ceil(filteredGeofences.length / pageSize) || 1;
  const paginatedGeofences = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGeofences.slice(start, start + pageSize);
  }, [filteredGeofences, currentPage]);

  // Handle Delete
  const handleDelete = (id) => {
    setGeofences(prev => prev.filter(g => g.id !== id));
  };

  // Handle Form Submit (Create / Edit)
  const handleSaveGeofence = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingGeofence) {
      setGeofences(prev => prev.map(g => g.id === editingGeofence.id ? {
        ...g,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        area: formData.area
      } : g));
      setEditingGeofence(null);
    } else {
      const newGeo = {
        id: `geo-${Date.now()}`,
        name: formData.name,
        description: formData.description || 'Custom user boundary zone',
        type: formData.type,
        status: formData.status,
        createdOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        area: formData.area,
        alerts: 0,
        coordinates: [
          [16.91, 82.35],
          [17.00, 82.48],
          [16.88, 82.55]
        ]
      };
      setGeofences(prev => [newGeo, ...prev]);
    }

    setIsCreateModalOpen(false);
    setFormData({ name: '', description: '', type: 'Restricted', status: 'Active', area: '50.0 km²' });
  };

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'Restricted':
        return 'bg-red-50 text-red-600 border border-red-200/60 font-medium';
      case 'Safe':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 font-medium';
      case 'Port':
        return 'bg-amber-50 text-amber-600 border border-amber-200/60 font-medium';
      case 'Fishing':
        return 'bg-blue-50 text-blue-600 border border-blue-200/60 font-medium';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200 font-medium';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-8">
      {/* PAGE HEADER WITH ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0F172A] tracking-tight">
              Geofences
            </h1>
            {isFallback && (
              <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Demo Data (Offline Fallback)
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Create, manage, and monitor geofenced areas.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGeofence(null);
            setFormData({ name: '', description: '', type: 'Restricted', status: 'Active', area: '50.0 km²' });
            setIsCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#1363DF] hover:bg-[#0D4EB3] text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Geofence</span>
        </button>
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1363DF] flex items-center justify-center shrink-0 border border-blue-100">
              <Hexagon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Geofences</p>
              <p className="font-mono text-xl md:text-2xl font-bold text-[#0F172A] mt-0.5">{totalGeofences}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active</p>
              <p className="font-mono text-xl md:text-2xl font-bold text-[#0F172A] mt-0.5">{activeGeofences}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <PauseCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Inactive</p>
              <p className="font-mono text-xl md:text-2xl font-bold text-[#0F172A] mt-0.5">{inactiveGeofences}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Triggered</p>
              <p className="font-mono text-xl md:text-2xl font-bold text-[#0F172A] mt-0.5">{triggeredGeofences}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAP OVERLAY DISPLAY */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="h-[340px] md:h-[380px] relative w-full">
          <MapContainer
            center={[16.92, 82.50]}
            zoom={9}
            scrollWheelZoom={false}
            className="w-full h-full z-10"
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics"
            />

            {geofences.map((g) => {
              if (g.isCircle && g.center) {
                return (
                  <Circle
                    key={g.id}
                    center={g.center}
                    radius={g.radius || 12000}
                    pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.15, weight: 2 }}
                  >
                    <Popup><div className="font-mono text-xs font-bold">{g.name}</div></Popup>
                  </Circle>
                );
              }
              if (g.coordinates && g.coordinates.length > 0) {
                return (
                  <Polygon
                    key={g.id}
                    positions={g.coordinates}
                    pathOptions={{
                      color: g.type === 'Restricted' ? '#EF4444' : g.type === 'Safe' ? '#10B981' : '#F59E0B',
                      fillColor: g.type === 'Restricted' ? '#EF4444' : g.type === 'Safe' ? '#10B981' : '#F59E0B',
                      fillOpacity: 0.15,
                      weight: 2
                    }}
                  >
                    <Popup><div className="font-mono text-xs font-bold">{g.name}</div></Popup>
                  </Polygon>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search geofences..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#1363DF]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer font-mono"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Triggered</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer font-mono"
          >
            <option>All Types</option>
            <option>Restricted</option>
            <option>Safe</option>
            <option>Port</option>
            <option>Fishing</option>
          </select>
        </div>
      </div>

      {/* GEOFENCE LIST CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedGeofences.map((geo) => (
          <div key={geo.id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#0F172A]">{geo.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${getTypeBadgeStyle(geo.type)}`}>
                    {geo.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{geo.description}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold shrink-0 ${geo.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                {geo.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-100 pt-3">
              <span>Area: <strong className="text-slate-800">{geo.area}</strong></span>
              <span>Alerts: <strong className={geo.alerts > 0 ? 'text-red-600 font-bold' : 'text-slate-800'}>{geo.alerts}</strong></span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingGeofence(geo);
                    setFormData({ name: geo.name, description: geo.description, type: geo.type, status: geo.status, area: geo.area });
                    setIsCreateModalOpen(true);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(geo.id)}
                  className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-[#E2E8F0] shadow-xs text-xs font-mono text-slate-600">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
