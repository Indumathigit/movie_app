import { useState, useEffect } from "react"
import { useApp } from "../context/AppContext"
import { movies, genres } from "../data/mockData"

export default function HomePage() {
  var { selectMovie, navigate, setSelectedGenre, setSearchQuery } = useApp()
  var [heroIndex, setHeroIndex] = useState(0)
  var [searchInput, setSearchInput] = useState("")

  var nowShowing = []
  var comingSoon = []

  for (var i = 0; i < movies.length; i++) {
    if (movies[i].status === "now_showing") {
      nowShowing.push(movies[i])
    } else {
      comingSoon.push(movies[i])
    }
  }

  var heroMovies = [nowShowing[0], nowShowing[1], nowShowing[2]]
  var heroMovie = heroMovies[heroIndex]

  useEffect(function () {
    var interval = setInterval(function () {
      if (heroIndex === heroMovies.length - 1) {
        setHeroIndex(0)
      } else {
        setHeroIndex(heroIndex + 1)
      }
    }, 5000)
    return function () {
      clearInterval(interval)
    }
  }, [heroIndex])

  function handleSearch(e) {
    e.preventDefault()
    setSearchQuery(searchInput)
    setSelectedGenre("All")
    navigate("movies")
  }

  function handleGenreClick(genre) {
    setSelectedGenre(genre)
    setSearchQuery("")
    navigate("movies")
  }

  function getDuration(mins) {
    var hours = Math.floor(mins / 60)
    var minutes = mins % 60
    return hours + "h " + minutes + "m"
  }

  return (
    <div className="bg-gray-950 min-h-screen">

      {/* hero section */}
      <div className="relative h-[85vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroMovie.backdrop}
            alt={heroMovie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">

              <div className="flex items-center gap-2 mb-4">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  NOW SHOWING
                </span>
                <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                  {heroMovie.rating}
                </span>
                <span className="bg-gray-800 text-yellow-400 text-xs px-3 py-1 rounded-full">
                  ⭐ {heroMovie.imdb}
                </span>
              </div>

              <h1 className="text-5xl font-black text-white mb-3 leading-tight">
                {heroMovie.title}
              </h1>

              <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
                <span>{getDuration(heroMovie.duration)}</span>
                <span>•</span>
                <span>{heroMovie.genre.join(", ")}</span>
                <span>•</span>
                <span>{heroMovie.language}</span>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {heroMovie.description}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => selectMovie(heroMovie)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-all"
                >
                  🎟️ Book Now
                </button>
                <button
                  onClick={() => selectMovie(heroMovie)}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl border border-white/20"
                >
                  ▶ More Info
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* hero dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroMovies.map(function (_, i) {
            return (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`rounded-full transition-all ${i === heroIndex ? "w-8 h-2 bg-red-500" : "w-2 h-2 bg-gray-600"}`}
              />
            )
          })}
        </div>
      </div>

      {/* search bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-12">
        <form
          onSubmit={handleSearch}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-2 flex gap-2"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search movies by title, genre or cast..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-3 outline-none text-sm"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* genre buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {genres.map(function (genre) {
            return (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className="whitespace-nowrap bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white text-sm px-5 py-2 rounded-full border border-gray-700 hover:border-red-600"
              >
                {genre}
              </button>
            )
          })}
        </div>
      </div>

      {/* now showing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Now Showing</h2>
          <button
            onClick={() => navigate("movies")}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            View All →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {nowShowing.map(function (movie) {
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button className="w-full bg-red-600 text-white text-xs font-bold py-2 rounded-lg">
                      Book Now
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs px-2 py-1 rounded-lg">
                    ⭐ {movie.imdb}
                  </div>
                </div>
                <h3 className="text-white text-sm font-semibold truncate">{movie.title}</h3>
                <p className="text-gray-400 text-xs mt-1">{movie.genre[0]} • {getDuration(movie.duration)}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* coming soon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <h2 className="text-2xl font-bold text-white mb-6">Coming Soon</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {comingSoon.map(function (movie) {
            return (
              <div
                key={movie.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={movie.backdrop}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                  <span className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    COMING SOON
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold mb-1">{movie.title}</h3>
                  <p className="text-gray-400 text-xs mb-2">{movie.genre.join(", ")} • {getDuration(movie.duration)}</p>
                  <p className="text-gray-500 text-xs">{movie.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-yellow-400 text-xs">⭐ {movie.imdb}</span>
                    <span className="text-gray-600 text-xs">•</span>
                    <span className="text-gray-400 text-xs">{movie.rating}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* footer */}
      <footer className="border-t border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">🍿</span>
            <span className="text-white font-bold text-lg">
              Popcorn<span className="text-red-500">Pass</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 PopcornPass. Book smarter, watch better.</p>
        </div>
      </footer>

    </div>
  )
}