 import { useState, useEffect } from "react"
import { useApp } from "../context/AppContext"
import { showtimes, theaters } from "../data/mockData"
import { getBookingsByShowtime } from "../utils/api"

export default function ShowtimesPage() {
  var { selectedMovie, selectedDate, setSelectedDate, selectShowtime, navigate } = useApp()
  var [selectedTheaterId, setSelectedTheaterId] = useState("all")
  var [bookedCountMap, setBookedCountMap] = useState({})

  // ✅ Fetch booked seat counts for all showtimes of this movie on selected date
  useEffect(function() {
    if (!selectedMovie) return

    var movieShowtimes = showtimes.filter(function(s) {
      return s.movieId === selectedMovie.id && s.date === selectedDate
    })

    movieShowtimes.forEach(function(show) {
      getBookingsByShowtime(show.date, show.time, show.screen)
        .then(function(res) {
          if (res && res.success && res.data) {
            var bookedCount = 0
            res.data.forEach(function(booking) {
              bookedCount += booking.seats.length
            })
            setBookedCountMap(function(prev) {
              var updated = Object.assign({}, prev)
              updated[show.id] = bookedCount
              return updated
            })
          }
        })
        .catch(function() {})
    })
  }, [selectedMovie, selectedDate])

  function handleBack() {
    navigate("movies")
  }

  function getDuration(mins) {
    var hours = Math.floor(mins / 60)
    var minutes = mins % 60
    return hours + "h " + minutes + "m"
  }

  function getNextDates() {
    var dates = []
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    for (var i = 0; i < 7; i++) {
      var d = new Date()
      d.setDate(d.getDate() + i)
      dates.push({
        value: d.toISOString().split("T")[0],
        day: days[d.getDay()],
        date: d.getDate(),
        month: months[d.getMonth()]
      })
    }
    return dates
  }

  function getFilteredShowtimes() {
    var now = new Date()
    var currentHour = now.getHours()
    var currentMinute = now.getMinutes()
    var todayDate = now.toISOString().split("T")[0]

    var result = []
    for (var i = 0; i < showtimes.length; i++) {
      var show = showtimes[i]
      if (show.movieId !== selectedMovie.id) continue
      if (show.date !== selectedDate) continue
      if (selectedTheaterId !== "all" && show.theaterId !== parseInt(selectedTheaterId)) continue

      if (show.date === todayDate) {
        var timeParts = show.time.match(/(\d+):(\d+)\s(AM|PM)/)
        if (timeParts) {
          var showHour = parseInt(timeParts[1])
          var showMinute = parseInt(timeParts[2])
          var period = timeParts[3]
          if (period === "PM" && showHour !== 12) showHour += 12
          if (period === "AM" && showHour === 12) showHour = 0
          var showTotalMins = showHour * 60 + showMinute
          var nowTotalMins = currentHour * 60 + currentMinute + 30
          if (showTotalMins < nowTotalMins) continue
        }
      }

      result.push(show)
    }
    return result
  }

  function groupByTheater(list) {
    var groups = {}
    for (var i = 0; i < list.length; i++) {
      var show = list[i]
      var key = show.theaterId
      if (!groups[key]) groups[key] = []
      groups[key].push(show)
    }
    return groups
  }

  function getTheaterById(id) {
    for (var i = 0; i < theaters.length; i++) {
      if (theaters[i].id === id) return theaters[i]
    }
    return null
  }

  function getAvailabilityColor(seats) {
    if (seats <= 10) return "text-red-400"
    if (seats <= 30) return "text-yellow-400"
    return "text-green-400"
  }

  function getAvailabilityLabel(seats) {
    if (seats <= 0) return "Sold Out"
    if (seats <= 10) return "Almost Full"
    if (seats <= 30) return "Filling Fast"
    return "Available"
  }

  // ✅ Calculate real available seats
  function getAvailableSeats(show) {
    var booked = bookedCountMap[show.id] || 0
    var available = show.availableSeats - booked
    return available < 0 ? 0 : available
  }

  if (!selectedMovie) {
    navigate("movies")
    return null
  }

  var dates = getNextDates()
  var filteredShowtimes = getFilteredShowtimes()
  var groupedShowtimes = groupByTheater(filteredShowtimes)
  var theaterIds = Object.keys(groupedShowtimes)

  return (
    <div className="bg-gray-950 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
          ← Back to Movies
        </button>

        <div className="flex gap-6 mb-8 bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <img src={selectedMovie.poster} alt={selectedMovie.title} className="w-24 h-36 object-cover rounded-xl flex-shrink-0" />
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">NOW SHOWING</span>
              <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">{selectedMovie.rating}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{selectedMovie.title}</h1>
            <div className="flex items-center gap-3 text-gray-400 text-sm mb-2">
              <span>⭐ {selectedMovie.imdb}</span>
              <span>•</span>
              <span>{getDuration(selectedMovie.duration)}</span>
              <span>•</span>
              <span>{selectedMovie.genre.join(", ")}</span>
              <span>•</span>
              <span>{selectedMovie.language}</span>
            </div>
            <p className="text-gray-500 text-xs">Director: {selectedMovie.director}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-white font-semibold mb-3">Select Date</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map(function(d) {
              return (
                <button key={d.value} onClick={() => setSelectedDate(d.value)}
                  className={`flex flex-col items-center px-4 py-3 rounded-xl border flex-shrink-0 min-w-[64px] ${
                    selectedDate === d.value ? "bg-red-600 border-red-600 text-white" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600"
                  }`}>
                  <span className="text-xs font-medium">{d.day}</span>
                  <span className="text-lg font-bold">{d.date}</span>
                  <span className="text-xs">{d.month}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-white font-semibold mb-3">Select Theater</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedTheaterId("all")}
              className={`text-sm px-4 py-2 rounded-xl border ${selectedTheaterId === "all" ? "bg-red-600 border-red-600 text-white" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600"}`}>
              All Theaters
            </button>
            {theaters.map(function(t) {
              return (
                <button key={t.id} onClick={() => setSelectedTheaterId(String(t.id))}
                  className={`text-sm px-4 py-2 rounded-xl border ${selectedTheaterId === String(t.id) ? "bg-red-600 border-red-600 text-white" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600"}`}>
                  {t.name}
                </button>
              )
            })}
          </div>
        </div>

        {theaterIds.length > 0 ? (
          <div className="flex flex-col gap-5">
            {theaterIds.map(function(theaterId) {
              var theater = getTheaterById(parseInt(theaterId))
              var theaterShowtimes = groupedShowtimes[theaterId]
              return (
                <div key={theaterId} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">{theater.name}</h3>
                      <p className="text-gray-400 text-sm">📍 {theater.location}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                      {theater.facilities.map(function(f) {
                        return <span key={f} className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-lg">{f}</span>
                      })}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {theaterShowtimes.map(function(show) {
                      var availableSeats = getAvailableSeats(show)
                      var isSoldOut = availableSeats <= 0
                      return (
                        <button key={show.id} onClick={() => !isSoldOut && selectShowtime(show)}
                          disabled={isSoldOut}
                          className={`group border rounded-xl p-3 text-left min-w-[140px] ${
                            isSoldOut
                              ? "bg-gray-900 border-gray-700 opacity-50 cursor-not-allowed"
                              : "bg-gray-800 hover:bg-red-600 border-gray-700 hover:border-red-600"
                          }`}>
                          <p className="text-white font-bold text-lg mb-1">{show.time}</p>
                          <p className="text-gray-400 group-hover:text-red-200 text-xs mb-2">{show.format} • {show.screen}</p>
                          <p className="text-green-400 text-xs font-medium mb-1">From ₹{show.price.standard}</p>
                          {/* ✅ Dynamic available seats */}
                          <p className={`text-xs font-medium ${getAvailabilityColor(availableSeats)}`}>
                            {getAvailabilityLabel(availableSeats)} • {availableSeats} seats
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-white text-xl font-bold mb-2">No showtimes available</h3>
            <p className="text-gray-400 text-sm">Try selecting a different date or theater</p>
          </div>
        )}

        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Seat Categories</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-purple-500 flex-shrink-0" />
              <div><p className="text-white text-sm font-medium">Recliner</p><p className="text-gray-400 text-xs">Rows A-B • ₹450+</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-blue-500 flex-shrink-0" />
              <div><p className="text-white text-sm font-medium">Premium</p><p className="text-gray-400 text-xs">Rows C-E • ₹280+</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-gray-500 flex-shrink-0" />
              <div><p className="text-white text-sm font-medium">Standard</p><p className="text-gray-400 text-xs">Rows F-H • ₹180+</p></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}