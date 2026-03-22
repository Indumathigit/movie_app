import { useState } from "react"
import { useApp } from "../context/AppContext"

export default function AuthModal() {
  var { login, setShowAuthModal } = useApp()
  var [isLogin, setIsLogin] = useState(true)
  var [name, setName] = useState("")
  var [email, setEmail] = useState("")
  var [password, setPassword] = useState("")
  var [error, setError] = useState("")
  var [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (!isLogin && name.trim() === "") {
      setError("Please enter your name")
      return
    }
    if (email.trim() === "") {
      setError("Please enter your email")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    setTimeout(function () {
      var userData = {
        id: "U" + Date.now(),
        name: isLogin ? email.split("@")[0] : name,
        email: email,
        isAdmin: email === "admin@cinebook.com"
      }
      login(userData)
      setLoading(false)
    }, 1000)
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      setShowAuthModal(false)
    }
  }

  function switchMode() {
    setIsLogin(!isLogin)
    setError("")
    setName("")
    setEmail("")
    setPassword("")
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-8 relative">

        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🍿</div>
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isLogin ? "Login to book your favorite movies" : "Sign up and start booking with PopcornPass"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {!isLogin && (
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          {isLogin && (
            <p className="text-xs text-gray-600 text-center">
              Use <span className="text-gray-400">admin@cinebook.com</span> to login as Admin
            </p>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={switchMode}
            className="text-red-400 hover:text-red-300 font-medium"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>

      </div>
    </div>
  )
}