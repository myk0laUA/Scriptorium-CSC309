import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Logic influenced by ChatGPT
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
    <div className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 rounded shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-gray-200">
        {template.title}
      </h3>
      <p className="text-gray-700 dark:text-gray-300 mb-2">
        {template.explanation}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Tags: {template.tags}
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={handleViewTemplate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          View Template
        </button>
        {userId === template.userId ? (
          <>
            <button
              onClick={handleEditTemplate}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteTemplate}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </>
        ) : (
          <button
            onClick={handleForkTemplate}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
          >
            Fork Template
          </button>
        )}
      </div>
    </div>
  );
};

export default TemplateCard;
