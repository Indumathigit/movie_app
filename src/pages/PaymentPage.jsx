import { useState } from "react"
import { useApp } from "../context/AppContext"

export default function PaymentPage() {
  var { selectedMovie, selectedShowtime, selectedSeats, calculateTotal, confirmBooking, navigate, user } = useApp()

  var [paymentMethod, setPaymentMethod] = useState("card")
  var [loading, setLoading] = useState(false)
  var [cardNumber, setCardNumber] = useState("")
  var [cardName, setCardName] = useState("")
  var [cardExpiry, setCardExpiry] = useState("")
  var [cardCvv, setCardCvv] = useState("")
  var [upiId, setUpiId] = useState("")
  var [error, setError] = useState("")
  var [otpScreen, setOtpScreen] = useState(false)
  var [otp, setOtp] = useState("")

  var total = calculateTotal()
  var convenience = Math.round(total * 0.02)
  var grandTotal = total + convenience

  function handleBack() { navigate("seats") }

  function handleCardNumber(e) {
    var value = e.target.value.replace(/\D/g, "").slice(0, 16)
    var formatted = ""
    for (var i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += " "
      formatted += value[i]
    }
    setCardNumber(formatted)
  }

  function handleExpiry(e) {
    var value = e.target.value.replace(/\D/g, "").slice(0, 4)
    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2)
    setCardExpiry(value)
  }

  function handleCvv(e) { setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3)) }

  function validateInputs() {
    setError("")
    if (paymentMethod === "card") {
      if (cardNumber.replace(/\s/g, "").length !== 16) { setError("Enter a valid 16 digit card number"); return false }
      if (cardName.trim() === "") { setError("Enter cardholder name"); return false }
      if (cardExpiry.length !== 5) { setError("Enter valid expiry MM/YY"); return false }
      if (cardCvv.length !== 3) { setError("Enter valid 3 digit CVV"); return false }
    }
    if (paymentMethod === "upi") {
      if (!upiId.includes("@")) { setError("Enter a valid UPI ID like name@upi"); return false }
    }
    return true
  }

  function handlePay() {
    if (!validateInputs()) return
    setLoading(true)
    setTimeout(function() { setLoading(false); setOtpScreen(true) }, 1500)
  }

  function handleOtpSubmit() {
    if (otp !== "123456") { setError("Invalid OTP. Use 123456 for demo"); return }
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
    }, 1500)
  }

  if (!selectedMovie || !selectedShowtime || selectedSeats.length === 0) {
    navigate("movies")
    return null
  }

  if (otpScreen) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📱</div>
            <h2 className="text-white font-bold text-xl mb-1">OTP Verification</h2>
            <p className="text-gray-400 text-sm">Enter the OTP sent to your registered mobile</p>
            <p className="text-green-400 text-xs mt-3 bg-green-900/20 py-2 px-4 rounded-lg inline-block">
              Demo OTP: <strong>123456</strong>
            </p>
          </div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-gray-600 outline-none focus:border-red-500 font-mono mb-4"
          />
          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
          <button onClick={handleOtpSubmit} disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-4 rounded-2xl text-lg mb-3">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Verifying...
              </span>
            ) : "Verify & Pay ₹" + grandTotal}
          </button>
          <button onClick={() => { setOtpScreen(false); setOtp(""); setError("") }}
            className="w-full text-gray-400 text-sm hover:text-white text-center">
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
          ← Back to Seat Selection
        </button>
        <h1 className="text-2xl font-bold text-white mb-8">Complete Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Payment Method */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">Payment Method</h2>
              <div className="grid grid-cols-3 gap-3">
                {[["card","💳","Credit / Debit Card"],["upi","📱","UPI"],["wallet","👛","Wallet"]].map(function(m) {
                  return (
                    <button key={m[0]} onClick={() => setPaymentMethod(m[0])}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${paymentMethod === m[0] ? "bg-red-600/10 border-red-600 text-red-400" : "bg-gray-800 border-gray-700 text-gray-400"}`}>
                      <span className="text-2xl">{m[1]}</span>
                      <span className="text-xs font-medium text-center">{m[2]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Card Form */}
            {paymentMethod === "card" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="text-white font-semibold mb-5">Card Details</h2>
                <div className="bg-gradient-to-br from-red-900 to-gray-900 rounded-2xl p-5 mb-6 border border-red-800/30">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-7 bg-yellow-400 rounded-md opacity-80" />
                    <span className="text-gray-300 text-sm font-medium">VISA</span>
                  </div>
                  <p className="text-white font-mono text-lg tracking-widest mb-4">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </p>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500 text-xs">Card Holder</p>
                      <p className="text-white text-sm">{cardName || "YOUR NAME"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Expires</p>
                      <p className="text-white text-sm">{cardExpiry || "MM/YY"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Card Number</label>
                    <input type="text" value={cardNumber} onChange={handleCardNumber}
                      placeholder="4111 1111 1111 1111"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-red-500 text-sm font-mono" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Cardholder Name</label>
                    <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-red-500 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-1 block">Expiry Date</label>
                      <input type="text" value={cardExpiry} onChange={handleExpiry}
                        placeholder="MM/YY"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-red-500 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-1 block">CVV</label>
                      <input type="password" value={cardCvv} onChange={handleCvv}
                        placeholder="•••"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-red-500 text-sm font-mono" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* UPI Form */}
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
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-red-500 text-sm" />
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
                      <div key={w[0]} className="bg-gray-800 border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-red-500">
                        <p className="text-white text-sm font-medium">{w[0]}</p>
                        <p className="text-green-400 text-xs mt-1">Balance: {w[1]}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center bg-red-900/20 py-3 rounded-xl">{error}</p>}

            <button onClick={handlePay} disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-4 rounded-2xl text-lg">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Processing...
                </span>
              ) : "Pay ₹" + grandTotal}
            </button>

            <p className="text-center text-gray-600 text-xs">🔒 256-bit SSL Encrypted Payment</p>
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
                      <span key={seat.id} className="bg-red-600/20 border border-red-600/40 text-red-400 text-xs px-2 py-1 rounded-lg">
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
                  <span className="text-red-400 text-lg">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <p className="text-gray-400 text-xs mb-1">Secured Payment</p>
              <p className="text-blue-400 font-bold text-lg">PopcornPass Pay</p>
              <p className="text-gray-600 text-xs mt-1">256-bit SSL Encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}