import { useState } from "react"
import { useApp } from "../context/AppContext"

export default function Navbar() {
  var { user, logout, navigate, setShowAuthModal, currentPage } = useApp()
  var [menuOpen, setMenuOpen] = useState(false)

  function handleNavClick(page) {
    navigate(page)
    setMenuOpen(false)
  }

  function handleLoginClick() {
    setShowAuthModal(true)
    setMenuOpen(false)
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavClick("home")}
          >
            <span className="text-2xl">🍿</span>
            <span className="text-white font-bold text-xl">
              Popcorn<span className="text-red-500">Pass</span>
            </span>
          </div>

       
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavClick("home")}
              className={`text-sm font-medium transition-colors ${currentPage === "home" ? "text-red-500" : "text-gray-300 hover:text-white"}`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick("movies")}
              className={`text-sm font-medium transition-colors ${currentPage === "movies" ? "text-red-500" : "text-gray-300 hover:text-white"}`}
            >
              Movies
            </button>
            {user && (
              <button
                onClick={() => handleNavClick("my-bookings")}
                className={`text-sm font-medium transition-colors ${currentPage === "my-bookings" ? "text-red-500" : "text-gray-300 hover:text-white"}`}
              >
                My Bookings
              </button>
            )}
            {user && user.isAdmin && (
              <button
                onClick={() => handleNavClick("admin")}
                className={`text-sm font-medium transition-colors ${currentPage === "admin" ? "text-red-500" : "text-gray-300 hover:text-white"}`}
              >
                Admin
              </button>
            )}
          </div>

          {/* desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-300 text-sm">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoginClick}
                  className="text-sm text-gray-300 hover:text-white px-3 py-1.5 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={handleLoginClick}
                  className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* mobile hamburger button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

        </div>
      </div>

      {/* mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-4 flex flex-col gap-4">
          <button
            onClick={() => handleNavClick("home")}
            className={`text-left text-sm font-medium ${currentPage === "home" ? "text-red-500" : "text-gray-300"}`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick("movies")}
            className={`text-left text-sm font-medium ${currentPage === "movies" ? "text-red-500" : "text-gray-300"}`}
          >
            Movies
          </button>
          {user && (
            <button
              onClick={() => handleNavClick("my-bookings")}
              className={`text-left text-sm font-medium ${currentPage === "my-bookings" ? "text-red-500" : "text-gray-300"}`}
            >
              My Bookings
            </button>
          )}
          {user && user.isAdmin && (
            <button
              onClick={() => handleNavClick("admin")}
              className={`text-left text-sm font-medium ${currentPage === "admin" ? "text-red-500" : "text-gray-300"}`}
            >
              Admin
            </button>
          )}
          <div className="border-t border-gray-800 pt-4">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleLoginClick}
                  className="flex-1 text-sm text-center border border-gray-700 text-gray-300 px-3 py-2 rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={handleLoginClick}
                  className="flex-1 text-sm text-center bg-red-600 text-white px-3 py-2 rounded-lg font-medium"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}