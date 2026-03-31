import { createContext, useContext, useState, useEffect } from "react"
import { createBooking, cancelBooking as cancelBookingApi, getUserBookings } from "../utils/api"

export var AppContext = createContext(null)

export function useApp() {
  return useContext(AppContext)
}

export function AppProvider({ children }) {

  // load user from localStorage
  var savedUser = null
  try {
    var u = localStorage.getItem("popcornpass_user")
    if (u) savedUser = JSON.parse(u)
  } catch (e) { }

  // load bookings from localStorage
  var savedBookings = []
  try {
    var b = localStorage.getItem("popcornpass_bookings")
    if (b) savedBookings = JSON.parse(b)
  } catch (e) { }

  var [currentPage, setCurrentPage] = useState("home")
  var [selectedMovie, setSelectedMovie] = useState(null)
  var [selectedShowtime, setSelectedShowtime] = useState(null)
 var [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  var [selectedSeats, setSelectedSeats] = useState([])
  var [user, setUser] = useState(savedUser)
  var [showAuthModal, setShowAuthModal] = useState(false)
  var [bookings, setBookings] = useState(savedBookings)
  var [currentBooking, setCurrentBooking] = useState(null)
  var [searchQuery, setSearchQuery] = useState("")
  var [selectedGenre, setSelectedGenre] = useState("All")

 useEffect(function () {
  if (savedUser && savedUser.email) {
    getUserBookings(savedUser.email)
      .then(function (res) {
        if (res && res.success && res.data && res.data.length > 0) {
          // normalize backend bookings to have id field
          var normalized = res.data.map(function(b) {
            return Object.assign({}, b, { id: b.bookingId || b._id })
          })
          setBookings(normalized)
          localStorage.setItem("popcornpass_bookings", JSON.stringify(normalized))
        }
      })
      .catch(function (err) {
        console.log("Could not refresh bookings on load:", err)
      })
  }
}, [])

  function navigate(page) {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  function selectMovie(movie) {
    setSelectedMovie(movie)
    setSelectedSeats([])
    setSelectedShowtime(null)
    navigate("showtimes")
  }

  function selectShowtime(showtime) {
    setSelectedShowtime(showtime)
    setSelectedSeats([])
    navigate("seats")
  }

  function toggleSeat(seat) {
    var alreadySelected = false
    for (var i = 0; i < selectedSeats.length; i++) {
      if (selectedSeats[i].id === seat.id) {
        alreadySelected = true
        break
      }
    }

    if (alreadySelected) {
      var newSeats = []
      for (var i = 0; i < selectedSeats.length; i++) {
        if (selectedSeats[i].id !== seat.id) {
          newSeats.push(selectedSeats[i])
        }
      }
      setSelectedSeats(newSeats)
    } else {
      if (selectedSeats.length >= 8) {
        alert("You can select maximum 8 seats")
        return
      }
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  function calculateTotal() {
    if (!selectedShowtime) return 0
    var total = 0
    for (var i = 0; i < selectedSeats.length; i++) {
      var seat = selectedSeats[i]
      total = total + selectedShowtime.price[seat.type]
    }
    return total
  }

  function proceedToPayment() {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat")
      return
    }
    navigate("payment")
  }
function confirmBooking(paymentDetails) {
  var newBooking = {
    id: "BK" + Date.now(),
    bookingId: "BK" + Date.now(),
    movie: selectedMovie,
    showtime: selectedShowtime,
    seats: selectedSeats,
    totalAmount: calculateTotal(),
    paymentDetails: paymentDetails,
    bookedAt: new Date().toISOString(),
    user: user,
    status: "confirmed"
  }

  // save to backend
  createBooking(newBooking)
    .then(function (res) {
      if (res && res.success) {
        console.log("Booking saved to database!")
      }
    })

  // save to localStorage and state immediately (don't wait for backend)
  var updatedBookings = [...bookings, newBooking]
  setBookings(updatedBookings)
  localStorage.setItem("popcornpass_bookings", JSON.stringify(updatedBookings))

  setCurrentBooking(newBooking)
  setSelectedSeats([])
  navigate("confirmation")
}

function login(userData) {
  // ✅ Clear previous user's bookings first
  setBookings([])
  localStorage.removeItem("popcornpass_bookings")

  setUser(userData)
  localStorage.setItem("popcornpass_user", JSON.stringify(userData))
  setShowAuthModal(false)

  if (userData && userData.email) {
    getUserBookings(userData.email)
      .then(function (res) {
        if (res && res.success && res.data && res.data.length > 0) {
          var normalized = res.data.map(function(b) {
            return Object.assign({}, b, { id: b.bookingId || b._id })
          })
          setBookings(normalized)
          localStorage.setItem("popcornpass_bookings", JSON.stringify(normalized))
        }
      })
      .catch(function (err) {
        console.log("Could not fetch bookings after login:", err)
      })
  }
}  

function getBookingsByShowtime(date, time, screen) {
  return fetch(BASE_URL + "/api/bookings/showtime?date=" + date + "&time=" + encodeURIComponent(time) + "&screen=" + encodeURIComponent(screen))
    .then(function(res) { return res.json() })
    .catch(function(err) { console.log("Error fetching showtime bookings:", err) })
}
  function logout() {
    setUser(null)
    setBookings([])
    localStorage.removeItem("popcornpass_user")
    localStorage.removeItem("popcornpass_bookings")
    navigate("home")
  }

  function cancelBooking(bookingId) {
    cancelBookingApi(bookingId)
      .then(function (res) {
        if (res && res.success) {
          console.log("Booking cancelled in database!")
        }
      })

    var newBookings = []
    for (var i = 0; i < bookings.length; i++) {
      if (bookings[i].id !== bookingId) {
        newBookings.push(bookings[i])
      }
    }
    setBookings(newBookings)
    localStorage.setItem("popcornpass_bookings", JSON.stringify(newBookings))
  }

  var value = {
    currentPage,
    navigate,
    selectedMovie,
    setSelectedMovie,
    selectMovie,
    selectedShowtime,
    setSelectedShowtime,
    selectShowtime,
    selectedDate,
    setSelectedDate,
    selectedSeats,
    setSelectedSeats,
    toggleSeat,
    user,
    login,
    logout,
    showAuthModal,
    setShowAuthModal,
    bookings,
    currentBooking,
    proceedToPayment,
    calculateTotal,
    confirmBooking,
    cancelBooking,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}