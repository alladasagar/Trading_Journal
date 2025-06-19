import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { login } from '../Apis/Auth';
import { useToast } from '../Components/context/ToastContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      const response = await login(formData);

      if (response?.status === 200 && response?.token) {
        addToast(response.message || "Login successful", "success");
        localStorage.setItem("token", response.token);
        navigate('/home');
      } else {
        addToast(response.message || "Login failed. Please check your credentials.", "error");
      }
    } catch (error) {
      addToast("Something went wrong.", "error");
    } finally {
      setLoading(false);
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
            <label htmlFor="email" className="block text-[#27c284] text-sm font-medium mb-2">
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
            <label htmlFor="password" className="block text-[#27c284] text-sm font-medium mb-2">
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
            disabled={loading}
            className={`w-full flex items-center justify-center bg-[#27c284] hover:bg-[#1fa873] text-white font-bold py-2 px-4 rounded-md transition duration-200 cursor-pointer ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 
                  1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
