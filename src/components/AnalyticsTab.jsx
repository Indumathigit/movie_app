import { useEffect, useRef } from "react"
import { movies, theaters, showtimes } from "../data/mockData"
import { useApp } from "../context/AppContext"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"
import { Bar, Line, Doughnut } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function AnalyticsTab() {
  var { bookings } = useApp()

  // get movie booking counts
  function getMovieBookingCounts() {
    var counts = {}
    for (var i = 0; i < movies.length; i++) {
      counts[movies[i].title] = 0
    }
    for (var i = 0; i < bookings.length; i++) {
      var title = bookings[i].movie.title
      if (counts[title] !== undefined) {
        counts[title] = counts[title] + 1
      }
    }
    return counts
  }

  // get revenue per movie
  function getRevenuePerMovie() {
    var revenue = {}
    for (var i = 0; i < movies.length; i++) {
      revenue[movies[i].title] = 0
    }
    for (var i = 0; i < bookings.length; i++) {
      var title = bookings[i].movie.title
      var amount = bookings[i].totalAmount
      if (revenue[title] !== undefined) {
        revenue[title] = revenue[title] + amount
      }
    }
    return revenue
  }

  // get theater occupancy
  function getTheaterOccupancy() {
    var occupancy = {}
    for (var i = 0; i < theaters.length; i++) {
      occupancy[theaters[i].name] = 0
    }
    for (var i = 0; i < bookings.length; i++) {
      var showtime = bookings[i].showtime
      for (var j = 0; j < theaters.length; j++) {
        if (theaters[j].id === showtime.theaterId) {
          occupancy[theaters[j].name] = occupancy[theaters[j].name] + bookings[i].seats.length
        }
      }
    }
    return occupancy
  }

  // get bookings per day
  function getBookingsPerDay() {
    var days = {}
    for (var i = 0; i < bookings.length; i++) {
      var date = bookings[i].bookedAt.split("T")[0]
      if (!days[date]) {
        days[date] = 0
      }
      days[date] = days[date] + 1
    }
    return days
  }

  // get seat type breakdown
  function getSeatTypeBreakdown() {
    var types = { standard: 0, premium: 0, recliner: 0 }
    for (var i = 0; i < bookings.length; i++) {
      for (var j = 0; j < bookings[i].seats.length; j++) {
        var type = bookings[i].seats[j].type
        types[type] = types[type] + 1
      }
    }
    return types
  }

  // get total revenue
  function getTotalRevenue() {
    var total = 0
    for (var i = 0; i < bookings.length; i++) {
      total = total + bookings[i].totalAmount
    }
    return total
  }

  // get total seats booked
  function getTotalSeatsBooked() {
    var total = 0
    for (var i = 0; i < bookings.length; i++) {
      total = total + bookings[i].seats.length
    }
    return total
  }

  var movieCounts = getMovieBookingCounts()
  var revenuePerMovie = getRevenuePerMovie()
  var theaterOccupancy = getTheaterOccupancy()
  var bookingsPerDay = getBookingsPerDay()
  var seatTypes = getSeatTypeBreakdown()
  var totalRevenue = getTotalRevenue()
  var totalSeatsBooked = getTotalSeatsBooked()

  // chart options
  var chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#9ca3af" }
      }
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af" },
        grid: { color: "#1f2937" }
      },
      y: {
        ticks: { color: "#9ca3af" },
        grid: { color: "#1f2937" }
      }
    }
  }

  var doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#9ca3af" }
      }
    }
  }

  // bookings per movie bar chart data
  var bookingsChartData = {
    labels: Object.keys(movieCounts),
    datasets: [
      {
        label: "Bookings",
        data: Object.values(movieCounts),
        backgroundColor: "rgba(239, 68, 68, 0.7)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  }

  // revenue per movie bar chart data
  var revenueChartData = {
    labels: Object.keys(revenuePerMovie),
    datasets: [
      {
        label: "Revenue (₹)",
        data: Object.values(revenuePerMovie),
        backgroundColor: "rgba(34, 197, 94, 0.7)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  }

  // theater occupancy bar chart data
  var theaterChartData = {
    labels: Object.keys(theaterOccupancy),
    datasets: [
      {
        label: "Seats Booked",
        data: Object.values(theaterOccupancy),
        backgroundColor: "rgba(168, 85, 247, 0.7)",
        borderColor: "rgba(168, 85, 247, 1)",
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  }

  // bookings per day line chart data
  var lineChartData = {
    labels: Object.keys(bookingsPerDay).length > 0 ? Object.keys(bookingsPerDay) : ["No data"],
    datasets: [
      {
        label: "Bookings Per Day",
        data: Object.values(bookingsPerDay).length > 0 ? Object.values(bookingsPerDay) : [0],
        borderColor: "rgba(251, 191, 36, 1)",
        backgroundColor: "rgba(251, 191, 36, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgba(251, 191, 36, 1)"
      }
    ]
  }

  // seat type doughnut chart data
  var doughnutData = {
    labels: ["Standard", "Premium", "Recliner"],
    datasets: [
      {
        data: [seatTypes.standard, seatTypes.premium, seatTypes.recliner],
        backgroundColor: [
          "rgba(107, 114, 128, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)"
        ],
        borderColor: [
          "rgba(107, 114, 128, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(168, 85, 247, 1)"
        ],
        borderWidth: 1
      }
    ]
  }

  return (
    <div>

      {/* summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-red-900/20 border border-red-800/40 rounded-2xl p-4">
          <p className="text-gray-400 text-xs mb-2">Total Bookings</p>
          <p className="text-red-400 text-3xl font-black">{bookings.length}</p>
        </div>
        <div className="bg-green-900/20 border border-green-800/40 rounded-2xl p-4">
          <p className="text-gray-400 text-xs mb-2">Total Revenue</p>
          <p className="text-green-400 text-3xl font-black">₹{totalRevenue}</p>
        </div>
        <div className="bg-blue-900/20 border border-blue-800/40 rounded-2xl p-4">
          <p className="text-gray-400 text-xs mb-2">Seats Booked</p>
          <p className="text-blue-400 text-3xl font-black">{totalSeatsBooked}</p>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-2xl p-4">
          <p className="text-gray-400 text-xs mb-2">Avg per Booking</p>
          <p className="text-yellow-400 text-3xl font-black">
            ₹{bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0}
          </p>
        </div>
      </div>

      {/* no bookings message */}
      {bookings.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center mb-8">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-white font-semibold mb-1">No booking data yet</p>
          <p className="text-gray-400 text-sm">Make some bookings to see analytics here</p>
        </div>
      )}

      {/* charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* bookings per movie */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Bookings Per Movie</h3>
          <Bar data={bookingsChartData} options={chartOptions} />
        </div>

        {/* revenue per movie */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Revenue Per Movie (₹)</h3>
          <Bar data={revenueChartData} options={chartOptions} />
        </div>

        {/* theater occupancy */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Theater Occupancy</h3>
          <Bar data={theaterChartData} options={chartOptions} />
        </div>

        {/* bookings per day */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Booking Trends</h3>
          <Line data={lineChartData} options={chartOptions} />
        </div>

      </div>

      {/* seat type breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Seat Type Breakdown</h3>
          <div className="max-w-xs mx-auto">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* popular movies list */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Most Popular Movies</h3>
          <div className="flex flex-col gap-3">
            {movies.slice(0, 5).map(function (movie) {
              return (
                <div key={movie.id} className="flex items-center gap-3">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{movie.title}</p>
                    <p className="text-gray-400 text-xs">{movieCounts[movie.title]} bookings</p>
                    <div className="mt-1 bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{
                          width: bookings.length > 0
                            ? (movieCounts[movie.title] / bookings.length * 100) + "%"
                            : "0%"
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-green-400 text-xs font-bold flex-shrink-0">
                    ₹{revenuePerMovie[movie.title]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

    </div>
  )
}