import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import '../app/globals.css';

// Logic influenced by ChatGPT
const MainPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <Layout>
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
        <div
          className={`flex-1 p-6 flex flex-col items-center justify-center ${
            isLoggedIn ? 'mt-0' : 'mt-40'
          }`}
        >
          <div className="text-center mb-12">
            {isLoggedIn ? (
              <>
                <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                  Let's continue your coding journey!
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-400 mb-12">
                  Write templates, create blog posts, or simply execute your code.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-7xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                  Welcome to Scriptorium
                </h1>
                <p className="text-2xl text-gray-700 dark:text-gray-400 mb-12">
                  The code execution powerhouse for all your coding needs.
                </p>
              </>
            )}
            <div className="flex flex-col items-center space-y-4 mb-6 mt-22">
            {isLoggedIn ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                <Link
                  href="/editor"
                  className="bg-purple-500 dark:bg-purple-700 text-white px-4 py-3 rounded-lg text-2xl hover:bg-purple-600 dark:hover:bg-purple-800 transition duration-300 text-center"
                >
                  Launch Editor
                </Link>
                <Link
                  href="/templates"
                  className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-3 rounded-lg text-2xl hover:bg-blue-600 dark:hover:bg-blue-800 transition duration-300 text-center"
                >
                  Explore Templates
                </Link>
                <Link
                  href="/blog-posts"
                  className="bg-green-500 dark:bg-green-700 text-white px-4 py-3 rounded-lg text-2xl hover:bg-green-600 dark:hover:bg-green-800 transition duration-300 text-center"
                >
                  Explore Blogs
                </Link>
                <Link
                  href="/my-templates"
                  className="bg-orange-500 dark:bg-orange-700 text-white px-4 py-3 rounded-lg text-2xl hover:bg-orange-600 dark:hover:bg-orange-800 transition duration-300 text-center"
                >
                  My Templates
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-4">
                  <Link
                    href="/login"
                    className="bg-blue-500 dark:bg-blue-700 text-white px-14 py-3 rounded-lg text-xl hover:bg-blue-600 dark:hover:bg-blue-800 transition duration-300"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-green-500 dark:bg-green-700 text-white px-12 py-3 rounded-lg text-xl hover:bg-green-600 dark:hover:bg-green-800 transition duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
                <div className="mt-16">
                  <Link
                    href="/editor"
                    className="bg-purple-500 dark:bg-purple-700 text-white px-28 py-4 rounded-lg text-xl hover:bg-purple-600 dark:hover:bg-purple-800 transition duration-300"
                  >
                    Launch Editor
                  </Link>
                </div>
              </div>
            )}
            </div>
          </div>
          {!isLoggedIn && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-24">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl dark:hover:shadow-gray-700 transition duration-300 text-center">
                <img
                  src="https://media1.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif?cid=6c09b952f4192g0h14jzoupe7l66kblwzl1g84duvao7qdxn&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g"
                  alt="Execute Code"
                  className="w-full h-48 object-cover mb-4 rounded-lg"
                />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Execute Code</h2>
                <p className="text-gray-700 dark:text-gray-400">
                  Run your code in various programming languages directly in your browser.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl dark:hover:shadow-gray-700 transition duration-300 text-center">
                <img
                  src="https://codecondo.com/wp-content/uploads/2017/04/Programming-Blogs-and-Website.jpg"
                  alt="Create Templates"
                  className="w-full h-48 object-cover mb-4 rounded-lg"
                />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Create Templates</h2>
                <p className="text-gray-700 dark:text-gray-400">
                  Build and share templates to streamline your coding workflow.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl dark:hover:shadow-gray-700 transition duration-300 text-center">
                <img
                  src="https://images.ctfassets.net/q5ulk4bp65r7/7p2bRaTZ4zasc2Y0fDuzKR/4b8a2d04fb65f3521037123d7bb4fa07/Learn_Illustration_What_is_a_Fork.jpg"
                  alt="Fork Templates"
                  className="w-full h-48 object-cover mb-4 rounded-lg"
                />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Fork Templates</h2>
                <p className="text-gray-700 dark:text-gray-400">
                  Easily fork and customize templates to suit your needs.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl dark:hover:shadow-gray-700 transition duration-300 text-center">
                <img
                  src="https://www.seozoom.com/wp-content/uploads/2023/06/Progetto-senza-titolo-2024-04-30T150038.923.jpg"
                  alt="Read Blog Posts"
                  className="w-full h-48 object-cover mb-4 rounded-lg"
                />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Read Blog Posts</h2>
                <p className="text-gray-700 dark:text-gray-400">
                  Stay updated with the latest trends and tutorials in the coding world.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl dark:hover:shadow-gray-700 transition duration-300 text-center">
                <img
                  src="https://images.pexels.com/photos/374720/pexels-photo-374720.jpeg?cs=srgb&dl=pexels-burst-374720.jpg&fm=jpg"
                  alt="Write Blog Posts"
                  className="w-full h-48 object-cover mb-4 rounded-lg"
                />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Write Blog Posts</h2>
                <p className="text-gray-700 dark:text-gray-400">
                  Share your knowledge and insights with the community.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl dark:hover:shadow-gray-700 transition duration-300 text-center">
                <img
                  src="https://i.pinimg.com/originals/2a/53/65/2a53651a35816f499270d8275fd5318f.gif"
                  alt="Community Support"
                  className="w-full h-48 object-cover mb-4 rounded-lg"
                />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Community Support</h2>
                <p className="text-gray-700 dark:text-gray-400">
                  Get help and support from a vibrant community of developers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MainPage;
