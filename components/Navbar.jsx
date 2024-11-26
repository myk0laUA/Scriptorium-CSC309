import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="flex space-x-4">
        <Link href="/">Home</Link>
        <Link href="/editor">Editor</Link>
        <Link href="/templates">Templates</Link>
        <Link href="/blog-posts">Blog Posts</Link>
        {isLoggedIn && <Link href="/my-templates">My Templates</Link>}
      </div>
      <div>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
