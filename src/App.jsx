import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { motion } from 'framer-motion';

function App() {
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latLon = `${position.coords.latitude},${position.coords.longitude}`;
          fetchWeather(latLon);
        },
        (error) => {
          console.error("Khong lay duoc vi tri", error);
          fetchWeather("Hanoi, Vietnam");
        }
      );
    } else {
      fetchWeather("Hanoi, Vietnam");
    }
  }, []);

  const fetchWeather = async (searchLocation) => {
    setLoading(true);
    try {
      const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
      console.log("Kiem tra API key: ", API_KEY);
      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${searchLocation}/yesterday/tomorrow?unitGroup=metric&key=${API_KEY}`;

      const response = await axios.get(url);
      setWeatherData(response.data);
      setLocation(response.data.resolvedAddress);
    } catch (error) {
      alert("Khong tim thay vi tri hoac co loi xay ra");
    } finally {
      setLoading(false);
    }
  };

  const getHourlyData = (data) => {
    if (!data) return [];

    const allHours = [];
    data.days.forEach(day => {
      day.hours.forEach(hour => {
        allHours.push({ ...hour, timestamp: hour.datetimeEpoch * 1000 });
      });
    });

    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    return allHours.filter(
      hour => hour.timestamp >= (now - oneDayInMs) && hour.timestamp <= (now + oneDayInMs)
    );
  };

  return (
    <div className='min-h-screen bg-gray-100 p-8'>
      {/* In put & Search / Refresh */}
      <div className='flex gap-2 mb-8'>
        <input
          type='text'
          placeholder='Nhap ten thanh pho...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') fetchWeather(e.target.value) }}
          className='border p-2 rounded'
        />
        <button onClick={() => fetchWeather(searchQuery)}>Search</button>
        <button onClick={() => fetchWeather(location)}>Refresh</button>
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Dang tai du lieu...
        </motion.div>
      ) : weatherData ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/*Current Weather Display */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2>Thời tiết tại: {location}</h2>
            <p>Nhiệt độ: {weatherData.currentConditions.temp}°C</p>
            <p>Sức gió: {weatherData.currentConditions.windspeed} km/h</p>
            <p>Khả năng mưa: {weatherData.currentConditions.precipprob}%</p>
            <p>Tình trạng: {weatherData.currentConditions.conditions}</p>
          </div>

          {/* 24h Trước và Sau */}
          <div className="overflow-x-auto whitespace-nowrap bg-white p-6 rounded-xl shadow-md">
            <h3>Dự báo 24h trước & sau</h3>
            <div className="flex gap-4">
              {getHourlyData(weatherData).map((hour, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="inline-block border p-4 rounded text-center"
                >
                  <p>{new Date(hour.timestamp).getHours()}:00</p>
                  <p>{hour.temp}°C</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

export default App
