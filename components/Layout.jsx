import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

// Logic influenced by ChatGPT
const Layout = ({ children }) => {

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 text-gray-900 dark:text-gray-100">
        {children}
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800 px-4 py-6 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; 2024 Scriptorium. Daniel Kaloshi, Parth Vats, Mykola Zhuk.</p>
      </footer>
    </div>
  );
};

export default Layout;
