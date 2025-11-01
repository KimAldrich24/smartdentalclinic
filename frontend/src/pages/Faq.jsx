import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../context/AdminContext.jsx"; // correct relative path
import { PatientContext } from "../context/PatientContext";

const Faq = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const { aToken, backendUrl } = useContext(PatientContext);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/faqs`,
          {
            headers: {
              Authorization: `Bearer ${aToken}`, // include JWT token
            },
          }
        );

        // Ensure we have an array
        setFaqs(res.data.faqs || []);
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      }
    };

    fetchFaqs();
  }, [aToken]);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
        Frequently Asked Questions
      </h1>

      {faqs.length === 0 ? (
        <p className="text-center text-gray-500">No FAQs available.</p>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq._id}
              className="border border-gray-300 rounded-lg shadow-sm"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-700 hover:bg-gray-50"
              >
                {faq.question}
                <span className="text-xl">{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Faq;
