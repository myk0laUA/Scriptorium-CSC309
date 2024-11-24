import React, { useState } from 'react';
import Link from 'next/link';

import './avatar-selection.css';

const availableAvatars = [ 
    'http://localhost:3000/avatars/avatar1.png',
    'http://localhost:3000/avatars/avatar2.png',
    'http://localhost:3000/avatars/avatar3.png',
    'http://localhost:3000/avatars/avatar4.png',
    'http://localhost:3000/avatars/avatar5.png'
];

{/* Generated by ChatGPT */}
const SignUp = () => {
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        avatar: '',
        phoneNum: '',
        role: 'USER',
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

    const handleAvatarSelect = (avatar) => {
        setFormData((prevData) => ({
          ...prevData,
          avatar,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        setError(null);
        setSuccess(null);

        try {
            
            const response = await fetch('http://localhost:3000/api/users/signup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
            });
      
            const result = await response.json();
      
            if (response.ok) {
              setSuccess('User created successfully!');
            } else {
              setError(result.error || 'Something went wrong. Please try again.');
            }
          } catch (err) {
            setError('Error connecting to the server. Please try again later.');
          }
        };

        return (

        
        <div className="max-w-md mx-auto bg-white p-6 shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>

            {success && <div className="text-green-500 mb-4">{success}</div>}
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                <label className="block text-gray-700">Username</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                    required
                />
                </div>

                <div className="mb-4">
                <label className="block text-gray-700">First Name</label>
                <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                    required
                />
                </div>

                <div className="mb-4">
                <label className="block text-gray-700">Last Name</label>
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                    required
                />
                </div>

                <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                    required
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
                    required
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
                    required
                />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Select an Avatar</label>
                    <div className="avatar-selection">
                        {availableAvatars.map((avatar) => (
                            <div
                                key={avatar}
                                className={`avatar-container ${formData.avatar === avatar ? 'selected' : ''}`}
                                onClick={() => handleAvatarSelect(avatar)}
                            >
                            <img
                                src={avatar}
                                alt={`Avatar`}
                                className="avatar"
                            />
                        </div>
                        ))}
                    </div>
                </div>                

                
                <div className="mb-4">
                <label className="block text-gray-700">Role</label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-2 mt-2 border border-gray-300 rounded"
                >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                </select>
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                >
                    Sign Up
                </button>
            </form>

            <Link href="/">
                <button
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                >
                Cancel
                </button>
            </Link>

            {success && (
                <div className="mt-4">
                <Link href="/login">
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full">
                    Log In
                    </button>
                </Link>
                </div>
            )}

        </div>
    );
};

export default SignUp;