import React, { useState } from 'react';
import Link from 'next/link';

// Logic influenced by ChatGPT
const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    linkToTemplates: [],
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('You are not logged in');
        return;
      }

      const response = await fetch('http://localhost:3000/api/blogPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Blog post created successfully!');
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Error connecting to the server. Please try again later.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Create Blog Post</h2>

      {success && <div className="text-green-500 dark:text-green-400 mb-4">{success}</div>}
      {error && <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 mt-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 mt-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300">Tags</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full p-2 mt-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300">Linked Templates</label>
          <input
            type="text"
            name="linkToTemplates"
            value={formData.linkToTemplates}
            onChange={handleChange}
            className="w-full p-2 mt-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-800 w-full"
        >
          Upload Post
        </button>
      </form>

      <Link href="/blog-posts">
        <button className="mt-4 bg-gray-500 dark:bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-800 w-full">
          Back
        </button>
      </Link>

      {error === 'You are not logged in' && (
        <div className="mt-6">
          <Link href="/login">
            <button className="bg-green-500 dark:bg-green-700 text-white px-6 py-3 rounded-lg text-xl hover:bg-green-600 dark:hover:bg-green-800 w-full">
              Log In
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CreatePost;