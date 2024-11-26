import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const TemplateCard = ({ template, onDelete }) => {
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        setUserId(JSON.parse(atob(token.split('.')[1])).id);
      }
    }
  }, []);

  const handleViewTemplate = () => {
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    router.push('/editor');
  };

  const handleEditTemplate = () => {
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    localStorage.setItem('isEditing', 'true');
    router.push('/editor');
  };

  const handleDeleteTemplate = () => {
    if (onDelete) {
      onDelete(template.id);
    }
  };

  const handleForkTemplate = () => {
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    localStorage.setItem('isForking', 'true');
    router.push('/editor');
  };

  return (
    <div className="border p-4 rounded">
      <h3 className="font-bold text-xl mb-2">{template.title}</h3>
      <p className="text-gray-700 mb-2">{template.explanation}</p>
      <p className="text-sm text-gray-500 mb-2">Tags: {template.tags}</p>
      <div className="flex space-x-2 mt-2">
        <button
          onClick={handleViewTemplate}
          className="text-blue-500 hover:underline"
        >
          View Template
        </button>
        {userId === template.userId ? (
          <>
            <button
              onClick={handleEditTemplate}
              className="text-green-500 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteTemplate}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </>
        ) : (
          // Show "Fork Template" button for templates not owned by the user
          <button
            onClick={handleForkTemplate}
            className="text-purple-500 hover:underline"
          >
            Fork Template
          </button>
        )}
      </div>
    </div>
  );
};

export default TemplateCard;
