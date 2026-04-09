import { useState, useEffect, useRef } from "react"
import { useApp } from "../context/AppContext"

const STRIPE_KEY = "pk_test_51TI0ebFwCY90Xpbs2zvWCuSOQ483oi4lDLsDYUK8jN3dP7hoXDxdaD25HXKALVA7PiL04rJ2feVrAXrep4HbvRuA00HKtnwNRj"

export default function PaymentPage() {
  var { selectedMovie, selectedShowtime, selectedSeats, calculateTotal, confirmBooking, navigate, user } = useApp()

  var [paymentMethod, setPaymentMethod] = useState("card")
  var [loading, setLoading] = useState(false)
  var [error, setError] = useState("")
  var [cardComplete, setCardComplete] = useState(false)
  var [cardReady, setCardReady] = useState(false)
  var [upiId, setUpiId] = useState("")
  var [processingScreen, setProcessingScreen] = useState(false)

  var stripeRef = useRef(null)
  var cardElementRef = useRef(null)
  var cardMountRef = useRef(null)
  var stripeInitialized = useRef(false)

  var total = calculateTotal()
  var convenience = Math.round(total * 0.02)
  var grandTotal = total + convenience

  // ✅ Initialize Stripe ONCE on mount - never reinitialize
  useEffect(function() {
    if (stripeInitialized.current) return
    stripeInitialized.current = true

    function initStripeElement() {
      if (!cardMountRef.current) {
        setTimeout(initStripeElement, 100)
        return
      }
      if (cardElementRef.current) return

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

      card.on("ready", function() {
        setCardReady(true)
      })

      card.on("change", function(e) {
        setError(e.error ? e.error.message : "")
        setCardComplete(e.complete)
      })
    }

    if (window.Stripe) {
      stripeRef.current = window.Stripe(STRIPE_KEY)
      initStripeElement()
    } else {
      var script = document.createElement("script")
      script.src = "https://js.stripe.com/v3/"
      script.onload = function() {
        stripeRef.current = window.Stripe(STRIPE_KEY)
        initStripeElement()
      }
      document.head.appendChild(script)
    }

    // ✅ Cleanup on unmount
    return function() {
      if (cardElementRef.current) {
        try { cardElementRef.current.unmount() } catch(e) {}
        cardElementRef.current = null
      }
    }
  }, []) // ✅ Empty deps - only runs once

  function handleBack() { navigate("seats") }

  function handlePay() {
    if (paymentMethod !== "card") {
      handleUpiOrWalletPay()
      return
    }

    if (!stripeRef.current || !cardElementRef.current) {
      setError("Payment not ready. Please wait.")
      return
    }
    if (!cardReady) {
      setError("Card field not ready. Please wait.")
      return
    }
    if (!cardComplete) {
      setError("Please enter complete card details.")
      return
    }

    setError("")
    setLoading(true)
    setProcessingScreen(true)

    // ✅ Use ref directly - no state that could cause re-render issues
    var stripe = stripeRef.current
    var cardElement = cardElementRef.current

      stripe.createPaymentMethod({
  type: "card",
  card: cardElement,
  billing_details: {
    name: user ? user.name : "Customer",
    email: user ? user.email : ""
  }
}).then(function(result) {
  if (result.error) {
    setProcessingScreen(false)
    setError(result.error.message)
    setLoading(false)
    return
  }

  // ✅ Check for declined test card using last4
  var last4 = result.paymentMethod.card.last4
  if (last4 === "0002") {
    setTimeout(function() {
      setProcessingScreen(false)
      setError("❌ Your card was declined. Please try a different card.")
      setLoading(false)
    }, 2500)
    return
  }

  // ✅ Success - show processing screen for 2.5 seconds, then confirm
  setTimeout(function() {
    confirmBooking({
      method: "card",
      transactionId: result.paymentMethod.id,
      status: "success",
      paidAt: new Date().toISOString()
    })
    setLoading(false)
  }, 2500)

}).catch(function(err) {
  setProcessingScreen(false)
  setError("Payment failed. Please try again.")
  setLoading(false)
})

  function handleUpiOrWalletPay() {
    if (paymentMethod === "upi" && !upiId.includes("@")) {
      setError("Enter a valid UPI ID like name@upi")
      return
    }
    setError("")
    setLoading(true)
    setTimeout(function() {
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

        {/* Stripe Processing Overlay */}
        {processingScreen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-gray-900 border border-indigo-800/50 rounded-2xl p-10 max-w-sm w-full mx-4 text-center">
              <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-4xl font-bold">S</span>
              </div>
              <h2 className="text-white font-bold text-2xl mb-1">Processing Payment</h2>
              <p className="text-indigo-400 font-bold text-xl mb-1">Stripe</p>
              <p className="text-gray-400 text-sm mb-2">Securing your transaction...</p>
              <p className="text-indigo-300 font-medium mb-6">₹{grandTotal}</p>
              <div className="flex justify-center gap-2 mb-4">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay:"0ms"}}></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay:"150ms"}}></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay:"300ms"}}></div>
              </div>
              <p className="text-gray-500 text-xs">🔒 PCI DSS Level 1 Certified</p>
            </div>
          </div>
        )}

        <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
          ← Back to Seat Selection
        </button>
        <h1 className="text-2xl font-bold text-white mb-8">Complete Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Payment Method Tabs */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">Payment Method</h2>
              <div className="grid grid-cols-3 gap-3">
                {[["card","💳","Credit / Debit Card"],["upi","📱","UPI"],["wallet","👛","Wallet"]].map(function(m) {
                  return (
                    <button key={m[0]} onClick={() => setPaymentMethod(m[0])}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${paymentMethod === m[0] ? "bg-indigo-600/10 border-indigo-600 text-indigo-400" : "bg-gray-800 border-gray-700 text-gray-400"}`}>
                      <span className="text-2xl">{m[1]}</span>
                      <span className="text-xs font-medium text-center">{m[2]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ✅ Card section - always rendered, just hidden when not selected */}
            <div className={paymentMethod === "card" ? "block" : "hidden"}>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">Card Details</h2>
                  <div className="flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/50 px-3 py-1.5 rounded-lg">
                    <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <span className="text-indigo-300 text-xs font-bold">Powered by Stripe</span>
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-3 mb-4">
                  <p className="text-green-400 text-xs font-medium mb-1">✅ Test Mode — Use Stripe test card:</p>
                  <p className="text-green-300 text-xs font-mono">4111 1111 1111 1111 • Any future date • Any CVV</p>
                  <p className="text-red-400 text-xs mt-1">❌ Decline test: 4000 0000 0000 0002</p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Card Information</label>
                  {/* ✅ Always mounted - never conditionally rendered */}
                  <div ref={cardMountRef} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4" />
                  <p className="text-gray-500 text-xs mt-2">
                    {cardReady ? "🔒 256-bit SSL encrypted by Stripe" : "⏳ Loading secure card field..."}
                  </p>
                </div>
              </div>
            </div>

            {/* UPI */}
            {paymentMethod === "upi" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="text-white font-semibold mb-5">UPI Payment</h2>
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[["GPay","bg-blue-900"],["PhonePe","bg-purple-900"],["Paytm","bg-blue-800"],["BHIM","bg-orange-900"]].map(function(a) {
                    return (
                      <div key={a[0]} className={`${a[1]} rounded-xl p-3 text-center border border-gray-700`}>
                        <p className="text-white text-xs font-medium">{a[0]}</p>
                      </div>
                    )
                  })}
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Enter UPI ID</label>
                  <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-indigo-500 text-sm" />
                </div>
              </div>
            )}

            {/* Wallet */}
            {paymentMethod === "wallet" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="text-white font-semibold mb-5">Select Wallet</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[["Paytm Wallet","₹1,250"],["Amazon Pay","₹890"],["Mobikwik","₹450"],["Freecharge","₹120"]].map(function(w) {
                    return (
                      <div key={w[0]} className="bg-gray-800 border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-indigo-500">
                        <p className="text-white text-sm font-medium">{w[0]}</p>
                        <p className="text-green-400 text-xs mt-1">Balance: {w[1]}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center bg-red-900/20 py-3 rounded-xl">{error}</p>}

            <button
              onClick={handlePay}
              disabled={loading || (paymentMethod === "card" && (!cardReady || !cardComplete))}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-lg">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Processing...
                </span>
              ) : paymentMethod === "card" && (!cardReady || !cardComplete)
                ? "Enter card details to pay"
                : "Pay ₹" + grandTotal + " via Stripe"}
            </button>

            <p className="text-center text-gray-600 text-xs">🔒 Payments secured by Stripe — PCI DSS Level 1 Certified</p>
          </div>

          {/* Order Summary */}
          <div className="flex flex-col gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">Booking Summary</h2>
              <div className="flex gap-3 mb-4">
                <img src={selectedMovie.poster} alt={selectedMovie.title} className="w-14 h-20 object-cover rounded-lg flex-shrink-0" />
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
                  {selectedSeats.map(function(seat) {
                    return (
                      <span key={seat.id} className="bg-indigo-600/20 border border-indigo-600/40 text-indigo-400 text-xs px-2 py-1 rounded-lg">
                        {seat.id}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
                {selectedSeats.map(function(seat) {
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

            <div className="bg-indigo-900/20 border border-indigo-800/50 rounded-2xl p-4 text-center">
              <p className="text-gray-400 text-xs mb-2">Payment Gateway</p>
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
                <p className="text-indigo-400 font-bold text-xl">Stripe</p>
              </div>
              <p className="text-gray-500 text-xs">PCI DSS Level 1 Certified</p>
              <p className="text-gray-600 text-xs mt-1">256-bit SSL Encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}