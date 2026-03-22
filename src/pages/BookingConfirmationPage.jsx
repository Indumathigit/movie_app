import { useApp } from "../context/AppContext"

export default function BookingConfirmationPage() {
  var { currentBooking, navigate } = useApp()

  function handleGoHome() {
    navigate("home")
  }

  function handleMyBookings() {
    navigate("my-bookings")
  }

  function handlePrint() {
    window.print()
  }

  function formatDate(isoString) {
    var d = new Date(isoString)
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear()
  }

  function formatTime(isoString) {
    var d = new Date(isoString)
    var h = d.getHours()
    var m = d.getMinutes()
    var ampm = h >= 12 ? "PM" : "AM"
    h = h % 12 || 12
    var mins = m < 10 ? "0" + m : m
    return h + ":" + mins + " " + ampm
  }

  if (!currentBooking) {
    navigate("home")
    return null
  }

  var booking = currentBooking
  var convenience = Math.round(booking.totalAmount * 0.02)
  var grandTotal = booking.totalAmount + convenience

  return (
    <div className="bg-gray-950 min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* success message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Booking Confirmed!</h1>
          <p className="text-gray-400 text-sm">Your tickets have been booked successfully</p>
        </div>

        {/* ticket card */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden mb-6">

          {/* movie backdrop */}
          <div className="relative">
            <img
              src={booking.movie.backdrop}
              alt={booking.movie.title}
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
            <div className="absolute bottom-4 left-5">
              <h2 className="text-white text-2xl font-black">{booking.movie.title}</h2>
              <p className="text-gray-300 text-sm">{booking.movie.genre.join(", ")}</p>
            </div>
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur rounded-xl px-3 py-2">
              <p className="text-gray-400 text-xs">Booking ID</p>
              <p className="text-white font-mono font-bold text-sm">{booking.id}</p>
            </div>
          </div>

          {/* dashed divider */}
          <div className="flex items-center px-5 py-3">
            <div className="w-5 h-5 bg-gray-950 rounded-full -ml-8 flex-shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-gray-700 mx-2" />
            <div className="w-5 h-5 bg-gray-950 rounded-full -mr-8 flex-shrink-0" />
          </div>

          {/* booking details */}
          <div className="px-5 pb-5">

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-gray-500 text-xs mb-1">Date</p>
                <p className="text-white font-semibold text-sm">{formatDate(booking.bookedAt)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Show Time</p>
                <p className="text-white font-semibold text-sm">{booking.showtime.time}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Screen</p>
                <p className="text-white font-semibold text-sm">{booking.showtime.screen}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Format</p>
                <p className="text-white font-semibold text-sm">{booking.showtime.format}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Booked By</p>
                <p className="text-white font-semibold text-sm">{booking.user.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Payment</p>
                <p className="text-white font-semibold text-sm capitalize">{booking.paymentDetails.method}</p>
              </div>
            </div>

            {/* seats */}
            <div className="mb-5">
              <p className="text-gray-500 text-xs mb-2">Seats ({booking.seats.length})</p>
              <div className="flex flex-wrap gap-2">
                {booking.seats.map(function (seat) {
                  return (
                    <div
                      key={seat.id}
                      className="bg-red-600/20 border border-red-600/50 rounded-xl px-3 py-2 text-center"
                    >
                      <p className="text-red-400 font-bold text-sm">{seat.id}</p>
                      <p className="text-gray-500 text-xs capitalize">{seat.type}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* price breakdown */}
            <div className="bg-gray-800 rounded-2xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Ticket Amount</span>
                <span className="text-white">₹{booking.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Convenience Fee</span>
                <span className="text-white">₹{convenience}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-gray-700">
                <span className="text-white">Total Paid</span>
                <span className="text-green-400 text-lg">₹{grandTotal}</span>
              </div>
            </div>

            {/* transaction info */}
            <div className="mt-4 text-center">
              <p className="text-gray-600 text-xs">
                Transaction ID: <span className="text-gray-400 font-mono">{booking.paymentDetails.transactionId}</span>
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Paid at: {formatTime(booking.paymentDetails.paidAt)}
              </p>
            </div>

          </div>

          {/* barcode */}
          <div className="border-t border-dashed border-gray-700 px-5 py-5 text-center">
            <div className="flex justify-center gap-0.5 mb-2">
              {Array.from({ length: 40 }).map(function (_, i) {
                var width = i % 3 === 0 ? "3px" : "2px"
                var height = i % 4 === 0 ? "40px" : "30px"
                return (
                  <div
                    key={i}
                    className="bg-white"
                    style={{ width: width, height: height }}
                  />
                )
              })}
            </div>
            <p className="text-gray-600 text-xs font-mono">{booking.id}</p>
            <p className="text-gray-600 text-xs mt-1">Show this at the cinema entrance</p>
          </div>

        </div>

        {/* action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handlePrint}
            className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
          >
            🖨️ Print Ticket
          </button>
          <button
            onClick={handleMyBookings}
            className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
          >
            📋 My Bookings
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            🎬 Book More
          </button>
        </div>

        {/* confirmation note */}
        <div className="bg-blue-900/20 border border-blue-800/40 rounded-2xl p-4 text-center">
          <p className="text-blue-400 text-sm font-medium mb-1">📧 Confirmation Sent</p>
          <p className="text-gray-400 text-xs">
            A booking confirmation has been sent to <span className="text-white">{booking.user.email}</span>
          </p>
        </div>

      </div>
    </div>
  )
}