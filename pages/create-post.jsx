import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const CreatePost = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        linkToTemplates: [],
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [templates, setTemplates] = useState([]);

    // generated by ChatGPT
    useEffect(() => {
        const fetchTemplates = async () => {
          try {
            const response = await fetch('http://localhost:3000/api/templates/public?limit=100');
            if (!response.ok) {
              throw new Error('Failed to fetch templates');
            }
            const data = await response.json();
            setTemplates(data.templates); 
          } catch (err) {
            setError(err.message);
          }
        };
    
        fetchTemplates();
      }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
    };

    // generated by ChatGPT
    const handleTemplateChange = (e) => {
        const { options } = e.target;
        const selectedTemplates = [];
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

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        setError(null);
        setSuccess(null);


        try {

            {/* Generated by ChatGPT */}
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('You are not logged in');
                return;
            }
            
            const response = await fetch('http://localhost:3000/api/blogPost', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
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

        <div className="max-w-md mx-auto bg-white p-6 shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Create Blog Post</h2>

            {success && <div className="text-green-500 mb-4">{success}</div>}
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                <label className="block text-gray-700">Title</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                    required
                />
                </div>

                <div className="mb-4">
                <label className="block text-gray-700">Description</label>
                <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                    required
                />
                </div>

                <div className="mb-4">
                <label className="block text-gray-700">Tags</label>
                <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                    required
                />
                </div>

                {/* Generated by ChatGPT */}
                <div className="mb-4">
                    <label className="block text-gray-700">Linked Templates</label>
                    <select
                        name="linkToTemplates"
                        multiple
                        value={formData.linkToTemplates}
                        onChange={handleTemplateChange}
                        className="w-full p-2 mt-2 border border-gray-300 rounded"
                    >
                        {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                            {template.title}
                        </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                >
                    Upload Post
                </button>
            </form>

            <Link href="/blog-posts">
                <button
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                >
                Back
                </button>
            </Link>

            {error === 'You are not logged in' && (
        
            <div className="mt-6">
            <Link href="/login">
                <button className="bg-green-500 text-white px-6 py-3 rounded-lg text-xl hover:bg-blue-600 w-full">
                Log In
                </button>
            </Link>
            </div>
            
            )}

        </div>
    );
};

export default CreatePost;