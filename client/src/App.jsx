import React, { useState, useEffect } from 'react';
import { Route, Routes, BrowserRouter, useNavigate } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import HomePage from './Pages/HomePage';
import Strategies from './Components/Strategies/Strategies';
import Premarket from './Components/Premarket/Premarket';
import Navbar from './Components/Navbar';
import AddStrategy from './Components/Strategies/AddStartegy';
import AddPremarket from './Components/Premarket/AddPremarket';
import ViewStrategy from './Components/Strategies/ViewStrategy';
import TradesPage from './Components/Trades/TradesPage';
import TradeForm from './Components/Trades/TradeForm';
import ViewTrade from './Components/Trades/ViewTrade';
import EventsPage from './Components/Events/EventsPage';
import EventForm from './Components/Events/EventForm';
import PrivateRoute from './Components/context/PrivateRoute';
import OfflinePage from './Components/ui/OfflinePage';

const NetworkAwareRouter = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      if (window.location.pathname !== '/offline') {
        navigate('/offline');
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      if (window.location.pathname === '/offline') {
        navigate(-1);
      }
    };


    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <NetworkAwareRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/offline" element={<OfflinePage />} />

          {/* 🔒 Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Navbar />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/strategies" element={<Strategies />} />
              <Route path="/premarket" element={<Premarket />} />
              <Route path="/addstrategy" element={<AddStrategy />} />
              <Route path="/edit-strategy/:id" element={<AddStrategy />} />
              <Route path="/addpremarket" element={<AddPremarket />} />
              <Route path="/edit-premarket/:id" element={<AddPremarket />} />
              <Route path="/strategies/:id" element={<ViewStrategy />} />
              <Route path="/strategies/:id/trades" element={<TradesPage />} />
              <Route path="/strategies/:strategyId/add-trade" element={<TradeForm />} />
              <Route path="/strategies/:strategyId/trades/:tradeId/edit" element={<TradeForm isEdit={true} />} />
              <Route path="/trades/:id" element={<ViewTrade />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/addEvent" element={<EventForm isEdit={false} />} />
              <Route path="/events/:eventId" element={<EventForm isEdit={true} />} />
              <Route path="/" element={<HomePage />} />
            </Route>
          </Route>
        </Routes>
      </NetworkAwareRouter>
    </BrowserRouter>
  );
}

export default App;