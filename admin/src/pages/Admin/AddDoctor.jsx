import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [about, setAbout] = useState('');
  const [degree, setDegree] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');

  const { backendUrl, aToken } = useContext(AdminContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const doctorData = {
        name,
        email,
        password, // plain text for demo
        experience,
        fees: Number(fees),
        about,
        degree,
        address: { line1: address1, line2: address2 },
      };

      const res = await fetch(`${backendUrl}/api/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aToken}`,
        },
        body: JSON.stringify(doctorData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Doctor added successfully!');
        console.log('Response:', data);

        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setExperience('');
        setFees('');
        setAbout('');
        setDegree('');
        setAddress1('');
        setAddress2('');
        setDocImg(null);
      } else {
        toast.error(data.message || 'Failed to add doctor');
      }
    } catch (error) {
      console.error('AddDoctor Error:', error);
      toast.error('Something went wrong while adding the doctor');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-6"
    >
      <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2">
        Add Doctor
      </h2>

      {/* Doctor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            placeholder="Fees"
            required
            value={fees}
            onChange={(e) => setFees(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Experience</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={`${i + 1} Year`}>
                {i + 1} Year
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Education / Degree"
            required
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Address Line 1"
            required
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Address Line 2"
            required
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <textarea
        placeholder="About Doctor"
        rows={5}
        required
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        type="submit"
        className="w-full bg-blue-500 text-white font-medium py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Add Doctor
      </button>
    </form>
  );
};

export default AddDoctor;
