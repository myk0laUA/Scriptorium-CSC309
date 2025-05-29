import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';

// Logic influenced by ChatGPT
const Navbar = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);

    if (!token) {
      return;
    }

    const user = JSON.parse(atob(token.split('.')[1]));
    setIsAdmin(user.role === 'ADMIN');

    const fetchAvatar = async () => {
      try {
        const response = await fetch('/api/users/retrieve', {
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.href = "/"
  };

  const getLinkClass = (path) => {
    return router.pathname === path
      ? 'text-red-500 dark:text-red-400 font-bold hover:text-red-600 dark:hover:text-red-500 transition duration-300 text-lg'
      : 'hover:text-gray-400 dark:hover:text-gray-300 transition duration-300 text-lg';
  };

  return (
    <nav className="bg-gray-800 dark:bg-gray-600 text-white dark:text-gray-200 p-4 flex justify-between items-center transition duration-300">
      <div className="flex space-x-6 items-center">
        <Link href="/" legacyBehavior>
          <a className={`${getLinkClass('/')} pr-4 border-r border-gray-500 dark:border-gray-700`}>
            Home
          </a>
        </Link>
        <Link href="/editor" legacyBehavior>
          <a className={getLinkClass('/editor')}>Editor</a>
        </Link>
        <Link href="/templates" legacyBehavior>
          <a className={getLinkClass('/templates')}>Templates</a>
        </Link>
        <Link href="/blog-posts" legacyBehavior>
          <a className={getLinkClass('/blog-posts')}>Blog Posts</a>
        </Link>
        {isLoggedIn && (
          <Link href="/my-templates" legacyBehavior>
            <a className={getLinkClass('/my-templates')}>My Templates</a>
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {isLoggedIn && avatar && (
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 dark:border-blue-300">
            <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
          </div>
        )}
        {isAdmin && (
          <Link href="/admin-reports" legacyBehavior>
            <a className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-800 transition duration-300">
              Admin Reports
            </a>
          </Link>
        )}
        {isLoggedIn && (
          <Link href="/edit-profile" legacyBehavior>
            <a className="bg-green-500 dark:bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 dark:hover:bg-green-800 transition duration-300">
              Edit Profile
            </a>
          </Link>
        )}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600 dark:hover:bg-red-800 transition duration-300"
          >
            Logout
          </button>
        ) : (
          <Link href="/login" legacyBehavior>
            <a className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-800 transition duration-300">
              Login
            </a>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
