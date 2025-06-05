import React, { useState, useEffect } from "react";
import { fetchEvents } from "../Apis/Events";
import { fetchTradesByDate } from "../Apis/Trades";
import Loader from "../Components/ui/Loader"; 
import dayjs from "dayjs";
import { FaChartLine } from "react-icons/fa";
import { SiZerodha, SiTradingview } from "react-icons/si";
import { MdShowChart } from "react-icons/md";
import { TbBulb } from "react-icons/tb";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";


const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [trades, setTrades] = useState([]);
  const [pnlData, setPnlData] = useState([]);
  const [isLoading, setIsLoading] = useState({
    events: false,
    trades: false
  });

  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD")
  });

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading((prev) => ({ ...prev, events: true }));
      try {
        const result = await fetchEvents();
        if (result.success) {
          const today = dayjs().format("YYYY-MM-DD");
          setEvents(
            result.events.filter(
              (e) => dayjs(e.date).format("YYYY-MM-DD") === today
            )
          );
        }
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setIsLoading((prev) => ({ ...prev, events: false }));
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    const loadTrades = async () => {
      setIsLoading((prev) => ({ ...prev, trades: true }));
      try {
        const result = await fetchTradesByDate(
          dateRange.startDate,
          dateRange.endDate
        );
        if (result.success) {
          setTrades(result.trades);
          const processedData = processPnlData(result.trades);
          setPnlData(processedData);
        } else {
          console.log(result.message);
        }
      } catch (error) {
        console.log("Something went Wrong", error);
      } finally {
        setIsLoading((prev) => ({ ...prev, trades: false }));
      }
    };

    loadTrades();
  }, [dateRange]);

  const generateCalendarData = () => {
    const startDate = dayjs(dateRange.startDate);
    const endDate = dayjs(dateRange.endDate);
    const daysInMonth = endDate.diff(startDate, "day") + 1;

    const pnlByDate = trades.reduce((acc, trade) => {
      const date = dayjs(trade.entry_date).format("YYYY-MM-DD");
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += trade.net_pnl;
      return acc;
    }, {});

    const calendarData = [];
    let currentWeek = [];

    for (let i = 0; i < daysInMonth; i++) {
      const currentDate = startDate.add(i, "day");
      const dateStr = currentDate.format("YYYY-MM-DD");
      const dayOfWeek = currentDate.day();

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        calendarData.push(currentWeek);
        currentWeek = [];
      }

      const pnl = pnlByDate[dateStr] || 0;
      currentWeek.push({
        date: dateStr,
        day: currentDate.date(),
        pnl: parseFloat(pnl.toFixed(2)),
        isCurrentMonth: true
      });
    }

    if (currentWeek.length > 0) {
      calendarData.push(currentWeek);
    }

    return calendarData;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const pnlValue = payload[0].value;
      const isPositive = pnlValue >= 0;

      return (
        <div className="custom-tooltip bg-gray-800 border border-gray-700 p-3 rounded shadow-lg">
          <p className="tooltip-date text-[#27c284] font-medium">{label}</p>
          <p
            className={`tooltip-value ${
              isPositive ? "text-green-400" : "text-red-400"
            } font-bold`}
          >
            Net PNL: ₹{pnlValue.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CalendarDayTooltip = ({ date, pnl }) => {
    const isPositive = pnl >= 0;

    return (
      <div className="calendar-tooltip bg-gray-800 border border-gray-700 p-2 rounded shadow-lg text-xs">
        <p className="text-[#27c284] font-medium">
          {dayjs(date).format("MMM D, YYYY")}
        </p>
        <p
          className={`${
            isPositive ? "text-green-400" : "text-red-400"
          } font-bold`}
        >
          Net PNL: ₹{pnl.toFixed(2)}
        </p>
      </div>
    );
  };

  const processPnlData = (trades) => {
    const pnlByDate = trades.reduce((acc, trade) => {
      const date = dayjs(trade.entry_date).format("MMM D");
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += trade.net_pnl;
      return acc;
    }, {});

    return Object.entries(pnlByDate).map(([date, pnl]) => ({
      date,
      pnl: parseFloat(pnl.toFixed(2))
    }));
  };

  const calendarData = generateCalendarData();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-6 p-4">
        <h2 className="text-xl font-semibold text-[#27c284] mb-4 text-center">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
          <a
            href="https://kite.zerodha.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform duration-200 bg-gray-700 p-4 rounded-lg border border-gray-600 flex flex-col items-center text-white"
          >
            <SiZerodha size={28} className="mb-2 text-[#27c284]" />
            <span>Zerodha</span>
          </a>
          <a
            href="https://groww.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform duration-200 bg-gray-700 p-4 rounded-lg border border-gray-600 flex flex-col items-center text-white"
          >
            <MdShowChart size={28} className="mb-2 text-[#27c284]" />
            <span>Groww</span>
          </a>
          <a
            href="https://in.tradingview.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform duration-200 bg-gray-700 p-4 rounded-lg border border-gray-600 flex flex-col items-center text-white"
          >
            <SiTradingview size={28} className="mb-2 text-[#27c284]" />
            <span>TradingView</span>
          </a>
          <a
            href="https://sensibull.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform duration-200 bg-gray-700 p-4 rounded-lg border border-gray-600 flex flex-col items-center text-white"
          >
            <TbBulb size={28} className="mb-2 text-[#27c284]" />
            <span>Sensibull</span>
          </a>
          <a
            href="https://trade.fyers.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform duration-200 bg-gray-700 p-4 rounded-lg border border-gray-600 flex flex-col items-center text-white"
          >
            <FaChartLine size={28} className="mb-2 text-[#27c284]" />
            <span>Fyers</span>
          </a>
        </div>
      </div>
      {/* Events Marquee */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-6">
        <div className="p-4">
          {isLoading.events ? (
            <Loader />
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-[rgb(232,244,239)] mb-2 text-center">
                Today's Events
              </h2>
              <marquee>
                {events.length > 0 ? (
                  events.map((e, index) => (
                    <span key={index} className="text-[#27c284] mx-8 text-2xl">
                      {e.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">
                    No events scheduled for today
                  </span>
                )}
              </marquee>
            </div>
          )}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-6 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-300 mb-1 text-sm font-medium">
              Start Date:
            </label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              max={dateRange.endDate}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#27c284]"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-300 mb-1 text-sm font-medium">
              End Date:
            </label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              min={dateRange.startDate}
              max={dayjs().format("YYYY-MM-DD")}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#27c284]"
            />
          </div>
        </div>
      </div>

      {/* PNL Line Chart */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-6 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-medium text-[#27c284] mb-4">
          Daily Net PNL
        </h3>
        {isLoading.trades ? (
          <Loader />
        ) : pnlData.length > 0 ? (
          <div className="h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={pnlData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pnl"
                  stroke="#27c284"
                  strokeWidth={3}
                  activeDot={{ r: 8, fill: "#27c284" }}
                  name="Net PNL"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No PNL data available
          </div>
        )}
      </div>

      {/* Calendar Component */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4 sm:p-6 cursor-pointer">
        <h3 className="text-lg sm:text-xl font-medium text-[#27c284] mb-4">
          Daily PNL Calendar
        </h3>
        {isLoading.trades ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="calendar-grid">
                <div className="calendar-header flex">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="flex-1 text-center py-2 text-xs font-medium text-[#27c284]"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>
                {calendarData.map((week, weekIndex) => (
                  <div key={weekIndex} className="calendar-week flex">
                    {week.map((day, dayIndex) => {
                      const isProfit = day.pnl > 0;
                      const isLoss = day.pnl < 0;
                      const isNeutral = day.pnl === 0;

                      return (
                        <div
                          key={dayIndex}
                          className={`flex-1 min-w-[40px] sm:min-w-[60px] h-12 sm:h-16 border border-gray-700 relative
                            ${
                              isProfit
                                ? "bg-green-900/30 hover:bg-green-900/50"
                                : ""
                            } 
                            ${
                              isLoss ? "bg-red-900/30 hover:bg-red-900/50" : ""
                            }
                            ${
                              isNeutral
                                ? "bg-gray-700/20 hover:bg-gray-700/40"
                                : ""
                            }
                          `}
                        >
                          <div className="absolute top-1 right-1 text-xs text-gray-300">
                            {day.day}
                          </div>
                          {day.pnl !== 0 && (
                            <div className="calendar-day-pnl absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <CalendarDayTooltip date={day.date} pnl={day.pnl} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
