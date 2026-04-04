import { useState, useEffect, useRef } from "react"
import { useApp } from "../context/AppContext"

const STRIPE_KEY = "pk_test_51TI0ebFwCY90Xpbs2zvWCuSOQ483oi4lDLsDYUK8jN3dP7hoXDxdaD25HXKALVA7PiL04rJ2feVrAXrep4HbvRuA00HKtnwNRj"

export default function PaymentPage() {
  var { selectedMovie, selectedShowtime, selectedSeats, calculateTotal, confirmBooking, navigate, user } = useApp()

  var [paymentMethod, setPaymentMethod] = useState("card")
  var [loading, setLoading] = useState(false)
  var [error, setError] = useState("")
  var [stripeReady, setStripeReady] = useState(false)
  var [upiId, setUpiId] = useState("")

  var stripeRef = useRef(null)
  var cardElementRef = useRef(null)
  var cardMountRef = useRef(null)

  var total = calculateTotal()
  var convenience = Math.round(total * 0.02)
  var grandTotal = total + convenience

  useEffect(function () {
    if (window.Stripe) {
      stripeRef.current = window.Stripe(STRIPE_KEY)
      setStripeReady(true)
      return
    }
    var script = document.createElement("script")
    script.src = "https://js.stripe.com/v3/"
    script.onload = function () {
      stripeRef.current = window.Stripe(STRIPE_KEY)
      setStripeReady(true)
    }
    document.head.appendChild(script)
  }, [])

  useEffect(function () {
    if (!stripeReady || paymentMethod !== "card") return
    if (cardElementRef.current) return
    if (!cardMountRef.current) return

    var elements = stripeRef.current.elements()
    var card = elements.create("card", {
      hidePostalCode: true,
      style: {
        base: {
          color: "#ffffff",
          fontSize: "16px",
          fontFamily: "Arial, sans-serif",
          "::placeholder": { color: "#6b7280" }
        },
        invalid: { color: "#f87171" }
      }
    })
    card.mount(cardMountRef.current)
    cardElementRef.current = card

    card.on("change", function (e) {
      setError(e.error ? e.error.message : "")
    })
  }, [stripeReady, paymentMethod])

  useEffect(function () {
    if (paymentMethod !== "card" && cardElementRef.current) {
      cardElementRef.current.unmount()
      cardElementRef.current = null
    }
  }, [paymentMethod])

  function handleBack() {
    navigate("seats")
  }

  async function handleCardPay() {
    if (!stripeRef.current || !cardElementRef.current) {
      setError("Payment not ready. Please wait.")
      return
    }
    setLoading(true)
    setError("")
    try {
      var result = await stripeRef.current.createPaymentMethod({
        type: "card",
        card: cardElementRef.current,
        billing_details: {
          name: user ? user.name : "Customer",
          email: user ? user.email : ""
        }
      })
      if (result.error) {
        setError(result.error.message)
        setLoading(false)
        return
      }
      confirmBooking({
        method: "card",
        transactionId: result.paymentMethod.id,
        status: "success",
        paidAt: new Date().toISOString()
      })
      setLoading(false)
    } catch (err) {
      setError("Payment failed. Please try again.")
      setLoading(false)
    }
  }

  function handleUpiOrWalletPay() {
    if (paymentMethod === "upi" && !upiId.includes("@")) {
      setError("Enter a valid UPI ID like name@upi")
      return
    }
    setError("")
    setLoading(true)
    setTimeout(function () {
      confirmBooking({
        method: paymentMethod,
        transactionId: "TXN" + Date.now(),
        status: "success",
        paidAt: new Date().toISOString()
      })
      setLoading(false)
    }, 2000)
  }

  if (!selectedMovie || !selectedShowtime || selectedSeats.length === 0) {
    navigate("movies")
    return null
  }

  return (
    <div className="bg-gray-950 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm"
        >
          ← Back to Seat Selection
        </button>

        <h1 className="text-2xl font-bold text-white mb-8">Complete Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* payment method tabs */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">Payment Method</h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${
                    paymentMethod === "card"
                      ? "bg-indigo-600/10 border-indigo-600 text-indigo-400"
                      : "bg-gray-800 border-gray-700 text-gray-400"
                  }`}
                >
                  <span className="text-2xl">💳</span>
                  <span className="text-xs font-medium text-center">Credit / Debit Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("upi")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${
                    paymentMethod === "upi"
                      ? "bg-indigo-600/10 border-indigo-600 text-indigo-400"
                      : "bg-gray-800 border-gray-700 text-gray-400"
                  }`}
                >
                  <span className="text-2xl">📱</span>
                  <span className="text-xs font-medium text-center">UPI</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("wallet")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${
                    paymentMethod === "wallet"
                      ? "bg-indigo-600/10 border-indigo-600 text-indigo-400"
                      : "bg-gray-800 border-gray-700 text-gray-400"
                  }`}
                >
                  <span className="text-2xl">👛</span>
                  <span className="text-xs font-medium text-center">Wallet</span>
                </button>
              </div>
            </div>

            {/* stripe card section */}
            {paymentMethod === "card" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

                {/* stripe header */}
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-semibold">Card Details</h2>
                  <div className="flex items-center gap-2 bg-indigo-950 border border-indigo-700 px-3 py-1.5 rounded-xl">
                    <span className="text-indigo-400 font-black text-sm">stripe</span>
                    <span className="text-indigo-300 text-xs">Secured Payment</span>
                  </div>
                </div>

                {/* stripe features */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className="bg-indigo-950/50 border border-indigo-900 rounded-xl p-2 text-center">
                    <p className="text-indigo-400 text-lg mb-0.5">🔒</p>
                    <p className="text-indigo-300 text-xs font-medium">SSL Encrypted</p>
                  </div>
                  <div className="bg-indigo-950/50 border border-indigo-900 rounded-xl p-2 text-center">
                    <p className="text-indigo-400 text-lg mb-0.5">✅</p>
                    <p className="text-indigo-300 text-xs font-medium">PCI Compliant</p>
                  </div>
                  <div className="bg-indigo-950/50 border border-indigo-900 rounded-xl p-2 text-center">
                    <p className="text-indigo-400 text-lg mb-0.5">⚡</p>
                    <p className="text-indigo-300 text-xs font-medium">Instant Payment</p>
                  </div>
                </div>

                {/* test card info */}
                <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-3 mb-5">
                  <p className="text-yellow-400 text-xs font-medium mb-1">🧪 Stripe Test Mode — Use test card:</p>
                  <p className="text-yellow-300 text-xs font-mono">4242 4242 4242 4242 • Any future date • Any CVV</p>
                </div>

                {!stripeReady ? (
                  <div className="flex items-center justify-center py-6 gap-2">
                    <svg className="animate-spin w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p className="text-gray-400 text-sm">Loading Stripe secure payment...</p>
                  </div>
                ) : (
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Card Information</label>
                    <div
                      ref={cardMountRef}
                      className="w-full bg-gray-800 border border-indigo-700/50 rounded-xl px-4 py-4"
                    />
                    <p className="text-indigo-500 text-xs mt-2">
                      🔒 Card details are securely encrypted by Stripe. We never store your card data.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* upi section */}
            {paymentMethod === "upi" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="text-white font-semibold mb-5">UPI Payment</h2>
                <div className="grid grid-cols-4 gap-3 mb-5">
                  <div className="bg-blue-900 rounded-xl p-3 text-center border border-gray-700">
                    <p className="text-white text-xs font-medium">GPay</p>
                  </div>
                  <div className="bg-purple-900 rounded-xl p-3 text-center border border-gray-700">
                    <p className="text-white text-xs font-medium">PhonePe</p>
                  </div>
                  <div className="bg-blue-800 rounded-xl p-3 text-center border border-gray-700">
                    <p className="text-white text-xs font-medium">Paytm</p>
                  </div>
                  <div className="bg-orange-900 rounded-xl p-3 text-center border border-gray-700">
                    <p className="text-white text-xs font-medium">BHIM</p>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Enter UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* wallet section */}
            {paymentMethod === "wallet" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="text-white font-semibold mb-5">Select Wallet</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-indigo-500">
                    <p className="text-white text-sm font-medium">Paytm Wallet</p>
                    <p className="text-green-400 text-xs mt-1">Balance: ₹1,250</p>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-indigo-500">
                    <p className="text-white text-sm font-medium">Amazon Pay</p>
                    <p className="text-green-400 text-xs mt-1">Balance: ₹890</p>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-indigo-500">
                    <p className="text-white text-sm font-medium">Mobikwik</p>
                    <p className="text-green-400 text-xs mt-1">Balance: ₹450</p>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-indigo-500">
                    <p className="text-white text-sm font-medium">Freecharge</p>
                    <p className="text-green-400 text-xs mt-1">Balance: ₹120</p>
                  </div>
                </div>
              </div>
            )}

            {/* error message */}
            {error && (
              <p className="text-red-400 text-sm text-center bg-red-900/20 py-3 rounded-xl">
                {error}
              </p>
            )}

            {/* pay button */}
            <button
              onClick={paymentMethod === "card" ? handleCardPay : handleUpiOrWalletPay}
              disabled={loading || (paymentMethod === "card" && !stripeReady)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Processing via Stripe...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Pay ₹{grandTotal}</span>
                  <span className="text-indigo-300 text-sm font-normal">via Stripe</span>
                </span>
              )}
            </button>

            {/* stripe badge below button */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-600 text-xs">Powered by</span>
              <span className="text-indigo-400 font-bold text-sm">stripe</span>
              <span className="text-gray-600 text-xs">•</span>
              <span className="text-gray-600 text-xs">🔒 PCI DSS Level 1 Certified</span>
            </div>

          </div>

          {/* order summary - right side */}
          <div className="flex flex-col gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">Booking Summary</h2>

              <div className="flex gap-3 mb-4">
                <img
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="w-14 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div>
                  <h3 className="text-white font-bold text-sm">{selectedMovie.title}</h3>
                  <p className="text-gray-400 text-xs mt-1">{selectedShowtime.time}</p>
                  <p className="text-gray-400 text-xs">{selectedShowtime.format}</p>
                  <p className="text-gray-500 text-xs">{selectedShowtime.screen}</p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4 mb-4">
                <p className="text-gray-400 text-xs mb-2">Selected Seats</p>
                <div className="flex flex-wrap gap-1">
                  {selectedSeats.map(function (seat) {
                    return (
                      <span
                        key={seat.id}
                        className="bg-red-600/20 border border-red-600/40 text-red-400 text-xs px-2 py-1 rounded-lg"
                      >
                        {seat.id}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
                {selectedSeats.map(function (seat) {
                  return (
                    <div key={seat.id} className="flex justify-between text-sm">
                      <span className="text-gray-400">Seat {seat.id} ({seat.type})</span>
                      <span className="text-white">₹{selectedShowtime.price[seat.type]}</span>
                    </div>
                  )
                })}
                <div className="flex justify-between text-sm pt-2 border-t border-gray-800">
                  <span className="text-gray-400">Convenience Fee</span>
                  <span className="text-white">₹{convenience}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-gray-800">
                  <span className="text-white">Total</span>
                  <span className="text-indigo-400 text-lg">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* stripe trust badge */}
            <div className="bg-indigo-950 border border-indigo-800 rounded-2xl p-4 text-center">
              <p className="text-indigo-300 text-xs mb-2">Payment Secured by</p>
              <p className="text-indigo-400 font-black text-2xl mb-2">stripe</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-indigo-300 text-xs">🔒 SSL</span>
                <span className="text-indigo-700">•</span>
                <span className="text-indigo-300 text-xs">PCI DSS</span>
                <span className="text-indigo-700">•</span>
                <span className="text-indigo-300 text-xs">3D Secure</span>
              </div>
              <p className="text-indigo-500 text-xs">
                Your card data never touches our servers
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}