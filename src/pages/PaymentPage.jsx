import { useState } from "react"
import { useApp } from "../context/AppContext"

export default function PaymentPage() {
  var { selectedMovie, selectedShowtime, selectedSeats, calculateTotal, confirmBooking, navigate } = useApp()

  var [paymentMethod, setPaymentMethod] = useState("card")
  var [loading, setLoading] = useState(false)

  var [cardNumber, setCardNumber] = useState("")
  var [cardName, setCardName] = useState("")
  var [cardExpiry, setCardExpiry] = useState("")
  var [cardCvv, setCardCvv] = useState("")
  var [upiId, setUpiId] = useState("")
  var [error, setError] = useState("")

  var total = calculateTotal()
  var convenience = Math.round(total * 0.02)
  var grandTotal = total + convenience

  function handleBack() {
    navigate("seats")
  }

  function handleCardNumber(e) {
    var value = e.target.value.replace(/\D/g, "").slice(0, 16)
    var formatted = ""
    for (var i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted = formatted + " "
      }
      formatted = formatted + value[i]
    }
    setCardNumber(formatted)
  }

  function handleExpiry(e) {
    var value = e.target.value.replace(/\D/g, "").slice(0, 4)
    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2)
    }
    setCardExpiry(value)
  }

  function handleCvv(e) {
    var value = e.target.value.replace(/\D/g, "").slice(0, 3)
    setCardCvv(value)
  }

  function validateAndPay() {
    setError("")

    if (paymentMethod === "card") {
      var rawNumber = cardNumber.replace(/\s/g, "")
      if (rawNumber.length !== 16) {
        setError("Enter a valid 16 digit card number")
        return
      }
      if (cardName.trim() === "") {
        setError("Enter cardholder name")
        return
      }
      if (cardExpiry.length !== 5) {
        setError("Enter valid expiry date MM/YY")
        return
      }
      if (cardCvv.length !== 3) {
        setError("Enter valid 3 digit CVV")
        return
      }
    }

    if (paymentMethod === "upi") {
      if (upiId.trim() === "") {
        setError("Enter your UPI ID")
        return
      }
      if (!upiId.includes("@")) {
        setError("Enter a valid UPI ID like name@upi")
        return
      }
    }

    setLoading(true)

    setTimeout(function () {
      var paymentDetails = {
        method: paymentMethod,
        transactionId: "TXN" + Date.now(),
        status: "success",
        paidAt: new Date().toISOString()
      }
      confirmBooking(paymentDetails)
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

        {/* back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm"
        >
          ← Back to Seat Selection
        </button>

        <h1 className="text-2xl font-bold text-white mb-8">Complete Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* left side - payment form */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* payment method tabs */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">Payment Method</h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${
                    paymentMethod === "card"
                      ? "bg-red-600/10 border-red-600 text-red-400"
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
                      ? "bg-red-600/10 border-red-600 text-red-400"
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
                      ? "bg-red-600/10 border-red-600 text-red-400"
                      : "bg-gray-800 border-gray-700 text-gray-400"
                  }`}
                >
                  <span className="text-2xl">👛</span>
                  <span className="text-xs font-medium text-center">Wallet</span>
                </button>
              </div>
            </div>

            {/* card form */}
            {paymentMethod === "card" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="text-white font-semibold mb-5">Card Details</h2>

                {/* card preview */}
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

                {/* card inputs */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumber}
                      placeholder="1234 5678 9012 3456"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-red-500 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-red-500 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-1 block">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiry}
                        placeholder="MM/YY"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-red-500 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-1 block">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={handleCvv}
                        placeholder="•••"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-red-500 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* upi form */}
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
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-red-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* wallet form */}
            {paymentMethod === "wallet" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="text-white font-semibold mb-5">Select Wallet</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <p className="text-white text-sm font-medium">Paytm Wallet</p>
                    <p className="text-green-400 text-xs mt-1">Balance: ₹1,250</p>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <p className="text-white text-sm font-medium">Amazon Pay</p>
                    <p className="text-green-400 text-xs mt-1">Balance: ₹890</p>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <p className="text-white text-sm font-medium">Mobikwik</p>
                    <p className="text-green-400 text-xs mt-1">Balance: ₹450</p>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
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
              onClick={validateAndPay}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Processing Payment...
                </span>
              ) : (
                "Pay ₹" + grandTotal
              )}
            </button>

            <p className="text-center text-gray-600 text-xs">
              🔒 Your payment is 100% secure and encrypted
            </p>

          </div>

          {/* right side - order summary */}
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
                  <span className="text-red-400 text-lg">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* offers */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <h3 className="text-white text-sm font-semibold mb-3">Available Offers</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 bg-green-900/20 border border-green-800/40 rounded-xl p-3">
                  <span className="text-green-400 text-xs font-bold bg-green-900/40 px-2 py-1 rounded-lg">
                    CINE10
                  </span>
                  <span className="text-gray-400 text-xs">10% off on first booking</span>
                </div>
                <div className="flex items-center gap-3 bg-green-900/20 border border-green-800/40 rounded-xl p-3">
                  <span className="text-green-400 text-xs font-bold bg-green-900/40 px-2 py-1 rounded-lg">
                    HDFC20
                  </span>
                  <span className="text-gray-400 text-xs">20% off with HDFC cards</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}