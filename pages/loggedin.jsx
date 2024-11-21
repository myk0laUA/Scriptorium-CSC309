import React, { useState } from 'react';
import Link from 'next/link';
import '../app/globals.css';


const LoggedIn = () => {


  return (
    <div className="flex h-screen">
      
      <div className="w-1/4 bg-gray-800 text-white p-5 mt-40 h-screen fixed">
        <h2 className="text-2xl font-semibold mb-6">Categories</h2>
        <ul className="list-none">
          <li className="mb-4 hover:bg-gray-600 p-2 rounded cursor-pointer">Templates</li>
          <li className="mb-4 hover:bg-gray-600 p-2 rounded cursor-pointer">Blog Posts</li>
        </ul>
      </div>

      
      <div className="flex-1 bg-gray-100 p-6">
        {/* Top Navbar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-5xl font-bold text-gray-800">Scriptorium</h1>
          <div className="space-x-4">
            <Link href="/">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Log Out</button>
            </Link>
          </div>
        </div>
       </div>
    </div>
  );
};

export default LoggedIn;