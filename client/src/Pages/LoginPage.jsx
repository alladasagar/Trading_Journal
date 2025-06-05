import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { login } from '../Apis/Auth';
import { useToast } from '../Components/context/ToastContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const { addToast } = useToast();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await login(formData);

    if (response?.status === 200 && response?.token) {
      addToast( response.message || "Login successful", "success");
      localStorage.setItem("token", response.token);

      navigate('/home');
    } else {
      addToast(response.message || "Login failed. Please check your credentials." , "error");
    }

  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 rounded-lg shadow-xl p-8"
        >
          <h2 className="text-[#27c284] text-2xl font-bold mb-6 text-center">
            Welcome Back
          </h2>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-[#27c284] text-sm font-medium mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#27c284] text-white"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-[#27c284] text-sm font-medium mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#27c284] text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#27c284] hover:bg-[#1fa873] text-white font-bold py-2 px-4 rounded-md transition duration-200 cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
