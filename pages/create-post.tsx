import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../app/globals.css';

//used ChatGPT for conversion to tsx
interface Template {
  id: number;
  title: string;
}

interface FormData {
  title: string;
  description: string;
  tags: string;
  linkToTemplates: number[];
}

const CreatePost: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    tags: '',
    linkToTemplates: [],
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates/public?limit=100');
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await response.json();
        setTemplates(data.templates);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchTemplates();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { options } = e.target;
    const selectedTemplates: number[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedTemplates.push(Number(options[i].value));
      }
    }
    setFormData((prevData) => ({
      ...prevData,
      linkToTemplates: selectedTemplates,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('You are not logged in');
        return;
      }

      const response = await fetch('/api/blogPost', {
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
          <label className="block text-gray-700 dark:text-gray-300">
            Linked Templates (press Ctrl for multi-selection)
          </label>
          <select
            name="linkToTemplates"
            multiple
            value={formData.linkToTemplates.map(String)}
            onChange={handleTemplateChange}
            className="w-full p-2 mt-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded"
          >
            {templates.map((template) => (
              <option
                key={template.id}
                value={template.id}
                className="text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900"
              >
                {template.title}
              </option>
            ))}
          </select>
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