import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../app/globals.css';

const MainPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="flex h-screen">
      <Navbar />
      <div className="flex-1 bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-5xl font-bold text-gray-800">Scriptorium</h1>
          {!isLoggedIn && (
            <div className="space-x-4">
              <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Log In
              </a>
              <a href="/signup" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Sign Up
              </a>
            </div>
          )}
        </div>
        {isLoggedIn && <p className="text-xl text-gray-700">Welcome back to Scriptorium!</p>}
      </div>
    </div>
  );
};

export default MainPage;
