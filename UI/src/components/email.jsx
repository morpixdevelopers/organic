import React from "react";
import { useForm, ValidationError } from "@formspree/react";
import { useLocation } from "react-router-dom";

const ContactForm = () => {
    const location = useLocation();
    const cartSummary = location.state?.data || "";
    console.log(cartSummary);
  const [state, handleSubmit] = useForm("xpwywnzb");
  if (state.succeeded) {
    return (
      <p className="text-green-600 text-center font-semibold mt-4">
        ✅ Thanks for the order!
      </p>
    );
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-2xl space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        Contact Us
      </h2>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          className="mt-1 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-2"
          required
        />
        <ValidationError
          prefix="Email"
          field="email"
          errors={state.errors}
          className="text-red-500 text-sm mt-1"
        />
      </div>
      <div>
        <label htmlFor="number" className="block text-sm font-medium text-gray-700">
            Phone Number
        </label>
        <input
          id="phone number"
          type="text"
          name="number"
          className="mt-1 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-2"
          required
        />
        <ValidationError
          prefix="number"
          field="number"
          errors={state.errors}
          className="text-red-500 text-sm mt-1"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          rows={4}
          className="mt-1 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-2"
          required
        />
        <ValidationError
          prefix="Address"
          field="address"
          errors={state.errors}
          className="text-red-500 text-sm mt-1"
        />
      </div>
      <div>
        <label htmlFor="list" className="block text-sm font-medium text-gray-700">
          Product List
        </label>
        <textarea
          id="list"
          name="list"
          rows={4}
          value ={cartSummary}
          className="mt-1 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm p-2"
          required
        />
        <ValidationError
          prefix="list"
          field="list"
          errors={state.errors}
          className="text-red-500 text-sm mt-1"
        />
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {state.submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default ContactForm;
