import React, { useContext, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

const AddDoctor = () => {
  const { backendUrl, aToken } = useContext(AdminContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [experience, setExperience] = useState('');
  const [about, setAbout] = useState('');
  const [degree, setDegree] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [strength, setStrength] = useState('');

  // 🔐 Password validation
  const validatePassword = (value) => {
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      setStrength('Weak');
      return false;
    }
    if (!/[A-Z]/.test(value)) {
      setPasswordError('Password must contain an uppercase letter');
      setStrength('Medium');
      return false;
    }
    if (!/[0-9]/.test(value)) {
      setPasswordError('Password must contain a number');
      setStrength('Medium');
      return false;
    }

    setPasswordError('');
    setStrength('Strong');
    return true;
  };

  // 📤 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      toast.error('Password does not meet requirements');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate experience
    if (experience === '' || experience < 0 || experience > 50) {
      toast.error('Experience must be between 0 and 50 years');
      return;
    }

    try {
      const doctorData = {
        name,
        email,
        password,
        experience: parseFloat(experience), // ensure number
        about,
        degree,
        speciality: degree,
        address: {
          line1: address1,
          line2: address2,
        },
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

        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setExperience('');
        setAbout('');
        setDegree('');
        setAddress1('');
        setAddress2('');
        setStrength('');
      } else {
        toast.error(data.message || 'Failed to add doctor');
      }
    } catch (error) {
      toast.error('Something went wrong');
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              className="w-full border rounded-lg px-3 py-2 pr-12 focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Strength Indicator */}
          {strength && (
            <p
              className={`text-sm font-medium ${
                strength === 'Weak'
                  ? 'text-red-500'
                  : strength === 'Medium'
                  ? 'text-yellow-500'
                  : 'text-green-600'
              }`}
            >
              Password Strength: {strength}
            </p>
          )}

          {passwordError && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}

          {/* Confirm Password */}
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 ${
              confirmPassword && password !== confirmPassword
                ? 'border-red-500'
                : ''
            }`}
          />

          {confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-red-500">Passwords do not match</p>
          )}

          {/* Experience Input (Number with decimals) */}
          <div>
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              placeholder="Experience in years (e.g., 0.5)"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter in years. Example: 0.5 = 6 months
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Education / Degree"
            required
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="text"
            placeholder="Address Line 1"
            required
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="text"
            placeholder="Address Line 2"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <textarea
        rows={5}
        placeholder="About Doctor"
        required
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
      />

      <button
        type="submit"
        disabled={
          password !== confirmPassword ||
          passwordError ||
          strength !== 'Strong'
        }
        className={`w-full py-2 rounded-lg font-medium transition ${
          password !== confirmPassword ||
          passwordError ||
          strength !== 'Strong'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        Add Doctor
      </button>
    </form>
  );
};

export default AddDoctor;
