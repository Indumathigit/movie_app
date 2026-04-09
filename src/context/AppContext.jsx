import { createContext, useContext, useState, useEffect } from "react"
import { createBooking, cancelBooking as cancelBookingApi, getUserBookings } from "../utils/api"

export var AppContext = createContext(null)

export function useApp() {
  return useContext(AppContext)
}

export function AppProvider({ children }) {

  var savedUser = null
  try {
    var u = localStorage.getItem("popcornpass_user")
    if (u) savedUser = JSON.parse(u)
  } catch (e) { }

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

  // ✅ On app load, fetch latest bookings from backend
  useEffect(function () {
    if (savedUser && savedUser.email) {
      getUserBookings(savedUser.email)
        .then(function (res) {
          if (res && res.success && res.data && res.data.length > 0) {
            var normalized = res.data.map(function(b) {
              return Object.assign({}, b, { id: b.bookingId || b._id })
            })
            setBookings(normalized)
            localStorage.setItem("popcornpass_bookings", JSON.stringify(normalized))
          }
        })
        .catch(function () {})
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
      setSelectedSeats(selectedSeats.filter(function(s) { return s.id !== seat.id }))
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
      total = total + selectedShowtime.price[selectedSeats[i].type]
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
  // ✅ Block if payment was not successful
  if (!paymentDetails || paymentDetails.status !== "success") {
    console.log("Payment not successful, booking blocked")
    return
  }

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

    var updatedBookings = [...bookings, newBooking]
    setBookings(updatedBookings)
    localStorage.setItem("popcornpass_bookings", JSON.stringify(updatedBookings))
    setCurrentBooking(newBooking)
    setSelectedSeats([])
    navigate("confirmation")
  }

  function login(userData) {
    // ✅ Clear previous user bookings first
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
        .catch(function () {})
    }
  }

  function logout() {
    setUser(null)
    setBookings([])
    localStorage.removeItem("popcornpass_user")
    localStorage.removeItem("popcornpass_bookings")
    navigate("home")
  }

  // ✅ Cancel marks booking as cancelled instead of deleting it
  function cancelBooking(bookingId) {
    cancelBookingApi(bookingId)
      .then(function (res) {
        if (res && res.success) {
          console.log("Booking cancelled in database!")
        }
      })

    // ✅ Mark as cancelled instead of removing
    var updatedBookings = bookings.map(function(b) {
      if ((b.id === bookingId) || (b.bookingId === bookingId) || (b._id === bookingId)) {
        return Object.assign({}, b, { status: "cancelled" })
      }
      return b
    })
    setBookings(updatedBookings)
    localStorage.setItem("popcornpass_bookings", JSON.stringify(updatedBookings))
  }

  var value = {
    currentPage, navigate,
    selectedMovie, setSelectedMovie, selectMovie,
    selectedShowtime, setSelectedShowtime, selectShowtime,
    selectedDate, setSelectedDate,
    selectedSeats, setSelectedSeats, toggleSeat,
    user, login, logout,
    showAuthModal, setShowAuthModal,
    bookings, currentBooking,
    proceedToPayment, calculateTotal,
    confirmBooking, cancelBooking,
    searchQuery, setSearchQuery,
    selectedGenre, setSelectedGenre
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}