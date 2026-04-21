import { useState, useEffect } from "react"
import { useApp } from "../context/AppContext"
import { movies, theaters } from "../data/mockData"
import AnalyticsTab from "../components/AnalyticsTab"

const API_BASE = "https://movie-booking-backend-k3uc.onrender.com"

export default function AdminPage() {
  var { user, navigate } = useApp()
  var [activeTab, setActiveTab] = useState("dashboard")
  var [scheduleList, setScheduleList] = useState([])
  var [formMsg, setFormMsg] = useState("")
  var [loadingSchedule, setLoadingSchedule] = useState(true)
  var [editingShowtime, setEditingShowtime] = useState(null)

  var [movieId, setMovieId] = useState("")
  var [theaterId, setTheaterId] = useState("")
  var [date, setDate] = useState("")
  var [time, setTime] = useState("")
  var [format, setFormat] = useState("")
  var [screen, setScreen] = useState("")
  var [priceStandard, setPriceStandard] = useState("")
  var [pricePremium, setPricePremium] = useState("")
  var [priceRecliner, setPriceRecliner] = useState("")
  var [totalSeatsInput, setTotalSeatsInput] = useState("96")

  if (!user || !user.isAdmin) {
    navigate("home")
    return null
  }

  // ✅ Load showtimes from backend on mount
  useEffect(function () {
    fetchSchedule()
  }, [])

  function fetchSchedule() {
    setLoadingSchedule(true)
    fetch(API_BASE + "/api/theaters/showtimes")
      .then(function (r) { return r.json() })
      .then(function (data) {
        if (data && data.success) {
          setScheduleList(data.data || [])
        }
      })
      .catch(function () {})
      .finally(function () { setLoadingSchedule(false) })
  }

  function resetForm() {
    setMovieId(""); setTheaterId(""); setDate(""); setTime("")
    setFormat(""); setScreen(""); setPriceStandard(""); setPricePremium("")
    setPriceRecliner(""); setTotalSeatsInput("96"); setEditingShowtime(null)
  }

  function startEdit(show) {
    setEditingShowtime(show)
    setMovieId(String(show.movieId))
    setTheaterId(String(show.theaterId))
    setDate(show.date || "")
    setTime(show.time || "")
    setFormat(show.format || "")
    setScreen(show.screen || "")
    setPriceStandard(String(show.price?.standard || ""))
    setPricePremium(String(show.price?.premium || ""))
    setPriceRecliner(String(show.price?.recliner || ""))
    setTotalSeatsInput(String(show.availableSeats || 96))
    setActiveTab("schedule")
    window.scrollTo(0, 0)
  }

  function handleAddOrUpdateShowtime(e) {
    e.preventDefault()

    if (!movieId || !theaterId || !date || !time || !format || !screen) {
      setFormMsg("Please fill all required fields")
      return
    }

    var payload = {
      movieId: parseInt(movieId),
      theaterId: parseInt(theaterId),
      date: date,
      time: time,
      screen: screen,
      format: format,
      price: {
        standard: parseInt(priceStandard) || 180,
        premium: parseInt(pricePremium) || 280,
        recliner: parseInt(priceRecliner) || 450
      },
      availableSeats: parseInt(totalSeatsInput) || 96
    }

    if (editingShowtime) {
      // ✅ Update existing showtime in backend
      var showtimeId = editingShowtime._id || editingShowtime.id
      fetch(API_BASE + "/api/theaters/showtimes/" + showtimeId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json() })
        .then(function (data) {
          if (data && data.success) {
            setFormMsg("✅ Showtime updated successfully!")
            fetchSchedule()
            resetForm()
          } else {
            setFormMsg("❌ Failed to update: " + (data.message || "Unknown error"))
          }
        })
        .catch(function () { setFormMsg("❌ Network error. Try again.") })
        .finally(function () { setTimeout(function () { setFormMsg("") }, 3000) })
    } else {
      // ✅ Save new showtime to backend
      fetch(API_BASE + "/api/theaters/showtimes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json() })
        .then(function (data) {
          if (data && data.success) {
            setFormMsg("✅ Showtime added successfully!")
            fetchSchedule()
            resetForm()
          } else {
            setFormMsg("❌ Failed to add: " + (data.message || "Unknown error"))
          }
        })
        .catch(function () { setFormMsg("❌ Network error. Try again.") })
        .finally(function () { setTimeout(function () { setFormMsg("") }, 3000) })
    }
  }

  function handleRemoveShowtime(id) {
    if (!window.confirm("Remove this showtime?")) return
    fetch(API_BASE + "/api/theaters/showtimes/" + id, { method: "DELETE" })
      .then(function (r) { return r.json() })
      .then(function (data) {
        if (data && data.success) {
          fetchSchedule()
        }
      })
      .catch(function () {})
  }

  function getMovieTitle(id) {
    for (var i = 0; i < movies.length; i++) {
      if (String(movies[i].id) === String(id)) return movies[i].title
    }
    return "Unknown"
  }

  function getTheaterName(id) {
    for (var i = 0; i < theaters.length; i++) {
      if (String(theaters[i].id) === String(id)) return theaters[i].name
    }
    return "Unknown"
  }

  var totalMovies = movies.length
  var nowShowing = movies.filter(function (m) { return m.status === "now_showing" }).length
  var comingSoon = totalMovies - nowShowing
  var totalSeats = scheduleList.reduce(function (acc, s) { return acc + (s.availableSeats || 0) }, 0)

  return (
    <div className="bg-gray-950 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Admin Panel</h1>
            <p className="text-gray-400 text-sm">Manage movies, schedules and theaters</p>
          </div>
          <div className="bg-red-600/20 border border-red-600/40 text-red-400 text-sm px-4 py-2 rounded-xl">
            👑 Admin: {user.name}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          {[["dashboard","📊","Dashboard"],["schedule","🎬","Manage Schedule"],["movies","🎥","Movies"],["theaters","🏛️","Theaters"],["analytics","📈","Analytics"]].map(function(tab) {
            return (
              <button key={tab[0]} onClick={() => setActiveTab(tab[0])}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab[0] ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}>
                {tab[1]} {tab[2]}
              </button>
            )
          })}
        </div>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                ["Total Movies", totalMovies, "text-blue-400", "bg-blue-900/20 border-blue-800/40"],
                ["Now Showing", nowShowing, "text-green-400", "bg-green-900/20 border-green-800/40"],
                ["Coming Soon", comingSoon, "text-yellow-400", "bg-yellow-900/20 border-yellow-800/40"],
                ["Total Showtimes", scheduleList.length, "text-purple-400", "bg-purple-900/20 border-purple-800/40"],
                ["Theaters", theaters.length, "text-red-400", "bg-red-900/20 border-red-800/40"],
                ["Available Seats", totalSeats, "text-orange-400", "bg-orange-900/20 border-orange-800/40"]
              ].map(function(stat) {
                return (
                  <div key={stat[0]} className={`${stat[3]} border rounded-2xl p-4`}>
                    <p className="text-gray-400 text-xs mb-2">{stat[0]}</p>
                    <p className={`${stat[2]} text-3xl font-black`}>{stat[1]}</p>
                  </div>
                )
              })}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h2 className="text-white font-semibold">All Movies</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-500 text-xs px-5 py-3">Movie</th>
                      <th className="text-left text-gray-500 text-xs px-5 py-3">Genre</th>
                      <th className="text-left text-gray-500 text-xs px-5 py-3">Rating</th>
                      <th className="text-left text-gray-500 text-xs px-5 py-3">IMDB</th>
                      <th className="text-left text-gray-500 text-xs px-5 py-3">Status</th>
                      <th className="text-left text-gray-500 text-xs px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map(function (movie) {
                      return (
                        <tr key={movie.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <img src={movie.poster} alt={movie.title} className="w-8 h-12 object-cover rounded-lg" />
                              <span className="text-white text-sm font-medium">{movie.title}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-400 text-sm">{movie.genre.join(", ")}</td>
                          <td className="px-5 py-3 text-gray-400 text-sm">{movie.rating}</td>
                          <td className="px-5 py-3 text-yellow-400 text-sm">⭐ {movie.imdb}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${movie.status === "now_showing" ? "bg-green-900/40 text-green-400 border border-green-800/40" : "bg-yellow-900/40 text-yellow-400 border border-yellow-800/40"}`}>
                              {movie.status === "now_showing" ? "Now Showing" : "Coming Soon"}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <button onClick={() => { setActiveTab("schedule"); setMovieId(String(movie.id)) }}
                              className="text-indigo-400 hover:text-indigo-300 text-xs bg-indigo-900/20 px-2 py-1 rounded-lg">
                              + Add Showtime
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Schedule management */}
        {activeTab === "schedule" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold">
                  {editingShowtime ? "✏️ Edit Showtime" : "Add New Showtime"}
                </h2>
                {editingShowtime && (
                  <button onClick={resetForm} className="text-gray-400 hover:text-white text-xs bg-gray-800 px-3 py-1 rounded-lg">
                    Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleAddOrUpdateShowtime} className="flex flex-col gap-4">

                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Movie *</label>
                  <select value={movieId} onChange={(e) => setMovieId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500">
                    <option value="">Select Movie</option>
                    {movies.map(function (m) {
                      return <option key={m.id} value={m.id}>{m.title}</option>
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Theater *</label>
                  <select value={theaterId} onChange={(e) => setTheaterId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500">
                    <option value="">Select Theater</option>
                    {theaters.map(function (t) {
                      return <option key={t.id} value={t.id}>{t.name}</option>
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Date *</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Time *</label>
                    <input type="text" value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 10:00 AM"
                      className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Format *</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500">
                      <option value="">Select Format</option>
                      {["2D","3D","IMAX","4DX","Dolby Atmos","Dolby Vision"].map(function(f) {
                        return <option key={f} value={f}>{f}</option>
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Screen *</label>
                    <input type="text" value={screen} onChange={(e) => setScreen(e.target.value)} placeholder="e.g. Screen 1"
                      className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500" />
                  </div>
                </div>

                {/* ✅ Seat layout capacity */}
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Total Seat Capacity</label>
                  <input type="number" value={totalSeatsInput} onChange={(e) => setTotalSeatsInput(e.target.value)} placeholder="96"
                    className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500" />
                  <p className="text-gray-600 text-xs mt-1">Number of seats in this screen for this show</p>
                </div>

                {/* ✅ Pricing */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Pricing (₹)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ["Standard", priceStandard, setPriceStandard, "e.g. 180"],
                      ["Premium", pricePremium, setPricePremium, "e.g. 280"],
                      ["Recliner", priceRecliner, setPriceRecliner, "e.g. 450"]
                    ].map(function(p) {
                      return (
                        <div key={p[0]}>
                          <input type="number" value={p[1]} onChange={(e) => p[2](e.target.value)} placeholder={p[3]}
                            className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-3 py-3 rounded-xl outline-none focus:border-red-500" />
                          <p className="text-gray-600 text-xs mt-1 text-center">{p[0]}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {formMsg && (
                  <p className={`text-sm text-center py-2 rounded-xl ${formMsg.includes("✅") ? "text-green-400 bg-green-900/20" : "text-red-400 bg-red-900/20"}`}>
                    {formMsg}
                  </p>
                )}

                <button type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl">
                  {editingShowtime ? "Update Showtime" : "Add Showtime"}
                </button>
              </form>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold">All Showtimes ({scheduleList.length})</h2>
                <button onClick={fetchSchedule} className="text-gray-400 hover:text-white text-xs bg-gray-800 px-3 py-1 rounded-lg">
                  🔄 Refresh
                </button>
              </div>
              {loadingSchedule ? (
                <p className="text-gray-500 text-sm text-center py-8">Loading showtimes...</p>
              ) : scheduleList.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No showtimes yet. Add one using the form.</p>
              ) : (
                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {scheduleList.map(function (show) {
                    var sid = show._id || show.id
                    return (
                      <div key={sid} className="bg-gray-800 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{getMovieTitle(show.movieId)}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{getTheaterName(show.theaterId)}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-gray-500 text-xs">{show.date}</span>
                              <span className="text-gray-600">•</span>
                              <span className="text-gray-500 text-xs">{show.time}</span>
                              <span className="text-gray-600">•</span>
                              <span className="text-gray-500 text-xs">{show.format}</span>
                              <span className="text-gray-600">•</span>
                              <span className="text-gray-500 text-xs">{show.screen}</span>
                            </div>
                            {show.price && (
                              <p className="text-gray-600 text-xs mt-1">
                                ₹{show.price.standard} / ₹{show.price.premium} / ₹{show.price.recliner}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0 flex flex-col gap-1">
                            <p className="text-green-400 text-xs">{show.availableSeats} seats</p>
                            <button onClick={() => startEdit(show)}
                              className="text-indigo-400 hover:text-indigo-300 text-xs bg-indigo-900/20 px-2 py-1 rounded-lg">
                              Edit
                            </button>
                            <button onClick={() => handleRemoveShowtime(sid)}
                              className="text-red-400 hover:text-red-300 text-xs bg-red-900/20 px-2 py-1 rounded-lg">
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Movies tab */}
        {activeTab === "movies" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {movies.map(function (movie) {
              return (
                <div key={movie.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="relative">
                    <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
                    <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-lg ${movie.status === "now_showing" ? "bg-green-600 text-white" : "bg-yellow-500 text-black"}`}>
                      {movie.status === "now_showing" ? "Showing" : "Soon"}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-white text-sm font-bold truncate">{movie.title}</h3>
                    <p className="text-gray-400 text-xs mt-1">{movie.genre.join(", ")}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-yellow-400 text-xs">⭐ {movie.imdb}</span>
                      <span className="text-gray-500 text-xs">{movie.rating}</span>
                    </div>
                    <button onClick={() => { setActiveTab("schedule"); setMovieId(String(movie.id)) }}
                      className="w-full mt-3 text-xs bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-400 py-1.5 rounded-lg border border-indigo-800/40">
                      + Schedule Showtime
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Theaters tab */}
        {activeTab === "theaters" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {theaters.map(function (theater) {
              var theaterShowtimes = scheduleList.filter(function (s) { return String(s.theaterId) === String(theater.id) })
              var totalAvailableSeats = theaterShowtimes.reduce(function (acc, s) { return acc + (s.availableSeats || 0) }, 0)
              return (
                <div key={theater.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold">{theater.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">📍 {theater.location}</p>
                    </div>
                    <span className="bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded-lg border border-blue-800/40">
                      {theater.screens} Screens
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {theater.facilities.map(function (f) {
                      return <span key={f} className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-lg">{f}</span>
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t border-gray-800 pt-4">
                    <div>
                      <p className="text-gray-500 text-xs">Showtimes</p>
                      <p className="text-white font-bold text-xl">{theaterShowtimes.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Available Seats</p>
                      <p className="text-green-400 font-bold text-xl">{totalAvailableSeats}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === "analytics" && <AnalyticsTab />}

      </div>
    </div>
  )
}