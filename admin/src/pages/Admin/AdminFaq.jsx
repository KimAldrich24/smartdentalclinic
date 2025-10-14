import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AdminFaq = () => {
  const { aToken, backendUrl } = useContext(AdminContext);

  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch FAQs
  useEffect(() => {
    const fetchFaqs = async () => {
      if (!aToken) return console.error("No admin token found.");

      try {
        const res = await axios.get(`${backendUrl}/api/faqs`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        setFaqs(res.data.faqs || []);
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      }
    };

    fetchFaqs();
  }, [aToken, backendUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question || !answer) return;

    try {
      if (editingId) {
        const res = await axios.put(
          `${backendUrl}/api/faqs/${editingId}`,
          { question, answer },
          { headers: { Authorization: `Bearer ${aToken}` } }
        );

        setFaqs(faqs.map((faq) => (faq._id === editingId ? res.data.faq : faq)));
        setEditingId(null);
      } else {
        const res = await axios.post(
          `${backendUrl}/api/faqs`,
          { question, answer },
          { headers: { Authorization: `Bearer ${aToken}` } }
        );

        setFaqs([...faqs, res.data.faq]);
      }

      setQuestion("");
      setAnswer("");
    } catch (error) {
      console.error("Failed to save FAQ:", error);
    }
  };

  const handleDeleteFaq = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/faqs/${id}`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      setFaqs(faqs.filter((faq) => faq._id !== id));
    } catch (error) {
      console.error("Failed to delete FAQ:", error);
    }
  };

  const handleEditFaq = (faq) => {
    setEditingId(faq._id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Manage FAQs</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Enter Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          placeholder="Enter Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        ></textarea>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? "Update FAQ" : "Add FAQ"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setQuestion("");
                setAnswer("");
              }}
              className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {faqs.length === 0 ? (
          <p className="text-gray-500">No FAQs found.</p>
        ) : (
          faqs.map((faq) => (
            <div
              key={faq._id}
              className="p-4 border rounded flex justify-between items-start"
            >
              <div>
                <h2 className="font-semibold text-gray-800">{faq.question}</h2>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEditFaq(faq)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteFaq(faq._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFaq;
