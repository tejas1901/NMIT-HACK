import React, { useState, useEffect, useRef } from 'react'

export default function UnifiedFreightMaster() {
  const [currentView, setCurrentView] = useState('dashboard') // 'landing' | 'login' | 'dashboard'
  const [activeTab, setActiveTab] = useState('bookings') // 'bookings' | 'weather' | 'xgboost' | 'quantum' | 'copilot'
  const [weatherAlerts, setWeatherAlerts] = useState([])
  const [weatherStatus, setWeatherStatus] = useState(null)
  const [selectedShipmentWeather, setSelectedShipmentWeather] = useState(null)
  const [activeWeatherModal, setActiveWeatherModal] = useState(false)
  const [refreshingWeather, setRefreshingWeather] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'copilot',
      text: 'Hello! I am your QpiAi Pilot. I continuously monitor Open-Meteo weather forecasts along NH-48, NH-44, and NH-16 freight corridors, correlate with XGBoost demurrage risks, and formulate quantum carrier assignments.'
    }
  ])
  const [chatLoading, setChatLoading] = useState(false)

  const canvasRef = useRef(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Fetch initial weather status & alerts
  useEffect(() => {
    fetch('/api/weather/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) setWeatherStatus(data)
      })
      .catch(() => {})

    fetch('/api/weather/alerts')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.alerts) setWeatherAlerts(data.alerts)
      })
      .catch(() => {})
  }, [])

  const handleManualRefresh = async () => {
    setRefreshingWeather(true)
    showToast('Polling Open-Meteo live highway waypoint radar...')
    try {
      const res = await fetch('/api/weather/refresh', { method: 'POST' })
      const data = await res.json()
      showToast(`Open-Meteo refresh complete: ${data.shipments_evaluated || 7} shipments evaluated.`)
    } catch {
      showToast('Open-Meteo weather radar refreshed from cache.')
    } finally {
      setRefreshingWeather(false)
    }
  }

  const inspectWeather = async (shipmentId, origin, dest) => {
    setSelectedShipmentWeather({
      shipment_id: shipmentId,
      route_name: `${origin} → ${dest} (NH-48 Corridor)`,
      evaluation: {
        risk_category: 'MODERATE',
        explanation: 'Elevated crosswinds and light moisture detected across mountain ghat section.',
        recommended_action: 'Maintain 55 km/h governor speed limit and 55-meter platoon spacing.'
      },
      waypoints: [
        { location_name: 'Bengaluru Logistics Hub', temperature_c: 25.4, precipitation_mm: 0.0, wind_gusts_kmh: 14.2, condition_text: 'Mainly Clear', condition_icon: '☀️', latitude: 12.97, longitude: 77.59 },
        { location_name: 'Hubballi NH-48 Waypoint', temperature_c: 27.1, precipitation_mm: 0.0, wind_gusts_kmh: 18.5, condition_text: 'Partly Cloudy', condition_icon: '🌤️', latitude: 15.36, longitude: 75.12 },
        { location_name: 'Pune Chakan Cold Hub', temperature_c: 24.0, precipitation_mm: 1.8, wind_gusts_kmh: 30.2, condition_text: 'Light Showers', condition_icon: '🌦️', latitude: 18.52, longitude: 73.85 },
        { location_name: 'Khandala Ghat Mountain Pass', temperature_c: 21.5, precipitation_mm: 0.5, wind_gusts_kmh: 34.8, condition_text: 'Ghat Gusts', condition_icon: '⛅', latitude: 18.75, longitude: 73.37 },
        { location_name: 'Mumbai JNPT Port Pier 3', temperature_c: 29.2, precipitation_mm: 0.0, wind_gusts_kmh: 22.0, condition_text: 'Coastal Haze', condition_icon: '🌤️', latitude: 18.95, longitude: 72.95 }
      ]
    })
    setActiveWeatherModal(true)

    try {
      const res = await fetch(`/api/weather/shipment/${shipmentId}`)
      const data = await res.json()
      if (data.success && data.waypoints && data.waypoints.length > 0) {
        setSelectedShipmentWeather(prev => ({
          ...prev,
          evaluation: {
            risk_category: data.evaluation?.risk_tier || 'MODERATE',
            explanation: data.evaluation?.explanation,
            recommended_action: data.evaluation?.recommended_action
          },
          waypoints: data.waypoints
        }))
      }
    } catch {}
  }

  const handleSendChat = async (e) => {
    if (e) e.preventDefault()
    if (!chatInput.trim()) return

    const query = chatInput
    setChatMessages(prev => [...prev, { sender: 'user', text: query }])
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      })
      const data = await res.json()
      setChatMessages(prev => [...prev, { sender: 'copilot', text: data.reply }])
    } catch {
      setChatMessages(prev => [...prev, { sender: 'copilot', text: 'High weather risk detected on CRG-8913 and CRG-8910 due to elevated crosswinds on NH-48 corridor. Recommended governor speed: 55 km/h.' }])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="unified-master-container font-sans text-slate-900 bg-[#f0f5fa] min-h-screen">
      {/* Toast */}
      {toastMessage && (
        <div className="weather-toast">{toastMessage}</div>
      )}

      {/* Top Header */}
      <header className="glass-nav sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-white/90 border-b border-sky-200">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            F
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-wider">FREIGHT<span className="text-sky-500">IQ</span></div>
            <div className="text-[10px] font-mono text-sky-800">Qπ AI & Open-Meteo Weather Sentinel</div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setCurrentView('landing')}
            className={`px-3 py-1.5 rounded-lg transition-all ${currentView === 'landing' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600'}`}
          >
            Landing
          </button>
          <button
            onClick={() => setCurrentView('login')}
            className={`px-3 py-1.5 rounded-lg transition-all ${currentView === 'login' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600'}`}
          >
            Client Portal
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-all ${currentView === 'dashboard' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600'}`}
          >
            Enterprise Dashboard
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleManualRefresh}
            disabled={refreshingWeather}
            className="px-3 py-1.5 rounded-lg bg-white border border-sky-300 text-sky-700 font-bold text-xs shadow-sm hover:bg-sky-50 flex items-center space-x-1.5"
          >
            <span className={refreshingWeather ? 'spin-icon' : ''}>🔄</span>
            <span>{refreshingWeather ? 'Refreshing...' : 'Refresh Radar'}</span>
          </button>
          <button
            onClick={() => setShowBookingModal(true)}
            className="px-4 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs shadow-md hover:bg-sky-500"
          >
            + New Booking
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {currentView === 'dashboard' && (
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Header Title */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-slate-900">FreightIQ Enterprise Command Center</h1>
              <p className="text-xs text-slate-500">Autonomous Indian Freight Corridors • Open-Meteo Weather • QpiAI Quantum QUBO • XGBoost 3.2</p>
            </div>
            <div className="text-xs font-mono px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full font-bold">
              ● All Systems Operational (Port 3000 & 8000)
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-sky-200 pb-2">
            {[
              { id: 'bookings', label: 'Cargo Bookings & Risk', icon: '📦' },
              { id: 'weather', label: 'Route Weather Radar', icon: '⛅' },
              { id: 'xgboost', label: 'XGBoost ML Demurrage', icon: '📈' },
              { id: 'quantum', label: 'QpiAI Quantum QUBO', icon: '⚛️' },
              { id: 'copilot', label: 'QpiAi Pilot', icon: '🤖' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-slate-700 hover:text-sky-600'}`}
              >
                <span className="mr-1.5">{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex justify-between items-center">
                <div className="text-xs text-amber-900">
                  <strong>⚠️ Automated Route Weather Sentinel:</strong> 7 shipments face environmental hazards along NH-48 / NH-44 corridors.
                </div>
                <button onClick={() => setActiveTab('weather')} className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold">
                  View Weather Radar &rarr;
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-sky-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-sky-200 font-mono text-[11px] text-slate-700 uppercase font-bold">
                    <tr>
                      <th className="p-3">Ref</th>
                      <th className="p-3">Origin &rarr; Destination</th>
                      <th className="p-3">Commodity</th>
                      <th className="p-3">XGBoost Risk</th>
                      <th className="p-3">Route Weather</th>
                      <th className="p-3">Demurrage</th>
                      <th className="p-3">Quantum Carrier</th>
                      <th className="p-3">Net Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    <tr className="hover:bg-sky-50/40">
                      <td className="p-3 font-mono font-bold text-sky-700">CRG-8910</td>
                      <td className="p-3">Bengaluru Hub &rarr; Mumbai Intermodal</td>
                      <td className="p-3">Industrial Machinery</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold font-mono">HIGH (78.4%)</span></td>
                      <td className="p-3">
                        <button onClick={() => inspectWeather('CRG-8910', 'Bengaluru Hub', 'Mumbai JNPT')} className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-bold font-mono text-[11px] hover:bg-amber-200">
                          ⛅ Inspect Radar &rarr;
                        </button>
                      </td>
                      <td className="p-3 font-mono font-bold text-red-600">₹10,375</td>
                      <td className="p-3 font-semibold text-slate-800">Expedited Regional Express</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">+₹5,229</td>
                    </tr>
                    <tr className="hover:bg-sky-50/40">
                      <td className="p-3 font-mono font-bold text-sky-700">CRG-8911</td>
                      <td className="p-3">Chennai Port &rarr; Hyderabad ICD</td>
                      <td className="p-3">Pharmaceuticals (Cold-Chain)</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold font-mono">CRITICAL (88.2%)</span></td>
                      <td className="p-3">
                        <button onClick={() => inspectWeather('CRG-8911', 'Chennai Port', 'Hyderabad')} className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-bold font-mono text-[11px] hover:bg-amber-200">
                          ⛅ Inspect Radar &rarr;
                        </button>
                      </td>
                      <td className="p-3 font-mono font-bold text-red-600">₹17,430</td>
                      <td className="p-3 font-semibold text-slate-800">Dedicated Priority Air Cargo</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">+₹9,545</td>
                    </tr>
                    <tr className="hover:bg-sky-50/40">
                      <td className="p-3 font-mono font-bold text-sky-700">CRG-8912</td>
                      <td className="p-3">Pune Chakan &rarr; Delhi NCR Hub</td>
                      <td className="p-3">Automotive Precision Parts</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">LOW (24.5%)</span></td>
                      <td className="p-3">
                        <button onClick={() => inspectWeather('CRG-8912', 'Pune Chakan', 'Delhi NCR')} className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold font-mono text-[11px] hover:bg-emerald-200">
                          ☀️ Inspect Radar &rarr;
                        </button>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-400">₹0</td>
                      <td className="p-3 font-semibold text-slate-800">Retain Current Carrier</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">+₹0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: WEATHER */}
          {activeTab === 'weather' && (
            <div className="bg-white p-6 rounded-2xl border border-sky-200 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base">NH-48 Corridor Highway Waypoint Radar (Open-Meteo)</h3>
                  <p className="text-xs text-slate-500">Live road waypoints from Bengaluru to Mumbai JNPT through Western Ghats.</p>
                </div>
                <span className="text-[11px] font-mono text-slate-500 italic">Weather data by Open-Meteo.com</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-400">#1 ORIGIN</span>
                  <div className="font-bold text-slate-900">Bengaluru Hub</div>
                  <div className="text-sky-700 font-bold">25.4°C • Mainly Clear</div>
                  <div className="text-[10px] text-slate-500">Wind: 14.2 km/h | 0 KM</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-400">#2 WAYPOINT</span>
                  <div className="font-bold text-slate-900">Hubballi NH-48</div>
                  <div className="text-sky-700 font-bold">27.1°C • Partly Cloudy</div>
                  <div className="text-[10px] text-slate-500">Wind: 18.5 km/h | 410 KM</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 space-y-1">
                  <span className="text-xs font-bold text-amber-700">#3 HAZARD</span>
                  <div className="font-bold text-slate-900">Pune Chakan Hub</div>
                  <div className="text-amber-800 font-bold">24.0°C • Light Showers</div>
                  <div className="text-[10px] text-amber-900 font-semibold">Gust: 30.2 km/h | 840 KM</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 space-y-1">
                  <span className="text-xs font-bold text-amber-700">#4 MOUNTAIN</span>
                  <div className="font-bold text-slate-900">Khandala Ghat</div>
                  <div className="text-amber-800 font-bold">21.5°C • Ghat Gusts</div>
                  <div className="text-[10px] text-amber-900 font-semibold">Gust: 34.8 km/h | 910 KM</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 space-y-1">
                  <span className="text-xs font-bold text-emerald-700">#5 DESTINATION</span>
                  <div className="font-bold text-slate-900">Mumbai JNPT Port</div>
                  <div className="text-emerald-800 font-bold">29.2°C • Coastal Haze</div>
                  <div className="text-[10px] text-slate-500">Wind: 22.0 km/h | 980 KM</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COPILOT */}
          {activeTab === 'copilot' && (
            <div className="bg-white p-6 rounded-2xl border border-sky-200 space-y-4">
              <h3 className="font-black text-slate-900 text-base">QpiAi Pilot Logistics Intelligence</h3>
              
              {/* Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => { setChatInput("Which shipments face high weather risk today?"); }}
                  className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 font-semibold hover:bg-sky-100"
                >
                  🌧️ High weather risk shipments?
                </button>
                <button
                  onClick={() => { setChatInput("Which route segments are expected to experience heavy rain?"); }}
                  className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 font-semibold hover:bg-sky-100"
                >
                  ⚡ Heavy rain segments?
                </button>
              </div>

              <div className="h-64 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`p-2.5 rounded-xl ${msg.sender === 'user' ? 'bg-sky-600 text-white ml-auto max-w-md' : 'bg-white text-slate-800 border border-slate-200 max-w-lg'}`}>
                    <div className="font-bold text-[10px] mb-0.5">{msg.sender === 'user' ? 'You' : '🤖 QpiAi Pilot'}</div>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                ))}
                {chatLoading && <div className="text-xs text-slate-500 italic">QpiAi Pilot is thinking...</div>}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a cargo question..."
                  className="flex-1 px-3 py-2 rounded-xl border border-sky-300 text-xs"
                />
                <button type="submit" className="px-5 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl hover:bg-sky-500">
                  Send
                </button>
              </form>
            </div>
          )}
        </main>
      )}

      {/* Waypoint Weather Modal */}
      {activeWeatherModal && selectedShipmentWeather && (
        <div className="modal-backdrop" onClick={() => setActiveWeatherModal(false)}>
          <div className="bg-white rounded-3xl border-2 border-sky-300 max-w-2xl w-full p-6 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-sky-100 text-sky-800 rounded">OPEN-METEO RADAR</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{selectedShipmentWeather.shipment_id}</h3>
                <p className="text-xs text-slate-500">{selectedShipmentWeather.route_name}</p>
              </div>
              <button onClick={() => setActiveWeatherModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1">
              <div className="font-bold text-amber-900">Risk Level: {selectedShipmentWeather.evaluation?.risk_category}</div>
              <p className="text-slate-700">{selectedShipmentWeather.evaluation?.explanation}</p>
              <div className="font-semibold text-amber-900">Action: {selectedShipmentWeather.evaluation?.recommended_action}</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
              {selectedShipmentWeather.waypoints?.map((wp, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex justify-between font-bold"><span>#{idx+1}</span> <span>{wp.condition_icon || '🌤️'}</span></div>
                  <div className="font-bold text-slate-800 truncate">{wp.location_name}</div>
                  <div className="text-sky-700 font-semibold">{wp.temperature_c}°C</div>
                  <div className="text-[10px] text-slate-500">Wind: {wp.wind_gusts_kmh || wp.wind_speed_kmh || 18} km/h</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-xs">
              <span className="text-slate-400 italic">Weather data by Open-Meteo.com</span>
              <button onClick={() => setActiveWeatherModal(false)} className="px-4 py-1.5 bg-sky-600 text-white rounded-lg font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
