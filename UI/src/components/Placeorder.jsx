import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cart from "./Cart";
import { storeCheckout } from "../config/firestore";
import { useAuth } from "../context/AuthContext";

// Recipient (your business WhatsApp) — digits only, country code included (no +)
const RECIPIENT_WHATSAPP = "919080249834";

const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

const normalizePhoneForWhatsApp = (phone) => {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const ContactForm = ({
  clearCart, // optional callback from parent to clear cart after successful order
  cart = [], // optional fallback
  updateQuantity,
  isCartOpen,
  setIsCartOpen,
  getCartTotal = () => 0,
  removeFromCart,
  onLoginRequired,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // productList, total, data (summary) can be passed via location.state from Cart
  const state = location.state || {};
  const passedProductList = state.productList || cart || [];
  const passedTotal = state.total ?? (cart ? Number(getCartTotal()) : 0);
  const passedSummary = state.data || "";

  const nameRef = useRef(null);
  const whatsappRef = useRef(null);
  const addressRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill name & whatsapp if available from auth
  useEffect(() => {
    if (currentUser) {
      if (nameRef.current) {
        const nameVal =
          currentUser.displayName ||
          (currentUser.email ? currentUser.email.split("@")[0] : "");
        if (nameVal) nameRef.current.value = nameVal;
      }
      if (whatsappRef.current) {
        const phone = currentUser.phoneNumber
          ? currentUser.phoneNumber.replace(/\D/g, "")
          : "";
        if (phone)
          whatsappRef.current.value =
            phone.length === 12 && phone.startsWith("91")
              ? phone.slice(2)
              : phone; // show local 10-digit if possible
      }
    }
  }, [currentUser]);

  const buildWhatsAppUrl = (recipientNumber, message) => {
    const encoded = encodeURIComponent(message);
    if (isMobileDevice())
      return `https://api.whatsapp.com/send?phone=${recipientNumber}&text=${encoded}`;
    return `https://web.whatsapp.com/send?phone=${recipientNumber}&text=${encoded}`;
  };

  const handleWhatsappOrder = async (e) => {
    e.preventDefault();

    const name = nameRef.current?.value?.trim() || "";
    const whatsapp = whatsappRef.current?.value?.trim() || "";
    const address = addressRef.current?.value?.trim() || "";

    if (!name || !whatsapp || !address) {
      alert("Please fill Name, WhatsApp number and Address.");
      return;
    }

    // Build order text
    let orderText = `Order Details:\n\nName: ${name}\nWhatsApp: ${whatsapp}\nAddress: ${address}\n\n`;
    if (passedSummary && passedSummary.trim()) {
      orderText += `Order Summary:\n${passedSummary}`;
    } else if (passedProductList && passedProductList.length > 0) {
      orderText += "Product Name\tPrice\tQuantity\n";
      passedProductList.forEach((it) => {
        orderText += `${it.name}\t${it.price}\t${it.quantity}\n`;
      });
      orderText += `\nTotal: Rs${Number(passedTotal).toFixed(2)}`;
    } else {
      orderText += "No products in cart.";
    }

    const recipient = normalizePhoneForWhatsApp(RECIPIENT_WHATSAPP);
    if (!recipient) {
      alert("Invalid business WhatsApp number configured.");
      return;
    }

    setLoading(true);

    // Attempt backend save first
    let saved = false;
    try {
      const res = await storeCheckout(
        name,
        whatsapp,
        address,
        passedProductList,
        Number(passedTotal)
      );

      if (!res || !res.success) {
        const err = res?.error || "Unknown backend error";
        const cont = window.confirm(
          `Could not save order to backend: ${err}\n\nContinue to WhatsApp anyway?`
        );
        if (!cont) {
          setLoading(false);
          return;
        }
      } else {
        saved = true;
      }
    } catch (err) {
      const cont = window.confirm(
        `Error saving order to backend: ${
          err?.message || err
        }\n\nContinue to WhatsApp anyway?`
      );
      if (!cont) {
        setLoading(false);
        return;
      }
    }

    // open WhatsApp
    const url = buildWhatsAppUrl(recipient, orderText);
    window.open(url, "_blank");

    // clear cart if callback provided
    if (typeof clearCart === "function") clearCart();
    if (typeof setIsCartOpen === "function") setIsCartOpen(false);

    setLoading(false);

    // Optionally navigate home after placing order
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <form
        onSubmit={handleWhatsappOrder}
        className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-2xl space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Fill the details below to place order
        </h2>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            ref={nameRef}
            placeholder="Full name (e.g., John Doe)"
            className="mt-1 w-full rounded-lg border-2 border-gray-300 p-2 text-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="whatsapp"
            className="block text-sm font-medium text-gray-700"
          >
            WhatsApp Number
          </label>
          <input
            id="whatsapp"
            type="tel"
            ref={whatsappRef}
            placeholder="WhatsApp number (e.g., 9876543210)"
            className="mt-1 w-full rounded-lg border-2 border-gray-300 p-2 text-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <textarea
            id="address"
            rows={4}
            ref={addressRef}
            placeholder="Address, Landmark, City, District, State, Pincode (e.g., 123 Main St, Near Park, Pune, Pune, Maharashtra, 411001)"
            className="mt-1 w-full rounded-lg border-2 border-gray-300 p-2 text-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Summary
          </label>
          <div className="mt-1 rounded-lg border-2 border-gray-300 bg-white p-3 text-sm">
            {passedSummary ? (
              passedSummary.split("\n").map((line, i) => {
                if (!line.trim()) return null;
                if (line.includes("Product Name")) {
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-3 gap-2 pb-1.5 border-b-2 border-gray-300 font-semibold text-gray-700 text-xs"
                    >
                      <div>Product</div>
                      <div className="text-center">Price</div>
                      <div className="text-center">Qty</div>
                    </div>
                  );
                }
                if (line.includes("Total:")) {
                  const totalAmount = line.split(":")[1]?.trim();
                  return (
                    <div
                      key={i}
                      className="pt-2 border-t-2 border-gray-300 flex justify-between items-center"
                    >
                      <span className="font-bold text-sm text-gray-800">
                        Total:
                      </span>
                      <span className="font-bold text-lg text-green-600">
                        {totalAmount}
                      </span>
                    </div>
                  );
                }
                const parts = line.split("\t");
                if (parts.length === 3) {
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-3 gap-2 py-1 text-xs"
                    >
                      <div className="font-medium text-gray-800">
                        {parts[0]}
                      </div>
                      <div className="text-center text-gray-600">
                        ₹{parts[1]}
                      </div>
                      <div className="text-center text-gray-600">
                        ×{parts[2]}
                      </div>
                    </div>
                  );
                }
                return null;
              })
            ) : passedProductList && passedProductList.length > 0 ? (
              <>
                {passedProductList.map((it) => (
                  <div
                    key={it.id}
                    className="grid grid-cols-3 gap-2 py-1 text-xs"
                  >
                    <div className="font-medium text-gray-800">{it.name}</div>
                    <div className="text-center text-gray-600">₹{it.price}</div>
                    <div className="text-center text-gray-600">
                      ×{it.quantity}
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t-2 border-gray-300 flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-800">
                    Total:
                  </span>
                  <span className="font-bold text-lg text-green-600">
                    ₹{Number(passedTotal).toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">No products in cart</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-green-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm ${
            loading ? "opacity-60 cursor-wait" : ""
          }`}
        >
          {loading ? "Placing order..." : "Place order"}
        </button>
      </form>

      {/* If you still want the Cart modal view on this page, include it (pass props accordingly) */}
      {cart && cart.length > 0 && (
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          getCartTotal={getCartTotal}
          onLoginRequired={onLoginRequired}
        />
      )}
    </div>
  );
};

export default ContactForm;
