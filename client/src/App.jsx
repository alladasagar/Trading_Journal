import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

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
            <Route path="/events/:eventId/edit" element={<EventForm isEdit={true} />} />
            <Route path="/" element={<HomePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
