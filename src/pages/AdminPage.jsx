import { useState } from "react"
import { useApp } from "../context/AppContext"
import { movies, theaters, showtimes } from "../data/mockData"

export default function AdminPage() {
  var { user, navigate } = useApp()
  var [activeTab, setActiveTab] = useState("dashboard")
  var [scheduleList, setScheduleList] = useState(showtimes)
  var [formMsg, setFormMsg] = useState("")

  var [movieId, setMovieId] = useState("")
  var [theaterId, setTheaterId] = useState("")
  var [date, setDate] = useState("")
  var [time, setTime] = useState("")
  var [format, setFormat] = useState("")
  var [screen, setScreen] = useState("")
  var [priceStandard, setPriceStandard] = useState("")
  var [pricePremium, setPricePremium] = useState("")
  var [priceRecliner, setPriceRecliner] = useState("")

  if (!user || !user.isAdmin) {
    navigate("home")
    return null
  }

  var totalMovies = movies.length
  var nowShowing = 0
  var comingSoon = 0

  for (var i = 0; i < movies.length; i++) {
    if (movies[i].status === "now_showing") {
      nowShowing = nowShowing + 1
    } else {
      comingSoon = comingSoon + 1
    }
  }

  var totalSeats = 0
  for (var i = 0; i < scheduleList.length; i++) {
    totalSeats = totalSeats + scheduleList[i].availableSeats
  }

  function getMovieTitle(id) {
    for (var i = 0; i < movies.length; i++) {
      if (movies[i].id === id) return movies[i].title
    }
    return "Unknown"
  }

  function getTheaterName(id) {
    for (var i = 0; i < theaters.length; i++) {
      if (theaters[i].id === id) return theaters[i].name
    }
    return "Unknown"
  }

  function handleAddShowtime(e) {
    e.preventDefault()

    if (!movieId || !theaterId || !date || !time || !format || !screen) {
      setFormMsg("Please fill all required fields")
      return
    }

    var newShowtime = {
      id: scheduleList.length + 100,
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
      availableSeats: 96
    }

    setScheduleList([...scheduleList, newShowtime])
    setFormMsg("Showtime added successfully!")

    setMovieId("")
    setTheaterId("")
    setDate("")
    setTime("")
    setFormat("")
    setScreen("")
    setPriceStandard("")
    setPricePremium("")
    setPriceRecliner("")

    setTimeout(function () { setFormMsg("") }, 3000)
  }

  function handleRemoveShowtime(id) {
    var newList = []
    for (var i = 0; i < scheduleList.length; i++) {
      if (scheduleList[i].id !== id) {
        newList.push(scheduleList[i])
      }
    }
    setScheduleList(newList)
  }

  return (
    <div className="bg-gray-950 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Admin Panel</h1>
            <p className="text-gray-400 text-sm">Manage movies, schedules and theaters</p>
          </div>
          <div className="bg-red-600/20 border border-red-600/40 text-red-400 text-sm px-4 py-2 rounded-xl">
            👑 Admin: {user.name}
          </div>
        </div>

        {/* tabs */}
        <div className="flex gap-2 mb-8 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "dashboard" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "schedule" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            🎬 Manage Schedule
          </button>
          <button
            onClick={() => setActiveTab("movies")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "movies" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            🎥 Movies
          </button>
          <button
            onClick={() => setActiveTab("theaters")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "theaters" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            🏛️ Theaters
          </button>
        </div>

        {/* dashboard tab */}
        {activeTab === "dashboard" && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-blue-900/20 border border-blue-800/40 rounded-2xl p-4">
                <p className="text-gray-400 text-xs mb-2">Total Movies</p>
                <p className="text-blue-400 text-3xl font-black">{totalMovies}</p>
              </div>
              <div className="bg-green-900/20 border border-green-800/40 rounded-2xl p-4">
                <p className="text-gray-400 text-xs mb-2">Now Showing</p>
                <p className="text-green-400 text-3xl font-black">{nowShowing}</p>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-2xl p-4">
                <p className="text-gray-400 text-xs mb-2">Coming Soon</p>
                <p className="text-yellow-400 text-3xl font-black">{comingSoon}</p>
              </div>
              <div className="bg-purple-900/20 border border-purple-800/40 rounded-2xl p-4">
                <p className="text-gray-400 text-xs mb-2">Total Showtimes</p>
                <p className="text-purple-400 text-3xl font-black">{scheduleList.length}</p>
              </div>
              <div className="bg-red-900/20 border border-red-800/40 rounded-2xl p-4">
                <p className="text-gray-400 text-xs mb-2">Theaters</p>
                <p className="text-red-400 text-3xl font-black">{theaters.length}</p>
              </div>
              <div className="bg-orange-900/20 border border-orange-800/40 rounded-2xl p-4">
                <p className="text-gray-400 text-xs mb-2">Available Seats</p>
                <p className="text-orange-400 text-3xl font-black">{totalSeats}</p>
              </div>
            </div>

            {/* movies table */}
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
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map(function (movie) {
                      return (
                        <tr key={movie.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={movie.poster}
                                alt={movie.title}
                                className="w-8 h-12 object-cover rounded-lg"
                              />
                              <span className="text-white text-sm font-medium">{movie.title}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-400 text-sm">{movie.genre.join(", ")}</td>
                          <td className="px-5 py-3 text-gray-400 text-sm">{movie.rating}</td>
                          <td className="px-5 py-3 text-yellow-400 text-sm">⭐ {movie.imdb}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                              movie.status === "now_showing"
                                ? "bg-green-900/40 text-green-400 border border-green-800/40"
                                : "bg-yellow-900/40 text-yellow-400 border border-yellow-800/40"
                            }`}>
                              {movie.status === "now_showing" ? "Now Showing" : "Coming Soon"}
                            </span>
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

        {/* schedule tab */}
        {activeTab === "schedule" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* add showtime form */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-5">Add New Showtime</h2>
              <form onSubmit={handleAddShowtime} className="flex flex-col gap-4">

                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Movie</label>
                  <select
                    value={movieId}
                    onChange={(e) => setMovieId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500"
                  >
                    <option value="">Select Movie</option>
                    {movies.map(function (m) {
                      return <option key={m.id} value={m.id}>{m.title}</option>
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Theater</label>
                  <select
                    value={theaterId}
                    onChange={(e) => setTheaterId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500"
                  >
                    <option value="">Select Theater</option>
                    {theaters.map(function (t) {
                      return <option key={t.id} value={t.id}>{t.name}</option>
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Time</label>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500"
                    >
                      <option value="">Select Format</option>
                      <option value="2D">2D</option>
                      <option value="3D">3D</option>
                      <option value="IMAX">IMAX</option>
                      <option value="4DX">4DX</option>
                      <option value="Dolby Atmos">Dolby Atmos</option>
                      <option value="Dolby Vision">Dolby Vision</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Screen</label>
                    <input
                      type="text"
                      value={screen}
                      onChange={(e) => setScreen(e.target.value)}
                      placeholder="e.g. Screen 1"
                      className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Pricing (₹)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <input
                        type="number"
                        value={priceStandard}
                        onChange={(e) => setPriceStandard(e.target.value)}
                        placeholder="Standard"
                        className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-3 py-3 rounded-xl outline-none focus:border-red-500"
                      />
                      <p className="text-gray-600 text-xs mt-1 text-center">Standard</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={pricePremium}
                        onChange={(e) => setPricePremium(e.target.value)}
                        placeholder="Premium"
                        className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-3 py-3 rounded-xl outline-none focus:border-red-500"
                      />
                      <p className="text-gray-600 text-xs mt-1 text-center">Premium</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={priceRecliner}
                        onChange={(e) => setPriceRecliner(e.target.value)}
                        placeholder="Recliner"
                        className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm px-3 py-3 rounded-xl outline-none focus:border-red-500"
                      />
                      <p className="text-gray-600 text-xs mt-1 text-center">Recliner</p>
                    </div>
                  </div>
                </div>

                {formMsg && (
                  <p className={`text-sm text-center py-2 rounded-xl ${
                    formMsg.includes("success")
                      ? "text-green-400 bg-green-900/20"
                      : "text-red-400 bg-red-900/20"
                  }`}>
                    {formMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl"
                >
                  Add Showtime
                </button>
              </form>
            </div>

            {/* showtimes list */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-5">
                All Showtimes ({scheduleList.length})
              </h2>
              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                {scheduleList.map(function (show) {
                  return (
                    <div
                      key={show.id}
                      className="bg-gray-800 rounded-xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {getMovieTitle(show.movieId)}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {getTheaterName(show.theaterId)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-500 text-xs">{show.date}</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500 text-xs">{show.time}</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500 text-xs">{show.format}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-green-400 text-xs mb-1">{show.availableSeats} seats</p>
                        <button
                          onClick={() => handleRemoveShowtime(show.id)}
                          className="text-red-400 hover:text-red-300 text-xs bg-red-900/20 px-2 py-1 rounded-lg"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* movies tab */}
        {activeTab === "movies" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {movies.map(function (movie) {
              return (
                <div
                  key={movie.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover"
                    />
                    <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-lg ${
                      movie.status === "now_showing"
                        ? "bg-green-600 text-white"
                        : "bg-yellow-500 text-black"
                    }`}>
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
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* theaters tab */}
        {activeTab === "theaters" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {theaters.map(function (theater) {
              var theaterShowtimes = []
              for (var i = 0; i < scheduleList.length; i++) {
                if (scheduleList[i].theaterId === theater.id) {
                  theaterShowtimes.push(scheduleList[i])
                }
              }
              var totalAvailableSeats = 0
              for (var i = 0; i < theaterShowtimes.length; i++) {
                totalAvailableSeats = totalAvailableSeats + theaterShowtimes[i].availableSeats
              }
              return (
                <div
                  key={theater.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
                >
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
                      return (
                        <span key={f} className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-lg">
                          {f}
                        </span>
                      )
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

      </div>
    </div>
  )
}