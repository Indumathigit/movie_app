import { useState } from "react"
import { useApp } from "../context/AppContext"

export default function MyBookingsPage() {
  var { bookings, cancelBooking, navigate, user } = useApp()
  var [cancelConfirmId, setCancelConfirmId] = useState(null)

  function handleCancel(bookingId) {
    cancelBooking(bookingId)
    setCancelConfirmId(null)
  }

  function formatDate(isoString) {
    var d = new Date(isoString)
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear()
  }

  function getGrandTotal(booking) {
    var convenience = Math.round(booking.totalAmount * 0.02)
    return booking.totalAmount + convenience
  }

  function getSeats(booking) {
    var ids = []
    for (var i = 0; i < booking.seats.length; i++) {
      ids.push(booking.seats[i].id)
    }
    return ids
  }

  // ✅ Check full datetime including time - not just date
  function isPastBooking(booking) {
    if (!booking.showtime || !booking.showtime.date) return false
    var now = new Date()
    var showDate = booking.showtime.date
    var showTime = booking.showtime.time // e.g. "02:00 PM"

    // parse showtime
    var timeParts = showTime.match(/(\d+):(\d+)\s(AM|PM)/)
    if (!timeParts) return false

    var showHour = parseInt(timeParts[1])
    var showMinute = parseInt(timeParts[2])
    var period = timeParts[3]

    if (period === "PM" && showHour !== 12) showHour += 12
    if (period === "AM" && showHour === 12) showHour = 0

    var showDateTime = new Date(showDate + "T00:00:00")
    showDateTime.setHours(showHour, showMinute, 0, 0)

    // ✅ Past if show time has already passed
    return showDateTime < now
  }

  function isCancelled(booking) {
    return booking.status === "cancelled"
  }

  if (!user) {
    navigate("home")
    return null
  }

  return (
    <div className="bg-gray-950 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">My Bookings</h1>
            <p className="text-gray-400 text-sm">{bookings.length} booking{bookings.length !== 1 ? "s" : ""} found</p>
          </div>
          <button onClick={() => navigate("movies")} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl">
            + Book More
          </button>
        </div>

        {bookings.length > 0 ? (
          <div className="flex flex-col gap-5">
            {bookings.map(function (booking) {
              var seats = getSeats(booking)
              var past = isPastBooking(booking)
              var cancelled = isCancelled(booking)
              var bookingKey = booking.bookingId || booking.id || booking._id

              return (
                <div key={bookingKey} className={`bg-gray-900 border rounded-2xl overflow-hidden ${cancelled ? "border-red-900/50 opacity-75" : past ? "border-gray-700" : "border-gray-800"}`}>

                  <div className="flex gap-4 p-5">
                    <img src={booking.movie.poster} alt={booking.movie.title}
                      className={`w-20 h-28 object-cover rounded-xl flex-shrink-0 ${cancelled ? "grayscale" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-white font-bold text-lg truncate">{booking.movie.title}</h3>
                        {/* ✅ Cancelled checked first, then past, then confirmed */}
                        {cancelled ? (
                          <span className="bg-red-900/40 border border-red-700/50 text-red-400 text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0">Cancelled</span>
                        ) : past ? (
                          <span className="bg-gray-800 border border-gray-700 text-gray-400 text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0">Completed</span>
                        ) : (
                          <span className="bg-green-900/40 border border-green-700/50 text-green-400 text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0">Confirmed</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{booking.movie.genre.join(", ")} • {booking.showtime.format}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <p className="text-gray-500 text-xs">Movie Date</p>
                          <p className="text-white text-sm font-medium">
                            {booking.showtime.date
                              ? new Date(booking.showtime.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : formatDate(booking.bookedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Time</p>
                          <p className="text-white text-sm font-medium">{booking.showtime.time}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Screen</p>
                          <p className="text-white text-sm font-medium">{booking.showtime.screen}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Amount Paid</p>
                          <p className="text-green-400 text-sm font-bold">₹{getGrandTotal(booking)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-500 text-xs">Seats:</span>
                      {seats.map(function (seatId) {
                        return (
                          <span key={seatId} className="bg-red-600/20 border border-red-600/40 text-red-400 text-xs px-2 py-1 rounded-lg">
                            {seatId}
                          </span>
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-xs font-mono">{bookingKey}</span>
                      <button onClick={() => window.print()}
                        className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg">
                        🖨️ Print
                      </button>
                      {/* ✅ Only show cancel for future confirmed bookings */}
                      {!cancelled && !past && (
                        <button onClick={() => setCancelConfirmId(bookingKey)}
                          className="text-xs bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 text-red-400 px-3 py-1.5 rounded-lg">
                          Cancel
                        </button>
                      )}
                      {past && !cancelled && (
                        <span className="text-xs text-gray-500 px-3 py-1.5">Past booking</span>
                      )}
                      {cancelled && (
                        <span className="text-xs text-red-500 px-3 py-1.5">Booking cancelled</span>
                      )}
                    </div>
                  </div>

                  {/* cancel confirmation */}
                  {cancelConfirmId === bookingKey && (
                    <div className="border-t border-red-800/40 bg-red-900/10 px-5 py-4 flex items-center justify-between gap-4">
                      <p className="text-red-300 text-sm">Are you sure you want to cancel this booking?</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCancelConfirmId(null)}
                          className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg">
                          No, Keep it
                        </button>
                        <button onClick={() => handleCancel(bookingKey)}
                          className="text-xs bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium">
                          Yes, Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🎟️</div>
            <h3 className="text-white text-xl font-bold mb-2">No bookings yet</h3>
            <p className="text-gray-400 text-sm mb-6">You have not booked any tickets yet</p>
            <button onClick={() => navigate("movies")} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-medium">
              Browse Movies
            </button>
          </div>
        )}
      </div>
    </div>
  )
}