import { useState, useEffect } from "react"
import { useApp } from "../context/AppContext"
import { generateSeats } from "../data/mockData"
import { getBookingsByShowtime } from "../utils/api"

export default function SeatSelectionPage() {
  var {
    selectedMovie,
    selectedShowtime,
    selectedSeats,
    toggleSeat,
    proceedToPayment,
    calculateTotal,
    navigate,
  } = useApp()

  var [seats, setSeats] = useState([])
  var [loadingSeats, setLoadingSeats] = useState(true)

  // ✅ Fetch ALL bookings for this showtime from backend
  useEffect(function() {
    if (!selectedShowtime) return
    setLoadingSeats(true)

    var allSeats = generateSeats(selectedShowtime.id)

    getBookingsByShowtime(selectedShowtime.date, selectedShowtime.time, selectedShowtime.screen)
      .then(function(res) {
        var bookedSeatIds = []
        if (res && res.success && res.data) {
          for (var i = 0; i < res.data.length; i++) {
            var booking = res.data[i]
            for (var j = 0; j < booking.seats.length; j++) {
              bookedSeatIds.push(booking.seats[j].id)
            }
          }
        }

        // mark booked seats as reserved
        for (var i = 0; i < allSeats.length; i++) {
          if (bookedSeatIds.indexOf(allSeats[i].id) !== -1) {
            allSeats[i].status = "reserved"
          }
        }

        setSeats(allSeats)
        setLoadingSeats(false)
      })
      .catch(function() {
        setSeats(allSeats)
        setLoadingSeats(false)
      })
  }, [selectedShowtime])

  function handleBack() {
    navigate("showtimes")
  }

  function handleSeatClick(seat) {
    if (seat.status === "reserved") return
    toggleSeat(seat)
  }

  function isSelected(seat) {
    for (var i = 0; i < selectedSeats.length; i++) {
      if (selectedSeats[i].id === seat.id) return true
    }
    return false
  }

  function getSeatClass(seat) {
    if (isSelected(seat)) return "bg-red-500 border-red-400 text-white scale-110"
    if (seat.status === "reserved") return "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed opacity-50"
    if (seat.type === "recliner") return "bg-purple-900/50 border-purple-600 text-purple-300 hover:bg-purple-600 hover:text-white cursor-pointer"
    if (seat.type === "premium") return "bg-blue-900/50 border-blue-600 text-blue-300 hover:bg-blue-600 hover:text-white cursor-pointer"
    return "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white cursor-pointer"
  }

  function groupByRow() {
    var groups = {}
    for (var i = 0; i < seats.length; i++) {
      var seat = seats[i]
      if (!groups[seat.row]) groups[seat.row] = []
      groups[seat.row].push(seat)
    }
    return groups
  }

  function getSelectedSeatIds() {
    return selectedSeats.map(function(s) { return s.id }).join(", ")
  }

  function getSeatPrice(type) {
    if (!selectedShowtime) return 0
    return selectedShowtime.price[type]
  }

  if (!selectedMovie || !selectedShowtime) {
    navigate("movies")
    return null
  }

  if (loadingSeats) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎬</div>
          <p className="text-white text-lg">Loading seats...</p>
        </div>
      </div>
    )
  }

  var groupedSeats = groupByRow()
  var rows = Object.keys(groupedSeats)

  return (
    <div className="bg-gray-950 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
          ← Back to Showtimes
        </button>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={selectedMovie.poster} alt={selectedMovie.title} className="w-12 h-16 object-cover rounded-lg" />
            <div>
              <h2 className="text-white font-bold">{selectedMovie.title}</h2>
              <p className="text-gray-400 text-sm">{selectedShowtime.time} • {selectedShowtime.format}</p>
              <p className="text-gray-500 text-xs">{selectedShowtime.screen}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs mb-1">Selected Seats</p>
            <p className="text-white font-bold text-lg">{selectedSeats.length > 0 ? getSelectedSeatIds() : "None"}</p>
          </div>
        </div>

        <div className="mb-10 text-center">
          <div className="relative mx-auto max-w-lg">
            <div className="h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full mb-2 opacity-80" />
            <div className="h-8 bg-gradient-to-b from-red-900/30 to-transparent rounded-t-3xl" />
            <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">Screen</p>
          </div>
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="min-w-max mx-auto">
            {rows.map(function(row) {
              var rowSeats = groupedSeats[row]
              return (
                <div key={row} className="flex items-center gap-2 mb-2">
                  <span className="text-gray-500 text-xs w-5 text-center flex-shrink-0">{row}</span>
                  <div className="flex gap-1.5">
                    {rowSeats.map(function(seat, index) {
                      return (
                        <div key={seat.id} className="flex items-center gap-1.5">
                          {index === 6 && <div className="w-4" />}
                          <button
                            onClick={() => handleSeatClick(seat)}
                            className={`w-8 h-8 rounded-t-lg border text-xs font-medium transition-all duration-150 ${getSeatClass(seat)}`}
                            title={seat.id + " - " + seat.type + " - ₹" + getSeatPrice(seat.type)}
                          >
                            {seat.number}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <span className="text-gray-500 text-xs w-5 text-center flex-shrink-0">{row}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-5 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-t-lg border bg-gray-800 border-gray-600" />
            <div><p className="text-gray-300 text-xs">Standard</p><p className="text-gray-500 text-xs">₹{getSeatPrice("standard")}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-t-lg border bg-blue-900/50 border-blue-600" />
            <div><p className="text-gray-300 text-xs">Premium</p><p className="text-gray-500 text-xs">₹{getSeatPrice("premium")}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-t-lg border bg-purple-900/50 border-purple-600" />
            <div><p className="text-gray-300 text-xs">Recliner</p><p className="text-gray-500 text-xs">₹{getSeatPrice("recliner")}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-t-lg border bg-red-500 border-red-400" />
            <p className="text-gray-300 text-xs">Selected</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-t-lg border bg-gray-700 border-gray-600 opacity-50" />
            <p className="text-gray-300 text-xs">Reserved</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-900 border border-gray-800 rounded-2xl p-4 mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              {selectedSeats.length > 0 ? (
                <div>
                  <p className="text-gray-400 text-sm mb-1">{selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} selected</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map(function(seat) {
                      return (
                        <span key={seat.id} className="bg-red-600/20 border border-red-600/40 text-red-400 text-xs px-2 py-0.5 rounded-lg">
                          {seat.id} ({seat.type})
                        </span>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Select seats to continue</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {selectedSeats.length > 0 && (
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="text-white font-bold text-2xl">₹{calculateTotal()}</p>
                </div>
              )}
              <button
                onClick={proceedToPayment}
                disabled={selectedSeats.length === 0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl"
              >
                Proceed to Payment →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}