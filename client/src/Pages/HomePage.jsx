import React, { useState, useEffect } from "react";
import { fetchEvents } from "../Apis/Events";
import { fetchAllTrades, fetchTradesByDate } from "../Apis/Trades";
import dayjs from "dayjs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [trades, setTrades] = useState([]);
  const [pnlData, setPnlData] = useState([]);
  const [isLoading, setIsLoading] = useState({
    events: false,
    trades: false
  });

  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(prev => ({ ...prev, events: true }));
      try {
        const result = await fetchEvents();
        if (result.success) {
          const today = dayjs().format("YYYY-MM-DD");
          setEvents(result.events.filter(e => dayjs(e.date).format("YYYY-MM-DD") === today));
        }
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, events: false }));
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    const loadTrades = async () => {
      setIsLoading(prev => ({ ...prev, trades: true }));
      try {
        const result = await fetchTradesByDate(dateRange.startDate, dateRange.endDate);
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
        setIsLoading(prev => ({ ...prev, trades: false }));
      }
    };

    loadTrades();
  }, [dateRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const pnlValue = payload[0].value;
      const isPositive = pnlValue >= 0;

      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{label}</p>
          <p className={`tooltip-value ${isPositive ? 'positive' : 'negative'}`}>
            Net PNL: ${pnlValue.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const processPnlData = (trades) => {
    const pnlByDate = trades.reduce((acc, trade) => {
      const date = dayjs(trade.entry_date).format('MMM D');
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

  return (
    <div className="dashboard-container bg-gray-800">
      {/* Events Marquee */}
      <div className="events-marquee">
        {isLoading.events ? (
          <div className="loading-text">Loading events...</div>
        ) : (
          <marquee>
            {events.length > 0
              ? events.map((e, index) => (
                <span key={index} className="event-item">
                  {e.name} - {e.venue} ({dayjs(e.date).format("h:mm A")})
                </span>
              ))
              : <span className="no-events">No events scheduled for today</span>}
          </marquee>
        )}
      </div>

      {/* Date Range Filter */}
      <div className="date-filter-container">
        <div className="date-filter">
          <label className="date-label">
            Start Date:
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              max={dateRange.endDate}
              className="date-input"
            />
          </label>
          <label className="date-label">
            End Date:
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              min={dateRange.startDate}
              max={dayjs().format('YYYY-MM-DD')}
              className="date-input"
            />
          </label>
        </div>
      </div>

      {/* PNL Line Chart */}
      <div className="chart-container">
        <h3 className="chart-title">Daily Net PNL</h3>
        {isLoading.trades ? (
          <div className="loading-text">Loading PNL data...</div>
        ) : pnlData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={pnlData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                stroke="#333"
                tick={{ fill: '#333' }}
              />
              <YAxis
                stroke="#333"
                tick={{ fill: '#333' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="pnl"
                stroke="#4CAF50"
                strokeWidth={3}
                activeDot={{ r: 8, fill: '#4CAF50' }}
                name="Net PNL"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">No PNL data available</div>
        )}
      </div>

      <style jsx>{`
  .dashboard-container {
    padding: 20px;
    font-family: 'Roboto', sans-serif;
    background-color: #2d3748; /* bg-gray-800 */
    min-height: 100vh;
    color: #e2e8f0; /* Light text for dark background */
  }
  
  .events-marquee {
    background-color: #4a5568; /* bg-gray-700 */
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 24px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    border: 1px solid #4a5568;
  }
  
  marquee {
    height: 30px;
    line-height: 30px;
  }
  
  .event-item {
    margin-right: 32px;
    color: #63b3ed; /* blue-400 */
    font-weight: 500;
  }
  
  .no-events {
    color: #a0aec0; /* gray-400 */
    font-style: italic;
  }
  
  .date-filter-container {
    background-color: #4a5568; /* bg-gray-700 */
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    border: 1px solid #4a5568;
  }
  
  .date-filter {
    display: flex;
    gap: 20px;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .date-label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-weight: 500;
    color: #e2e8f0; /* gray-200 */
  }
  
  .date-input {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #4a5568;
    background-color: #2d3748;
    color: #e2e8f0;
    font-family: inherit;
    transition: border 0.3s;
  }
  
  .date-input:focus {
    outline: none;
    border-color: #63b3ed; /* blue-400 */
  }
  
  .chart-container {
    background-color: #4a5568; /* bg-gray-700 */
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    border: 1px solid #4a5568;
  }
  
  .chart-title {
    margin-top: 0;
    margin-bottom: 20px;
    color: #e2e8f0;
    font-size: 1.5rem;
    font-weight: 500;
  }
  
  .loading-text {
    color: #a0aec0; /* gray-400 */
    text-align: center;
    padding: 20px;
  }
  
  .no-data {
    color: #a0aec0; /* gray-400 */
    text-align: center;
    padding: 20px;
    font-style: italic;
  }
  
  .custom-tooltip {
    background-color: #2d3748;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    border: 1px solid #4a5568;
  }
  
  .tooltip-date {
    margin: 0;
    font-weight: bold;
    color: #e2e8f0;
  }
  
  .tooltip-value {
    margin: 5px 0 0 0;
    font-weight: bold;
  }
  
  .tooltip-value.positive {
    color: #68d391; /* green-400 */
  }
  
  .tooltip-value.negative {
    color: #fc8181; /* red-300 */
  }
`}</style>
    </div>
  );
};

export default HomePage;