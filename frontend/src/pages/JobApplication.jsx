import React, { useState } from "react";
import axios from "axios";

const JobApplication = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    message: "",
    resume: null,
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      await axios.post(`${backendUrl}/api/job-applications`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("✅ Application submitted successfully!");
      setForm({
        name: "",
        email: "",
        phone: "",
        position: "",
        message: "",
        resume: null,
      });
    } catch (error) {
      console.error("Application error:", error);
      setStatus("❌ Failed to submit. Please try again.");
    }
  };

  return (
    <div className="px-6 md:px-20 py-12 max-w-3xl mx-auto">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
        Job Application
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full border rounded-lg p-3"
          required
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border rounded-lg p-3"
          required
        />
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full border rounded-lg p-3"
        />
        <input
          type="text"
          name="position"
          value={form.position}
          onChange={handleChange}
          placeholder="Position Applying For"
          className="w-full border rounded-lg p-3"
        />
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us why you want to join our team..."
          className="w-full border rounded-lg p-3"
        />
        <input
          type="file"
          name="resume"
          onChange={handleChange}
          accept=".pdf,.doc,.docx"
          className="w-full"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 transition"
        >
          Submit Application
        </button>
      </form>
      {status && <p className="mt-4 text-gray-700">{status}</p>}
    </div>
  );
};

export default JobApplication;
