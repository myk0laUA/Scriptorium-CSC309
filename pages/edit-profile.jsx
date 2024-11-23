import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const EditProfile = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        avatar: '',
        phoneNum: '',
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setError('No authentication token found');
                    return;
                }

                const response = await fetch('http://localhost:3000/api/users/edit-profile', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const userData = await response.json();

                setFormData({
                    email: userData.email || '',
                    password: '',
                    avatar: userData.avatar || '',
                    phoneNum: userData.phoneNum || '',
                });

            } catch (err) {
                setError('Failed to load user data. Please try again.');
            }
        };

        fetchUserData();
    }, []);    

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
                setError('No authentication token found');
                return;
            }

            const response = await fetch('http://localhost:3000/api/users/edit-profile', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(formData),
            });
      
            const result = await response.json();
      
            if (response.ok) {
              setSuccess('Profile edited successfully!');
            } else {
              setError(result.error || 'Something went wrong. Please try again.');
            }

          } catch (err) {
            setError('Error connecting to the server. Please try again later.');
          }
        };

        return (

        <div className="max-w-md mx-auto bg-white p-6 shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>

            {success && <div className="text-green-500 mb-4">{success}</div>}
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                />
                </div>

                <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                />
                </div>

                <div className="mb-4">
                <label className="block text-gray-700">Avatar</label>
                <input
                    type="text"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                />
                </div>

                <div className="mb-4">
                <label className="block text-gray-700">Phone Number</label>
                <input
                    type="text"
                    name="phoneNum"
                    value={formData.phoneNum}
                    onChange={handleChange}
                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                />
                </div>
                
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                >
                    Confirm Changes
                </button>
                
            </form>

            <Link href="/loggedin">
                <button
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                >
                Back
                </button>
            </Link>

        </div>
    );
};

export default EditProfile;