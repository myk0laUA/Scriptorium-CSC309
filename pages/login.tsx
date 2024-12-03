import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import '../app/globals.css';

// used ChatGPT for conversion to tsx
interface FormData {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  error?: string;
}

const LogIn: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Logged in successfully!');
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
        router.push('/'); // Redirect after login
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Error connecting to the server. Please try again later.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Log In</h2>
      {success && <div className="text-green-500 mb-4">{success}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 mt-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 mt-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-800 w-full mb-4"
        >
          Log In
        </button>
      </form>
      <Link href="/signup">
        <button className="block bg-green-500 dark:bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 dark:hover:bg-green-800 w-full text-center mb-4">
          New User? Sign Up
        </button>
      </Link>
      <Link href="/">
        <button className="block bg-red-500 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600 dark:hover:bg-red-800 w-full text-center">
          Cancel
        </button>
      </Link>
    </div>
  );
};

export default LogIn;
