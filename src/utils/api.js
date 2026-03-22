var BASE_URL = "https://movie-booking-backend-k3uc.onrender.com/"

function getAllMovies() {
  return fetch(BASE_URL + "/movies")
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error fetching movies:", err) })
}

function getMovieById(id) {
  return fetch(BASE_URL + "/movies/" + id)
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error fetching movie:", err) })
}

function createBooking(bookingData) {
  return fetch(BASE_URL + "/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData)
  })
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error creating booking:", err) })
}

function getUserBookings(email) {
  return fetch(BASE_URL + "/bookings/user/" + email)
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error fetching bookings:", err) })
}

function cancelBooking(bookingId) {
  return fetch(BASE_URL + "/bookings/cancel/" + bookingId, {
    method: "PUT",
    headers: { "Content-Type": "application/json" }
  })
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error cancelling booking:", err) })
}

function getAllTheaters() {
  return fetch(BASE_URL + "/theaters")
    .then(function (res) { return res.json() })
    .catch(function (err) { console.log("Error fetching theaters:", err) })
}

export {
  getAllMovies,
  getMovieById,
  createBooking,
  getUserBookings,
  cancelBooking,
  getAllTheaters
}