import React, { useState, lazy } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import ConfirmModal from "./ui/ConfirmModal";
import { useToast } from "./context/ToastContext";

const Home = lazy(() => import("../Pages/HomePage"));
const Premarket = lazy(() => import("./Premarket/Premarket"));
const Strategies = lazy(() => import("./Strategies/Strategies"));
const TradesPage = lazy(() => import("./Trades/TradesPage"));
const EventsPage = lazy(() => import("./Events/EventsPage"));

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("token");
    addToast("Logout successful", "success");
    navigate("/login");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Mobile menu button */}
      <div className="md:hidden bg-black p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#27c284]">Trading Journal</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-[#27c284] focus:outline-none"
          aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

      </div>


      <div
        className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-black text-white p-4`}
      >
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-[#27c284] hidden md:block">Trading Journal</h1>
        </div>

        <nav>
          <ul className="space-y-2 md:space-y-4">
            <li>
              <NavLink
                to="/home"
                end
                className={({ isActive }) =>
                  `flex items-center w-full p-2 rounded transition duration-200 ${isActive
                    ? "bg-gray-800 text-[#27c284]"
                    : "text-[#27c284] hover:bg-gray-800"
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/strategies"
                className={({ isActive }) =>
                  `flex items-center w-full p-2 rounded transition duration-200 ${isActive
                    ? "bg-gray-800 text-[#27c284]"
                    : "text-[#27c284] hover:bg-gray-800"
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Strategies
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/premarket"
                className={({ isActive }) =>
                  `flex items-center w-full p-2 rounded transition duration-200 ${isActive
                    ? "bg-gray-800 text-[#27c284]"
                    : "text-[#27c284] hover:bg-gray-800"
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Premarket
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  `flex items-center w-full p-2 rounded transition duration-200 ${isActive
                    ? "bg-gray-800 text-[#27c284]"
                    : "text-[#27c284] hover:bg-gray-800"
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Events
              </NavLink>
            </li>
            <li>
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center w-full p-2 rounded transition duration-200 text-[#27c284] hover:bg-gray-800 cursor-pointer"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m0-4V9a3 3 0 016 0v1" />
                </svg>
                Logout
              </button>
            </li>

          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-900 overflow-auto">
        <Outlet />
      </div>
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
      />

    </div>
  );
};

export default Navbar;