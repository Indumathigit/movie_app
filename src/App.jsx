import { useApp } from "./context/AppContext"
import Navbar from "./components/Navbar"
import AuthModal from "./components/AuthModal"
import HomePage from "./pages/HomePage"
import MoviesPage from "./pages/MoviesPage"
import ShowtimesPage from "./pages/ShowtimesPage"
import SeatSelectionPage from "./pages/SeatSelectionPage"
import PaymentPage from "./pages/PaymentPage"
import BookingConfirmationPage from "./pages/BookingConfirmationPage"
import MyBookingsPage from "./pages/MyBookingsPage"
import AdminPage from "./pages/AdminPage"

export default function App() {
  var { currentPage, showAuthModal } = useApp()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      {showAuthModal && <AuthModal />}
      {currentPage === "home" && <HomePage />}
      {currentPage === "movies" && <MoviesPage />}
      {currentPage === "showtimes" && <ShowtimesPage />}
      {currentPage === "seats" && <SeatSelectionPage />}
      {currentPage === "payment" && <PaymentPage />}
      {currentPage === "confirmation" && <BookingConfirmationPage />}
      {currentPage === "my-bookings" && <MyBookingsPage />}
      {currentPage === "admin" && <AdminPage />}
    </div>
  )
}