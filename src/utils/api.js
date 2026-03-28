var BASE_URL = "https://movie-booking-backend-k3uc.onrender.com"

function getAllMovies() {
  return fetch(BASE_URL + "/api/movies")
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error fetching movies:", err) })
}

function getMovieById(id) {
  return fetch(BASE_URL + "/api/movies/" + id)
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error fetching movie:", err) })
}

function createBooking(bookingData) {
  return fetch(BASE_URL + "/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData)
  })
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error creating booking:", err) })
}

function getUserBookings(email) {
  return fetch(BASE_URL + "/api/bookings/user/" + email)
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error fetching bookings:", err) })
}

function cancelBooking(bookingId) {
  return fetch(BASE_URL + "/api/bookings/" + bookingId, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  })
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error cancelling booking:", err) })
}

function getAllTheaters() {
  return fetch(BASE_URL + "/api/theaters")
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error fetching theaters:", err) })
}

function registerUser(name, email, password) {
  return fetch(BASE_URL + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  })
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error registering:", err) })
}

function loginUser(email, password) {
  return fetch(BASE_URL + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error logging in:", err) })
}

export {
  getAllMovies,
  getMovieById,
  createBooking,
  getUserBookings,
  cancelBooking,
  getAllTheaters,
  registerUser,
  loginUser
}