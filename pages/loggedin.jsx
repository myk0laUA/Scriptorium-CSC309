import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import '../app/globals.css';

const LoggedIn = () => {
  const router = useRouter();
  const [avatar, setAvatar] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    const user = JSON.parse(atob(token.split('.')[1]));
    setIsAdmin(user.role === 'ADMIN');

    const fetchAvatar = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users/retrieve', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setAvatar(userData.avatar);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchAvatar();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  return (
    <div className="flex h-screen">
      <Navbar />
      <div className="flex-1 bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-5xl font-bold text-gray-800">Welcome to Scriptorium</h1>
          <div className="flex items-center space-x-4">
            {avatar && (
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
                <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
              </div>
            )}
            <a
              href="/edit-profile"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit Profile
            </a>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoggedIn;
