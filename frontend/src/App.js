import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

const features = [
  {
    icon: "👥",
    title: "User Dashboard",
    desc: "Register, login, and track your submitted reports. View reports by others in your area."
  },
  {
    icon: "📝",
    title: "Report Issues",
    desc: "Submit reports for crime, water, electricity, sanitation, and road/traffic issues. Attach location and images."
  },
  {
    icon: "🔍",
    title: "Browse & Discover",
    desc: "Explore recent reports on a map or list, filter by category/location/date, and see trending issues."
  }
];

const categories = [
  { icon: "🚓", name: "Crime Report" },
  { icon: "💧", name: "Water Issues" },
  { icon: "⚡", name: "Electricity Issues" },
  { icon: "🗑️", name: "Sanitation" },
  { icon: "🛑", name: "Road & Traffic" }
];

const faqs = [
  {
    q: "What can I do on CityPulse?",
    a: "You can report local issues, track your submissions, and see what's happening in your area."
  },
  {
    q: "How do I submit a report?",
    a: "Register or log in, then use your dashboard to submit a report with details, category, location, and optional image."
  },
  {
    q: "Is my data public?",
    a: "Reports are visible to all users, but your personal information is kept private."
  }
];

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow sticky top-0 z-10">
              <nav className="container mx-auto flex items-center justify-between py-4 px-6">
                <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
                  <span role="img" aria-label="pulse">🌆</span> CityPulse
                </div>
                <ul className="hidden md:flex gap-8 text-gray-700 font-medium">
                  <li><a href="#home" className="hover:text-blue-600">Home</a></li>
                  <li><a href="#about" className="hover:text-blue-600">About</a></li>
                  <li><a href="#contact" className="hover:text-blue-600">Contact</a></li>
                </ul>
                <div className="flex gap-2">
                  <Link to="/login" className="px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50 transition">Login</Link>
                  <Link to="/register" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">Register</Link>
                </div>
              </nav>
            </header>

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center text-center py-16 px-4 bg-gradient-to-br from-blue-50 to-blue-100" id="home">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 animate-fadeInUp">Empower Your Community. Report & Track City Issues.</h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 animate-fadeInUp stagger-1">Submit, track, and explore local reports for a safer, smarter city.</p>
              <a href="#features" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold shadow hover:bg-blue-700 transition hover-lift animate-fadeInUp stagger-2">Get Started</a>
            </section>

            {/* Features */}
            <section className="container mx-auto py-16 px-4" id="features">
              <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 animate-fadeInUp">What You Can Do on CityPulse</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((f, i) => (
                  <div key={i} className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover-lift animate-fadeInUp" style={{ animationDelay: `${i * 200}ms` }}>
                    <div className="text-5xl mb-4 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>{f.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 text-blue-700">{f.title}</h3>
                    <p className="text-gray-600">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Issue Categories */}
            <section className="bg-white py-12 px-4 border-t border-b" id="categories">
              <div className="container mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 animate-fadeInUp">Reportable Issue Categories</h2>
                <div className="flex flex-wrap justify-center gap-6">
                  {categories.map((cat, i) => (
                    <div key={i} className="flex flex-col items-center bg-blue-50 rounded-lg p-4 w-40 shadow hover-lift animate-bounceIn" style={{ animationDelay: `${i * 150}ms` }}>
                      <div className="text-4xl mb-2 animate-float" style={{ animationDelay: `${i * 0.3}s` }}>{cat.icon}</div>
                      <div className="font-medium text-blue-700">{cat.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Live Data Demo / Public View */}
            <section className="container mx-auto py-16 px-4" id="demo">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center animate-fadeInUp">See What's Happening in Your Area</h2>
              <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
                <div className="flex-1 w-full max-w-lg animate-slideInFromLeft">
                  <div className="w-full h-64 bg-gradient-to-tr from-blue-200 to-blue-400 rounded-lg flex items-center justify-center text-3xl text-white font-bold mb-4 hover-lift">
                    [Map View: Recent Reports]
                  </div>
                  <div className="text-center text-gray-600">Map preview of recent issues (mock data)</div>
                </div>
                <div className="flex-1 w-full max-w-lg animate-slideInFromRight">
                  <div className="bg-white rounded-lg shadow p-4 mb-4 hover-lift animate-fadeInUp stagger-1">
                    <h3 className="font-semibold text-blue-700 mb-2">Trending Issues</h3>
                    <ul className="text-gray-700 space-y-1">
                      <li className="animate-fadeInUp stagger-2">🛑 Pothole on Main St. <span className="text-xs text-gray-400">(2h ago)</span></li>
                      <li className="animate-fadeInUp stagger-3">💧 Water supply disruption in Sector 5 <span className="text-xs text-gray-400">(1h ago)</span></li>
                      <li className="animate-fadeInUp stagger-4">🚓 Suspicious activity near Park Ave <span className="text-xs text-gray-400">(30m ago)</span></li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 hover-lift animate-fadeInUp stagger-2">
                    <h3 className="font-semibold text-blue-700 mb-2">Recent Reports</h3>
                    <ul className="text-gray-700 space-y-1">
                      <li className="animate-fadeInUp stagger-3">⚡ Power cut in Block C <span className="text-xs text-gray-400">(just now)</span></li>
                      <li className="animate-fadeInUp stagger-4">🗑️ Garbage overflow at Market Rd <span className="text-xs text-gray-400">(10m ago)</span></li>
                      <li className="animate-fadeInUp stagger-5">🛑 Accident at 3rd Cross <span className="text-xs text-gray-400">(20m ago)</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQs / About */}
            <section className="bg-gray-100 py-16 px-4" id="about">
              <div className="container mx-auto max-w-3xl">
                <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 animate-fadeInUp">About CityPulse</h2>
                <div className="space-y-6">
                  {faqs.map((faq, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6 hover-lift animate-fadeInUp" style={{ animationDelay: `${i * 200}ms` }}>
                      <h3 className="font-semibold text-lg text-blue-700 mb-2">{faq.q}</h3>
                      <p className="text-gray-700">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t mt-auto">
              <div className="container mx-auto py-8 px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col items-center md:items-start">
                  <div className="text-xl font-bold text-blue-600 mb-2">CityPulse</div>
                  <div className="text-gray-600 text-sm">Contact: info@citypulse.com</div>
                  <div className="flex gap-3 mt-2">
                    <a href="https://github.com/" className="text-gray-500 hover:text-blue-600" aria-label="GitHub"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.263.82-.582 0-.288-.012-1.243-.018-2.25-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.399 3-.404 1.02.005 2.04.137 3 .404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.699.825.58C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z"/></svg></a>
                    <a href="https://linkedin.com/" className="text-gray-500 hover:text-blue-600" aria-label="LinkedIn"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.966 0-1.75-.79-1.75-1.76s.784-1.76 1.75-1.76 1.75.79 1.75 1.76-.784 1.76-1.75 1.76zm15.5 11.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z"/></svg></a>
                  </div>
                </div>
                <div className="flex gap-6 text-gray-600 text-sm">
                  <a href="#privacy" className="hover:text-blue-600">Privacy</a>
                  <a href="#terms" className="hover:text-blue-600">Terms</a>
                </div>
                <div className="text-gray-400 text-xs">&copy; {new Date().getFullYear()} CityPulse. All rights reserved.</div>
              </div>
            </footer>
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
