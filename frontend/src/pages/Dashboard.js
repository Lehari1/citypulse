import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  SunIcon, MoonIcon, DocumentPlusIcon, ChartBarIcon, HandThumbUpIcon, HomeIcon, 
  ClipboardDocumentListIcon, BellAlertIcon, UserCircleIcon, 
  ArrowLeftOnRectangleIcon, ExclamationTriangleIcon, FireIcon, BoltIcon, 
  TrashIcon, WrenchScrewdriverIcon
} from '@heroicons/react/24/solid';
import { ReactComponent as CityPulseLogo } from '../citypulse-logo.svg';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const sidebarLinks = [
  { label: 'Dashboard', icon: <HomeIcon className="w-7 h-7 text-blue-400 group-hover:text-blue-600 transition" />, color: 'from-blue-400 to-blue-600' },
  { label: 'All Reports', icon: <ClipboardDocumentListIcon className="w-7 h-7 text-pink-400 group-hover:text-pink-600 transition" />, color: 'from-pink-400 to-pink-600' },
  { label: 'My Reports', icon: <DocumentPlusIcon className="w-7 h-7 text-green-400 group-hover:text-green-600 transition" />, color: 'from-green-400 to-green-600' },
  { label: 'Statistics', icon: <ChartBarIcon className="w-7 h-7 text-teal-400 group-hover:text-teal-600 transition" />, color: 'from-teal-400 to-teal-600' },
  { label: 'Notifications', icon: <BellAlertIcon className="w-7 h-7 text-orange-400 group-hover:text-orange-600 transition" />, color: 'from-orange-400 to-orange-600', badge: 3 },
  { label: 'Profile', icon: <UserCircleIcon className="w-7 h-7 text-purple-400 group-hover:text-purple-600 transition" />, color: 'from-purple-400 to-purple-600' },
  { label: 'Logout', icon: <ArrowLeftOnRectangleIcon className="w-7 h-7 text-red-400 group-hover:text-red-600 transition" />, color: 'from-red-400 to-red-600' },
];

