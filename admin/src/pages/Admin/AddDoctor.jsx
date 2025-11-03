import React, { useContext, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

const AddDoctor = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experience, setExperience] = useState('');
  const [about, setAbout] = useState('');
  const [degree, setDegree] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { backendUrl, aToken } = useContext(AdminContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log("🔑 Creating doctor with password:", password);
  
    try {
      const doctorData = {
        name,
        email,
        password,
        experience,
        about,
        degree,
        speciality: degree,
        address: { line1: address1, line2: address2 },
      };
  
      console.log("📤 Sending doctor data:", doctorData);
  
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
        setAbout('');
        setDegree('');
        setAddress1('');
        setAddress2('');
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
          
          {/* Password with Eye Icon */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 pr-12 outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
            required
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