import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

// Logic influenced by ChatGPT
const Layout = ({ children }) => {

  return (
    <div className={`flex flex-col min-h-screen`}>
      <Navbar />
      <main className="flex-1 bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-gray-100">
        {children}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2024 Scriptorium. Daniel Kaloshi, Parth Vats, Mykola Zhuk.</p>
      </footer>
    </div>
  );
};

export default Layout;