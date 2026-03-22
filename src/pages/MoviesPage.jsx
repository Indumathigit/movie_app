import { useState } from "react"
import { useApp } from "../context/AppContext"
import { movies, genres } from "../data/mockData"

export default function MoviesPage() {
  var { selectMovie, searchQuery, setSearchQuery, selectedGenre, setSelectedGenre } = useApp()
  var [sortBy, setSortBy] = useState("default")
  var [filterStatus, setFilterStatus] = useState("all")

  function getDuration(mins) {
    var hours = Math.floor(mins / 60)
    var minutes = mins % 60
    return hours + "h " + minutes + "m"
  }

  function getFilteredMovies() {
    var result = []

    for (var i = 0; i < movies.length; i++) {
      var movie = movies[i]
      var matchStatus = true
      var matchGenre = true
      var matchSearch = true

      if (filterStatus !== "all" && movie.status !== filterStatus) {
        matchStatus = false
      }

      if (selectedGenre !== "All" && !movie.genre.includes(selectedGenre)) {
        matchGenre = false
      }

      if (searchQuery.trim() !== "") {
        var query = searchQuery.toLowerCase()
        var inTitle = movie.title.toLowerCase().includes(query)
        var inDirector = movie.director.toLowerCase().includes(query)
        var inGenre = false
        var inCast = false

        for (var j = 0; j < movie.genre.length; j++) {
          if (movie.genre[j].toLowerCase().includes(query)) {
            inGenre = true
          }
        }

        for (var k = 0; k < movie.cast.length; k++) {
          if (movie.cast[k].toLowerCase().includes(query)) {
            inCast = true
          }
        }

        if (!inTitle && !inDirector && !inGenre && !inCast) {
          matchSearch = false
        }
      }

      if (matchStatus && matchGenre && matchSearch) {
        result.push(movie)
      }
    }

    if (sortBy === "rating") {
      result.sort(function (a, b) { return b.imdb - a.imdb })
    } else if (sortBy === "name") {
      result.sort(function (a, b) { return a.title.localeCompare(b.title) })
    } else if (sortBy === "duration") {
      result.sort(function (a, b) { return a.duration - b.duration })
    }

    return result
  }

  function clearFilters() {
    setSearchQuery("")
    setSelectedGenre("All")
    setSortBy("default")
    setFilterStatus("all")
  }

  var filteredMovies = getFilteredMovies()

  return (
    <div className="bg-gray-950 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Movies</h1>
          <p className="text-gray-400 text-sm">Browse and book tickets for your favorite movies</p>
        </div>

        {/* search bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-2 flex gap-2 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, genre, cast or director..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-2 outline-none text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-white px-3"
            >
              ✕
            </button>
          )}
          <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm">
            Search
          </button>
        </div>

        {/* filters row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">

          {/* status tabs */}
          <div className="flex bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 text-sm font-medium ${filterStatus === "all" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("now_showing")}
              className={`px-4 py-2 text-sm font-medium ${filterStatus === "now_showing" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Now Showing
            </button>
            <button
              onClick={() => setFilterStatus("coming_soon")}
              className={`px-4 py-2 text-sm font-medium ${filterStatus === "coming_soon" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Coming Soon
            </button>
          </div>

          {/* sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-300 text-sm px-4 py-2 rounded-xl outline-none"
          >
            <option value="default">Sort: Default</option>
            <option value="rating">Sort: Top Rated</option>
            <option value="name">Sort: A - Z</option>
            <option value="duration">Sort: Duration</option>
          </select>

          {/* clear filters */}
          {(searchQuery || selectedGenre !== "All" || sortBy !== "default" || filterStatus !== "all") && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-400 border border-red-800 px-4 py-2 rounded-xl"
            >
              Clear Filters
            </button>
          )}

          {/* result count */}
          <span className="text-gray-500 text-sm ml-auto">
            {filteredMovies.length} movie{filteredMovies.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* genre pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8">
          {genres.map(function (genre) {
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`whitespace-nowrap text-sm px-4 py-1.5 rounded-full border ${
                  selectedGenre === genre
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white"
                }`}
              >
                {genre}
              </button>
            )
          })}
        </div>

        {/* movies grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredMovies.map(function (movie) {
              return (
                <div
                  key={movie.id}
                  onClick={() => selectMovie(movie)}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      {movie.status === "now_showing" ? (
                        <button className="w-full bg-red-600 text-white text-xs font-bold py-2 rounded-lg">
                          🎟️ Book Now
                        </button>
                      ) : (
                        <button className="w-full bg-yellow-500 text-black text-xs font-bold py-2 rounded-lg">
                          🔔 Notify Me
                        </button>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 text-xs px-2 py-1 rounded-lg">
                      ⭐ {movie.imdb}
                    </div>
                    {movie.status === "coming_soon" && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-lg">
                        Soon
                      </div>
                    )}
                  </div>
                  <h3 className="text-white text-sm font-semibold truncate group-hover:text-red-400 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {movie.genre[0]} • {getDuration(movie.duration)}
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5">{movie.rating}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-white text-xl font-bold mb-2">No movies found</h3>
            <p className="text-gray-400 text-sm mb-6">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </div>
  )
}