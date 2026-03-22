import { createContext, useContext, useState } from "react"

export var AppContext = createContext(null)

export function useApp() {
  return useContext(AppContext)
}

export function AppProvider({ children }) {

  var [currentPage, setCurrentPage] = useState("home")
  var [selectedMovie, setSelectedMovie] = useState(null)
  var [selectedShowtime, setSelectedShowtime] = useState(null)
  var [selectedDate, setSelectedDate] = useState("2026-03-22")
  var [selectedSeats, setSelectedSeats] = useState([])
  var [user, setUser] = useState(null)
  var [showAuthModal, setShowAuthModal] = useState(false)
  var [bookings, setBookings] = useState([])
  var [currentBooking, setCurrentBooking] = useState(null)
  var [searchQuery, setSearchQuery] = useState("")
  var [selectedGenre, setSelectedGenre] = useState("All")

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
      movie: selectedMovie,
      showtime: selectedShowtime,
      seats: selectedSeats,
      totalAmount: calculateTotal(),
      paymentDetails: paymentDetails,
      bookedAt: new Date().toISOString(),
      user: user
    }
    setCurrentBooking(newBooking)
    setBookings([...bookings, newBooking])
    setSelectedSeats([])
    navigate("confirmation")
  }

  function login(userData) {
    setUser(userData)
    setShowAuthModal(false)
  }

  function logout() {
    setUser(null)
    navigate("home")
  }

  function cancelBooking(bookingId) {
    var newBookings = []
    for (var i = 0; i < bookings.length; i++) {
      if (bookings[i].id !== bookingId) {
        newBookings.push(bookings[i])
      }
    }
    setBookings(newBookings)
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