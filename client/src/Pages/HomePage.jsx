import React, { useState, useEffect } from "react";
import { fetchEvents } from "../Apis/Events";
import { fetchTradesByDate } from "../Apis/Trades";
import { eventsCache } from "../utilities/Cache/EventCache";
import { graphCache } from "../utilities/Cache/GraphCache";
import { calendarCache } from "../utilities/Cache/CalendarCache";
import Loader from "../Components/ui/Loader";
import dayjs from "dayjs";
import { FaChartLine, FaChevronLeft, FaChevronRight } from "react-icons/fa";
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

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD")
  });

   const handleClearDates = () => {
    setDateRange({
      startDate: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
      endDate: dayjs().format("YYYY-MM-DD")
    });
  };

  // Custom Tooltip Component (moved to top)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const pnlValue = payload[0].value;
      const isPositive = pnlValue >= 0;

      return (
        <div className="custom-tooltip bg-gray-800 border border-gray-700 p-3 rounded shadow-lg">
          <p className="tooltip-date text-[#27c284] font-medium">{label}</p>
          <p
            className={`tooltip-value ${isPositive ? "text-green-400" : "text-red-400"
              } font-bold`}
          >
            Net PNL: ₹{pnlValue.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const navigateMonth = (direction) => {
    const newMonth = direction === 'prev'
      ? currentMonth.subtract(1, 'month')
      : currentMonth.add(1, 'month');

    setCurrentMonth(newMonth);
  };

  // Process PNL data
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

  // Load events with cache
  useEffect(() => {
    const loadEvents = async () => {
      if (eventsCache.isValid()) {
        const cachedEvents = eventsCache.get().data;
        filterTodaysEvents(cachedEvents);
        return;
      }

      setIsLoading(prev => ({ ...prev, events: true }));
      try {
        const result = await fetchEvents();
        if (result.success) {
          eventsCache.set(result.events);
          filterTodaysEvents(result.events);
        }
      } catch (error) {
        console.log("Error loading events:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, events: false }));
      }
    };

    const filterTodaysEvents = (allEvents) => {
      const today = dayjs().format('YYYY-MM-DD');
      const todaysEvents = allEvents.filter(event =>
        dayjs(event.date).format('YYYY-MM-DD') === today
      );
      setEvents(todaysEvents);
    };

    loadEvents();
  }, []);

  // Load trades with GraphCache
  useEffect(() => {
    const loadTrades = async () => {
      const cacheKey = `${dateRange.startDate}-${dateRange.endDate}`;
      
      if (graphCache.isValid() && graphCache.get().data?.range === cacheKey) {
        const cachedData = graphCache.get().data;
        setTrades(cachedData.trades);
        setPnlData(cachedData.pnlData);
        return;
      }

      setIsLoading((prev) => ({ ...prev, trades: true }));
      try {
        const result = await fetchTradesByDate(
          dateRange.startDate,
          dateRange.endDate
        );
        if (result.success) {
          const processedData = processPnlData(result.trades);
          setTrades(result.trades);
          setPnlData(processedData);
          graphCache.set({
            trades: result.trades,
            pnlData: processedData,
            range: cacheKey
          });
        }
      } catch (error) {
        console.log("Error loading trades:", error);
      } finally {
        setIsLoading((prev) => ({ ...prev, trades: false }));
      }
    };

    loadTrades();
  }, [dateRange]);

  // Load calendar trades
  const loadCalendarTrades = async (month) => {
    const startDate = month.startOf('month').format("YYYY-MM-DD");
    const endDate = month.endOf('month').format("YYYY-MM-DD");

    try {
      const result = await fetchTradesByDate(startDate, endDate);
      if (result.success) {
        return result.trades;
      }
    } catch (error) {
      console.log("Error loading calendar trades:", error);
      return [];
    }
  };

  // Generate calendar data with CalendarCache
  const generateCalendarData = async () => {
    const monthKey = currentMonth.format('YYYY-MM');
    
    if (calendarCache.isValid() && calendarCache.get().data?.month === monthKey) {
      return calendarCache.get().data.calendarData;
    }

    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const daysInMonth = endOfMonth.date();
    const startDay = startOfMonth.day();
    const endDay = endOfMonth.day();
    const daysFromPrevMonth = startDay;
    const daysFromNextMonth = 6 - endDay;

    const calendarTrades = await loadCalendarTrades(currentMonth);

    const tradesByDate = calendarTrades.reduce((acc, trade) => {
      const date = dayjs(trade.entry_date).format("YYYY-MM-DD");
      if (!acc[date]) {
        acc[date] = {
          count: 0,
          pnl: 0
        };
      }
      acc[date].count += 1;
      acc[date].pnl += trade.net_pnl;
      return acc;
    }, {});

    const calendarData = [];
    let currentWeek = [];

    // Previous month days
    for (let i = 0; i < daysFromPrevMonth; i++) {
      const date = startOfMonth.subtract(daysFromPrevMonth - i, 'day');
      currentWeek.push({
        date: date.format("YYYY-MM-DD"),
        day: date.date(),
        pnl: null,
        tradesCount: null,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = startOfMonth.date(i);
      const dateStr = date.format("YYYY-MM-DD");
      const tradesData = tradesByDate[dateStr] || { count: 0, pnl: 0 };

      currentWeek.push({
        date: dateStr,
        day: i,
        pnl: parseFloat(tradesData.pnl.toFixed(2)),
        tradesCount: tradesData.count,
        isCurrentMonth: true
      });

      if (currentWeek.length === 7 || i === daysInMonth) {
        calendarData.push(currentWeek);
        currentWeek = [];
      }
    }

    // Next month days
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = endOfMonth.add(i, 'day');
      currentWeek.push({
        date: date.format("YYYY-MM-DD"),
        day: date.date(),
        pnl: null,
        tradesCount: null,
        isCurrentMonth: false
      });

      if (currentWeek.length === 7) {
        calendarData.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      calendarData.push(currentWeek);
    }

    // Cache the calendar data
    calendarCache.set({
      calendarData,
      month: monthKey
    });

    return calendarData;
  };

  const [calendarData, setCalendarData] = useState([]);

  // Load calendar data with cache
  useEffect(() => {
    const loadData = async () => {
      const data = await generateCalendarData();
      setCalendarData(data);
    };
    loadData();
  }, [currentMonth]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Quick Access Links */}
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
                Today's Events ({dayjs().format('MMMM D, YYYY')})
              </h2>
              <marquee className="h-8 flex items-center">
                {events.length > 0 ? (
                  events.map((e, index) => (
                    <span key={index} className="text-[#27c284] mx-8 text-2xl flex items-center">
                      {e.name} {e.time && `@ ${e.time}`}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 mx-8 text-xl">
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-medium text-[#27c284]">
            Date Range Filter
          </h3>
          <button
            onClick={handleClearDates}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-[#27c284] rounded-md text-sm transition-colors"
          >
            Clear Dates
          </button>
        </div>
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
          Daily Net PNL ({dayjs(dateRange.startDate).format('MMM D')} - {dayjs(dateRange.endDate).format('MMM D, YYYY')})
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
            No PNL data available for selected date range
          </div>
        )}
      </div>

      {/* Calendar Component */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <FaChevronLeft className="text-[#27c284]" />
          </button>
          <h3 className="text-lg sm:text-xl font-medium text-[#27c284]">
            {currentMonth.format('MMMM YYYY')}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <FaChevronRight className="text-[#27c284]" />
          </button>
        </div>

        {isLoading.trades ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <th
                        key={day}
                        className="text-center py-2 text-xs font-medium text-[#27c284] border border-gray-700"
                      >
                        {day}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {calendarData.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((day, dayIndex) => {
                      const isProfit = day.pnl > 0;
                      const isLoss = day.pnl < 0;
                      const isNeutral = day.pnl === 0;
                      const isOtherMonth = !day.isCurrentMonth;

                      return (
                        <td
                          key={dayIndex}
                          className={`
                            h-16 sm:h-20 border border-gray-700 p-1 align-top
                            ${isOtherMonth ? 'text-gray-500 bg-gray-900/20' : 'text-gray-300'}
                            ${isProfit ? "bg-green-900/30" : ""} 
                            ${isLoss ? "bg-red-900/30" : ""}
                            ${isNeutral && !isOtherMonth ? "bg-gray-700/20" : ""}
                            min-w-[40px] sm:min-w-[60px]
                          `}
                        >
                          <div className="flex flex-col h-full">
                            <div className="text-xs self-end">
                              {day.day}
                            </div>
                            {day.pnl !== null && !isOtherMonth && (
                              <div className="flex-1 flex flex-col justify-center items-center text-xs space-y-1">
                                <div className={`
                                  ${isProfit ? 'text-green-400' : ''}
                                  ${isLoss ? 'text-red-400' : ''}
                                  ${isNeutral ? 'text-gray-400' : ''}
                                `}>
                                  {day.pnl !== 0 ? `₹${day.pnl.toFixed(2)}` : '-'}
                                </div>
                                {day.tradesCount > 0 && (
                                  <div className="text-[15px] text-center">
                                    {day.tradesCount} trade{day.tradesCount !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;