function MapCenterer({ center }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

function LocationMarker({ marker }) {
  if (!marker) return null;
  
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="display:flex;align-items:center;justify-content:center;background:#3b82f6;border-radius:50%;width:40px;height:40px;box-shadow:0 4px 12px rgba(59, 130, 246, 0.4);border: 3px solid white;animation: pulse 2s infinite;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
  
  return <Marker position={marker} icon={customIcon} />;
}

// Add map click handler component
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

const featureCards = [
  { icon: <DocumentPlusIcon className="w-10 h-10 text-blue-500" />, title: 'Create Report', desc: 'Report a new civic issue in your city.' },
  { icon: <ChartBarIcon className="w-10 h-10 text-teal-500" />, title: 'Analyze Reports', desc: 'View statistics and trends for your city.' },
  { icon: <HandThumbUpIcon className="w-10 h-10 text-pink-500" />, title: 'Upvote Report', desc: 'Support important issues by upvoting.' },
];

// Update icon mapping and SVG paths for correct symbols
const getCategoryIcon = (category) => {
  const iconConfig = {
    Crime: { color: 'text-red-500', type: 'caution' },
    Fire: { color: 'text-orange-500', type: 'fire' },
    Water: { color: 'text-blue-500', type: 'water' },
    Electricity: { color: 'text-yellow-500', type: 'electricity' },
    Sanitation: { color: 'text-green-500', type: 'trash' },
    'Road & Traffic': { color: 'text-amber-600', type: 'traffic' },
  };
  return iconConfig[category] || { color: 'text-gray-500', type: 'caution' };
};

// SVG paths for each icon type
const getIconSVGPath = (type) => {
  const paths = {
    caution: "M12 2.25c-.38 0-.725.214-.894.553l-8.25 16.5A.937.937 0 0 0 3.75 20.25h16.5a.937.937 0 0 0 .894-1.197l-8.25-16.5A.937.937 0 0 0 12 2.25zm0 13.5a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25zm-.75-6.75a.75.75 0 0 1 1.5 0v3.75a.75.75 0 0 1-1.5 0V9z",
    fire: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
    water: "M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0L12 2.69z",
    electricity: "M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z",
    trash: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
    traffic: "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.047 1.304-.023 2.534-.14 3.743a4.5 4.5 0 01-2.25 2.25z"
  };
  return paths[type] || paths.caution;
};

export default function Dashboard() {
  const [mapCenter, setMapCenter] = useState([16.5062, 80.6480]); // Vijayawada default
  const [marker, setMarker] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [cityInput, setCityInput] = useState('Vijayawada');
  const [city, setCity] = useState('Vijayawada');
  const [sidebarActive, setSidebarActive] = useState('Dashboard');
  const [notifCount] = useState(3);
  const [dark, setDark] = useState(false);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, critical: 0 });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ title: '', description: '', category: 'Crime', image: null, urgency: 'normal' });
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [myReports, setMyReports] = useState([]);
  const [userId, setUserId] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // New state for edit functionality
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: 'Crime', urgency: 'normal' });
  const [editing, setEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showResolvedReports, setShowResolvedReports] = useState(false);
  const [userUpvoteCount, setUserUpvoteCount] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [profile, setProfile] = useState(null);

  // Check if current user has upvoted a report
  const hasUserUpvoted = useCallback((report) => {
    return userId && report.upvotedBy && report.upvotedBy.includes(userId);
  }, [userId]);
  
  // Check if current user can upvote a report
  const canUserUpvote = (report) => {
    return userId && report.user !== userId;
  };

  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  // Fetch reports for city
  React.useEffect(() => {
    async function fetchReports() {
      try {
        const res = await axios.get(`/api/reports?city=${encodeURIComponent(city)}`);
        setReports(res.data);
        // Calculate stats
        setStats({
          total: res.data.length,
          resolved: res.data.filter(r => r.status === 'resolved').length,
          critical: res.data.filter(r => r.urgency === 'critical' && r.status !== 'resolved').length,
        });
      } catch {}
    }
    fetchReports();
  }, [city]);

  React.useEffect(() => {
    // Get user ID from token if logged in
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch {}
    }
  }, []);

  React.useEffect(() => {
    // Fetch my reports if logged in
    if (userId) {
      axios.get(`/api/reports?user=${userId}`)
        .then(res => setMyReports(res.data))
        .catch(() => setMyReports([]));
      
      axios.get('/api/users/me')
        .then(res => setProfile(res.data))
        .catch(err => console.error('Failed to fetch profile', err));
    }
  }, [userId]);

  // Calculate user upvote count
  React.useEffect(() => {
    if (userId && reports.length > 0) {
      const upvotedCount = reports.filter(r => hasUserUpvoted(r)).length;
      setUserUpvoteCount(upvotedCount);
    }
  }, [userId, reports, hasUserUpvoted]);

  // Prepare chart data
  React.useEffect(() => {
    if(reports.length > 0) {
        const statusCounts = reports.reduce((acc, report) => {
            acc[report.status] = (acc[report.status] || 0) + 1;
            return acc;
        }, { open: 0, 'in progress': 0, resolved: 0 });

        const categoryCounts = reports.reduce((acc, report) => {
            acc[report.category] = (acc[report.category] || 0) + 1;
            return acc;
        }, {});

        setChartData({
            status: {
                labels: ['Open', 'In Progress', 'Resolved'],
                datasets: [{
                    data: [statusCounts['open'], statusCounts['in progress'], statusCounts['resolved']],
                    backgroundColor: ['#3b82f6', '#f59e0b', '#22c55e'],
                    hoverBackgroundColor: ['#2563eb', '#d97706', '#16a34a'],
                }],
            },
            category: {
                labels: Object.keys(categoryCounts),
                datasets: [{
                    label: 'Reports by Category',
                    data: Object.values(categoryCounts),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                }]
            },
        });
    }
  }, [reports]);

  const handleCitySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityInput)}`);
      if (res.data && res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setCity(display_name.split(',')[0]);
        setShowModal(false);
      } else {
        alert('City not found.');
      }
    } catch {
      alert('City not found.');
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setCity('My Location');
        setShowModal(false);
      },
      () => alert('Unable to retrieve your location')
    );
  };

  // Handler for 'Use My Location' in the report modal
  const handleUseMyLocationForReport = () => {
    if (!navigator.geolocation) return setErrorMsg('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMarker({ lat: latitude, lng: longitude });
        setErrorMsg('');
      },
      (err) => setErrorMsg('Geolocation failed: ' + err.message)
    );
  };

  // Create report handler
  async function handleCreateReport(e) {
    e.preventDefault();
    setCreating(true);
    setErrorMsg('');
    try {
      let latitude, longitude;
      if (marker) {
        latitude = marker.lat;
        longitude = marker.lng;
      } else {
        // fallback to geolocation if marker not set
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            pos => {
              latitude = pos.coords.latitude;
              longitude = pos.coords.longitude;
              setMarker({ lat: latitude, lng: longitude });
              resolve();
            },
            err => {
              setErrorMsg('Geolocation failed: ' + err.message);
              setCreating(false);
              reject(err);
            }
          );
        });
      }
      let address = '';
      let user = null;
      try {
        // Reverse geocode to get address
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        address = geoRes.data.display_name || '';
      } catch {
        address = '';
      }
      // Get user ID from token if logged in
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          user = decoded.id;
        } catch {}
      }
      const formData = new FormData();
      formData.append('title', reportForm.title);
      formData.append('description', reportForm.description);
      formData.append('category', reportForm.category);
      formData.append('urgency', reportForm.urgency);
      formData.append('lat', latitude);
      formData.append('lon', longitude);
      formData.append('address', address);
      if (user) formData.append('user', user);
      if (reportForm.image) formData.append('image', reportForm.image);
      try {
        const res = await axios.post('/api/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setReports(r => [res.data, ...r]);
        // Add to my reports immediately
        if (userId) {
          setMyReports(prev => [res.data, ...prev]);
        }
        setShowReportModal(false);
        setReportForm({ title: '', description: '', category: 'Crime', image: null, urgency: 'normal' });
        setMarker(null); // clear marker after report
      } catch (err) {
        setErrorMsg('Failed to create report: ' + (err.response?.data?.msg || err.message));
      }
      setCreating(false);
    } catch (err) {
      if (!errorMsg) setErrorMsg('Unexpected error: ' + err.message);
      setCreating(false);
    }
  }

  // Edit report handler
  async function handleEditReport(e) {
    e.preventDefault();
    setEditing(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await axios.put(`/api/reports/${editingReport._id}`, editForm);
      
      // Update reports in all relevant states
      setReports(prev => prev.map(r => r._id === editingReport._id ? res.data : r));
      setMyReports(prev => prev.map(r => r._id === editingReport._id ? res.data : r));
      
      setShowEditModal(false);
      setEditingReport(null);
      setEditForm({ title: '', description: '', category: 'Crime', urgency: 'normal' });
      setSuccessMsg('Report updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Failed to edit report: ' + (err.response?.data?.msg || err.message));
    }
    setEditing(false);
  }

  // Solve report handler
  async function handleSolveReport(reportId) {
    if (!window.confirm('Are you sure you want to mark this report as solved? This will remove it from the map.')) {
      return;
    }
    
    try {
      const res = await axios.patch(`/api/reports/${reportId}/solve`);
      
      // Update reports in all relevant states
      setReports(prev => prev.map(r => r._id === reportId ? res.data : r));
      setMyReports(prev => prev.map(r => r._id === reportId ? res.data : r));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        resolved: prev.resolved + 1,
        critical: res.data.urgency === 'critical' ? prev.critical - 1 : prev.critical
      }));
      
      setSuccessMsg('Report marked as solved!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Failed to mark report as solved: ' + (err.response?.data?.msg || err.message));
    }
  }

  // Upvote handler
  async function handleUpvote(reportId) {
    if (!userId) {
      setErrorMsg('Please log in to upvote reports');
      return;
    }

    try {
      const res = await axios.patch(`/api/reports/${reportId}/upvote`, { userId });
      
      // Update reports in all relevant states
      const updateReport = (r) => {
        if (r._id === reportId) {
          return { 
            ...r, 
            upvotes: res.data.upvotes,
            upvotedBy: res.data.hasUpvoted 
              ? [...(r.upvotedBy || []), userId]
              : (r.upvotedBy || []).filter(id => id !== userId)
          };
        }
        return r;
      };
      
      setReports(prev => prev.map(updateReport));
      setMyReports(prev => prev.map(updateReport));
      
      // Show success message with upvote count
      setSuccessMsg(`${res.data.message} (${res.data.upvotes} total upvotes)`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.msg || 'Failed to upvote report');
    }
  }

  // Open edit modal
  const openEditModal = (report) => {
    setEditingReport(report);
    setEditForm({
      title: report.title,
      description: report.description,
      category: report.category,
      urgency: report.urgency
    });
    setShowEditModal(true);
  };

  // Add map click handler
  const handleMapClick = (latlng) => {
    setMarker(latlng);
  };

  return (
    <div className={`flex bg-gray-100 dark:bg-gray-900 ${dark ? 'dark' : ''}`}>
      {/* Left Sidebar */}
      <aside className="w-20 md:w-64 bg-white dark:bg-gray-800 min-h-screen p-4 flex flex-col shadow-lg">
        <div className="flex items-center gap-2 mb-10">
          <CityPulseLogo className="w-10 h-10" />
          <div className="hidden md:block text-2xl font-bold text-blue-600 dark:text-blue-300">CityPulse</div>
        </div>
        <nav className="flex flex-col gap-3">
          {sidebarLinks.map(link => (
            <button
              key={link.label}
              className={`group flex items-center gap-3 w-full px-4 py-3 rounded-lg transition text-left font-medium relative
                ${sidebarActive === link.label ? 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border-l-4 border-blue-500 dark:border-blue-400 shadow-md' : 'hover:bg-blue-50 dark:hover:bg-gray-700'}`}
              onClick={() => {
                if (link.label === 'Logout') {
                  window.location.href = '/';
                } else if (link.label === 'My Reports') {
                  setActiveSection('myReports');
                  setSidebarActive(link.label);
                } else if (link.label === 'All Reports') {
                  setActiveSection('allReports');
                  setSidebarActive(link.label);
                } else if (link.label === 'Statistics') {
                  setActiveSection('statistics');
                  setSidebarActive(link.label);
                } else if (link.label === 'Profile') {
                  setActiveSection('profile');
                  setSidebarActive(link.label);
                } else {
                  setActiveSection('dashboard');
                  setSidebarActive(link.label);
                }
              }}
              title={link.label}
            >
              <span className={`text-xl bg-gradient-to-br ${link.color} bg-clip-text text-transparent`}>{link.icon}</span>
              <span className="hidden md:inline-block text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">{link.label}</span>
              {link.label === 'Notifications' && notifCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 absolute right-4 top-2">{notifCount}</span>
              )}
              {sidebarActive === link.label && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 dark:bg-blue-400 rounded-full" />}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 shadow flex flex-col md:flex-row items-center justify-between px-6 py-4 gap-4">
          <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300 text-center md:text-left">{city}</h1>
            <form onSubmit={handleCitySubmit} className="flex items-center gap-2 w-full max-w-md ml-0 md:ml-8">
              <input
                type="text"
                className="rounded-lg px-4 py-2 border border-blue-100 dark:border-gray-700 text-gray-900 dark:bg-gray-800 dark:text-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                placeholder="Search for a city"
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
              />
              <button type="submit" className="rounded-lg px-4 py-2 font-semibold bg-blue-600 text-white hover:bg-blue-700 transition">Search</button>
              <button
                type="button"
                onClick={handleUseLocation}
                className="rounded-full p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 shadow transition flex items-center justify-center relative group"
                title="Use My Location"
              >
                {/* Professional location SVG icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none transition-opacity">Use My Location</span>
              </button>
            </form>
          </div>
          <button onClick={() => setDark(d => !d)} className="ml-auto rounded-full p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            {dark ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-blue-600" />}
          </button>
        </header>

        {/* Conditional rendering based on active section */}
        {activeSection === 'dashboard' && (
          <>
            {/* Map Section */}
            <section className="w-full flex justify-center py-6 px-2">
              <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-2" style={{marginTop: 24, marginBottom: 24}}>
                <div className="relative w-full h-80">
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapCenterer center={mapCenter} />
                    <MapClickHandler onMapClick={handleMapClick} />
                    <LocationMarker marker={marker} />
                    {reports.filter(report => report.status !== 'resolved').map(report => {
                      const iconConfig = getCategoryIcon(report.category);
                      const IconComponent = iconConfig.icon;
                      const svgPath = getIconSVGPath(iconConfig.type);
                      
                      return (
                        <Marker
                          key={report._id}
                          position={[report.location.coordinates[1], report.location.coordinates[0]]}
                          icon={L.divIcon({
                            className: 'custom-leaflet-icon',
                            html: `<div style="display:flex;align-items:center;justify-content:center;background:${report.urgency === 'critical' ? '#fee2e2' : '#fff'};border-radius:50%;width:54px;height:54px;box-shadow:0 2px 8px #0002;border: 3px solid ${report.urgency === 'critical' ? '#f87171' : '#222'}; ${report.urgency === 'critical' ? 'animation: critical-pulse 2s infinite;' : ''}">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: ${iconConfig.color.replace('text-', '').includes('red') ? '#ef4444' : iconConfig.color.replace('text-', '').includes('orange') ? '#f97316' : iconConfig.color.replace('text-', '').includes('blue') ? '#3b82f6' : iconConfig.color.replace('text-', '').includes('yellow') ? '#eab308' : iconConfig.color.replace('text-', '').includes('green') ? '#22c55e' : iconConfig.color.replace('text-', '').includes('amber') ? '#f59e0b' : '#6b7280'}">
                                <path fillRule="evenodd" d="${svgPath}" clipRule="evenodd" />
                              </svg>
                            </div>`
                          })}
                        >
                          <Popup>
                            <div className="space-y-1">
                              <div className="font-bold text-lg">{report.title}</div>
                              <div className="text-xs text-gray-500">{report.category} {report.urgency === 'critical' && <span className="text-red-600 font-bold">(Critical)</span>}</div>
                              <div className="text-sm">{report.description}</div>
                              <div className="text-xs text-gray-400">{new Date(report.timestamp).toLocaleString()}</div>
                              <div className="text-xs font-semibold">Status: <span className={
                                report.status === 'resolved' ? 'text-green-600' : report.status === 'in progress' ? 'text-yellow-600' : 'text-blue-600'
                              }>{report.status}</span></div>
                              <div className="text-xs text-purple-600">👍 {report.upvotes || 0} upvotes</div>
                              {userId && report.user === userId && (
                                <div className="text-xs text-gray-500 italic">(Your report)</div>
                              )}
                              {userId && report.user !== userId && (
                                <div className="text-xs text-blue-600">
                                  {hasUserUpvoted(report) ? '✓ You upvoted this' : 'Click to upvote'}
                                </div>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                  
                  {/* Map Instructions Overlay */}
                  {showReportModal && !marker && (
                    <div className="absolute top-4 left-4 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-blue-200 dark:border-blue-700 animate-fadeInUp">
                      <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Click on the map to set report location
                      </div>
                    </div>
                  )}
                  
                  {showModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <form onSubmit={handleCitySubmit} className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl flex flex-col gap-4 w-96">
                        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">Enter Your City</h2>
                        <input
                          type="text"
                          className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
                          placeholder="Type your city name"
                          value={cityInput}
                          onChange={e => setCityInput(e.target.value)}
                          required
                        />
                        <button type="submit" className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Continue</button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </section>
            {/* Feature Cards Section */}
            <section className="w-full flex justify-center px-2 pb-8">
              <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {featureCards.map((card, index) => (
                  <div
                    key={card.title}
                    className={`bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105 hover:-translate-y-1 ${card.title === 'Create Report' ? 'ring-2 ring-blue-200 hover:ring-blue-400 animate-pulse' : ''}`}
                    onClick={
                      card.title === 'Create Report' ? () => setShowReportModal(true) :
                      card.title === 'Upvote Report' ? () => {
                        setActiveSection('allReports');
                        setSidebarActive('All Reports');
                      } :
                      card.title === 'Analyze Reports' ? () => {
                        setActiveSection('statistics');
                        setSidebarActive('Statistics');
                      } : undefined
                    }
                    style={{
                      animationDelay: `${index * 200}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                    <h3 className="text-lg font-bold mb-1 text-blue-700 dark:text-blue-300">{card.title}</h3>
                    <p className="text-gray-500 dark:text-gray-300 text-sm">{card.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeSection === 'statistics' && (
          <section className="w-full flex justify-center px-2 py-8">
            <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fadeInUp">
              <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Reports Analysis for {city}</h2>
              {chartData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-4 text-center">Report Status</h3>
                    <Doughnut data={chartData.status} />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-4 text-center">Reports by Category</h3>
                    <Bar data={chartData.category} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Report Counts per Category' }}}}/>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">No report data to analyze for this city.</div>
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === 'allReports' && (
          <section className="w-full flex justify-center px-2 py-8">
            <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fadeInUp">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">All Reports in {city}</h2>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showResolvedReports}
                      onChange={(e) => setShowResolvedReports(e.target.checked)}
                      className="rounded"
                    />
                    Show resolved reports
                  </label>
                  <div className="text-sm text-gray-500">
                    {reports.filter(r => showResolvedReports || r.status !== 'resolved').length} of {reports.length} reports
                  </div>
                </div>
              </div>
              
              {/* Upvote Help Text */}
              {userId && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Upvote Rules:</strong> You can upvote any report except your own. Click the upvote button again to remove your vote.
                  </div>
                </div>
              )}
              
              {!userId && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    <strong>Login Required:</strong> Please log in to upvote reports and track your activity.
                  </div>
                </div>
              )}

              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">No reports found in this city.</div>
                  <button 
                    onClick={() => {
                      setActiveSection('dashboard');
                      setShowReportModal(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Create First Report
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports
                    .filter(r => showResolvedReports || r.status !== 'resolved')
                    .map((r, index) => (
                    <div 
                      key={r._id} 
                      className={`rounded-lg p-4 hover-lift animate-fadeInUp ${
                        r.status === 'resolved' 
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-semibold text-lg text-gray-900 dark:text-white">{r.title}</div>
                            {r.urgency === 'critical' && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Critical</span>
                            )}
                            {r.status === 'resolved' && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">✓ Resolved</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{r.description}</div>
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{r.category}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              r.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                              r.status === 'in progress' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {r.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">{new Date(r.timestamp).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canUserUpvote(r) ? (
                            <button
                              onClick={() => handleUpvote(r._id)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                                hasUserUpvoted(r)
                                  ? 'bg-purple-200 text-purple-800 hover:bg-purple-300'
                                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              }`}
                              title={hasUserUpvoted(r) ? 'Remove upvote' : 'Upvote report'}
                            >
                              <svg className={`w-4 h-4 ${hasUserUpvoted(r) ? 'fill-current' : ''}`} viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              {r.upvotes || 0}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-500">
                              <svg className="w-4 h-4" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              {r.upvotes || 0}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === 'myReports' && (
          <section className="w-full flex justify-center px-2 py-8">
            <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fadeInUp">
              <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">My Reports</h2>
              
              {/* Upvote Help Text for My Reports */}
              {userId && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-4">
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    <strong>Note:</strong> You cannot upvote your own reports, but others can upvote them. The upvote count shows community support for your reports.
                  </div>
                </div>
              )}

              {!userId ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">Please log in to view your reports</div>
                  <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Login</Link>
                </div>
              ) : myReports.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">No reports submitted yet.</div>
                  <button 
                    onClick={() => {
                      setActiveSection('dashboard');
                      setShowReportModal(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Create Your First Report
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myReports.map((r, index) => (
                    <div 
                      key={r._id} 
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover-lift animate-fadeInUp"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-semibold text-lg text-gray-900 dark:text-white">{r.title}</div>
                            {r.urgency === 'critical' && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Critical</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{r.description}</div>
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{r.category}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              r.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                              r.status === 'in progress' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {r.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">{new Date(r.timestamp).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {r.status !== 'resolved' && (
                            <>
                              <button
                                onClick={() => openEditModal(r)}
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleSolveReport(r._id)}
                                className="bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition"
                              >
                                Solved
                              </button>
                            </>
                          )}
                          {canUserUpvote(r) ? (
                            <button
                              onClick={() => handleUpvote(r._id)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                                hasUserUpvoted(r)
                                  ? 'bg-purple-200 text-purple-800 hover:bg-purple-300'
                                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              }`}
                              title={hasUserUpvoted(r) ? 'Remove upvote' : 'Upvote report'}
                            >
                              <svg className={`w-4 h-4 ${hasUserUpvoted(r) ? 'fill-current' : ''}`} viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              {r.upvotes || 0}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-500">
                              <svg className="w-4 h-4" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              {r.upvotes || 0}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === 'profile' && (
          <section className="w-full flex justify-center px-2 py-8">
            <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 animate-fadeInUp">
              <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">My Profile</h2>
              {profile ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <UserCircleIcon className="w-24 h-24 text-gray-300 dark:text-gray-600" />
                    <div>
                      <h3 className="text-2xl font-bold">{profile.name}</h3>
                      <p className="text-gray-500">{profile.email}</p>
                    </div>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-4">
                    <h4 className="font-bold text-lg mb-2">Account Details</h4>
                    <p><strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">Loading profile...</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Right Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg p-6 gap-6">
          <div className="font-bold text-xl mb-2">Live Stats</div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Total Issues <span className="ml-auto font-bold">{stats.total}</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Resolved <span className="ml-auto font-bold">{stats.resolved}</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Critical Alerts <span className="ml-auto font-bold">{stats.critical}</span></div>
            {userId && (
              <div className="flex items-center gap-2"><span className="w-2 h-2 bg-purple-500 rounded-full"></span> Your Upvotes <span className="ml-auto font-bold">{userUpvoteCount}</span></div>
            )}
          </div>
        </aside>
        
        {/* Create Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn">
            <form onSubmit={handleCreateReport} className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl flex flex-col gap-4 w-96 animate-slideIn">
              <h2 className="text-2xl font-bold text-center mb-2">Create Report</h2>
              {errorMsg && <div className="text-red-600 text-sm font-semibold mb-2">{errorMsg}</div>}
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={handleUseMyLocationForReport} className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-semibold hover:bg-blue-200 transition">Use My Location</button>
                <button type="button" onClick={() => setMarker(null)} className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-semibold hover:bg-gray-200 transition">Clear Marker</button>
              </div>
              {marker && (
                <div className="bg-green-50 border border-green-200 rounded p-2 text-sm text-green-700">
                  ✓ Location set: {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
                </div>
              )}
              <input type="text" className="border rounded px-3 py-2" placeholder="Title" value={reportForm.title} onChange={e => setReportForm(f => ({ ...f, title: e.target.value }))} required />
              <textarea className="border rounded px-3 py-2" placeholder="Description" value={reportForm.description} onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))} required />
              <select className="border rounded px-3 py-2" value={reportForm.category} onChange={e => setReportForm(f => ({ ...f, category: e.target.value }))}>
                <option>Crime</option>
                <option>Fire</option>
                <option>Water</option>
                <option>Electricity</option>
                <option>Sanitation</option>
                <option>Road & Traffic</option>
              </select>
              <select className="border rounded px-3 py-2" value={reportForm.urgency} onChange={e => setReportForm(f => ({ ...f, urgency: e.target.value }))}>
                <option value="normal">Normal</option>
                <option value="critical">Critical</option>
              </select>
              <input type="file" accept="image/*" onChange={e => setReportForm(f => ({ ...f, image: e.target.files[0] }))} />
              <button type="submit" className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={creating}>Create</button>
              <button type="button" onClick={() => setShowReportModal(false)} className="text-gray-500 hover:underline">Cancel</button>
            </form>
          </div>
        )}
        
        {/* Success Message */}
        {successMsg && (
          <div className="fixed top-4 right-4 z-[100] bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded animate-fadeInUp">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 11-16 0 8 8 0 0116 0zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMsg}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="fixed top-4 right-4 z-[100] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded animate-fadeInUp">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMsg}
            </div>
          </div>
        )}
        
        {/* Edit Report Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn">
            <form onSubmit={handleEditReport} className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl flex flex-col gap-4 w-96 animate-slideIn">
              <h2 className="text-2xl font-bold text-center mb-2">Edit Report</h2>
              {errorMsg && <div className="text-red-600 text-sm font-semibold mb-2">{errorMsg}</div>}
              <input 
                type="text" 
                className="border rounded px-3 py-2" 
                placeholder="Title" 
                value={editForm.title} 
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} 
                required 
              />
              <textarea 
                className="border rounded px-3 py-2" 
                placeholder="Description" 
                value={editForm.description} 
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} 
                required 
              />
              <select 
                className="border rounded px-3 py-2" 
                value={editForm.category} 
                onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
              >
                <option>Crime</option>
                <option>Fire</option>
                <option>Water</option>
                <option>Electricity</option>
                <option>Sanitation</option>
                <option>Road & Traffic</option>
              </select>
              <select 
                className="border rounded px-3 py-2" 
                value={editForm.urgency} 
                onChange={e => setEditForm(f => ({ ...f, urgency: e.target.value }))}
              >
                <option value="normal">Normal</option>
                <option value="critical">Critical</option>
              </select>
              <button type="submit" className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={editing}>
                {editing ? 'Updating...' : 'Update Report'}
              </button>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-gray-500 hover:underline">Cancel</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 