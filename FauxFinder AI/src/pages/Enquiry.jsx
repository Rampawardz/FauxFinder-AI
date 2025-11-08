import React, { useState } from "react";

const Enquiry = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thank you for contacting us!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-orange-50 pt-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-10">
        <h2 className="text-3xl font-bold text-orange-600 mb-8 text-center animate-pulse">
          Get in Touch
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {["name", "email", "subject"].map((field) => (
            <div key={field} className="relative">
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                placeholder=" "
                className="peer w-full px-5 py-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:border-transparent focus:ring-4 focus:ring-orange-300 transition"
              />
              <label className="absolute left-5 top-3 text-orange-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-orange-300 peer-focus:top-0 peer-focus:text-sm peer-focus:text-orange-500 transition-all">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
            </div>
          ))}

          <div className="relative">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              placeholder=" "
              required
              className="peer w-full px-5 py-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:border-transparent focus:ring-4 focus:ring-orange-300 transition resize-none"
            ></textarea>
            <label className="absolute left-5 top-3 text-orange-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-orange-300 peer-focus:top-0 peer-focus:text-sm peer-focus:text-orange-500 transition-all">
              Message
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold shadow-lg hover:from-orange-500 hover:to-orange-700 transform hover:scale-105 transition-all"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Enquiry;
