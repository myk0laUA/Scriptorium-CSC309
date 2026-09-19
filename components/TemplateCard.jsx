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
    <div className="surface-card flex min-w-0 flex-col p-5 sm:p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-shadow hover:shadow-lg">
      <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200 break-words">
        {template.title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 mb-4 break-words">
        {template.explanation}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-5" aria-label="Tags">
        {(template.tags || '').split(',').filter(tag => tag.trim()).map((tag, index) =>
          <span key={`${tag}-${index}`} className="max-w-full break-words rounded-md bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">{tag.trim()}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-auto pt-1 text-sm">
        <button
          onClick={handleViewTemplate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          View Template
        </button>
        {userId === template.userId ? (
          <>
            <button
              onClick={handleEditTemplate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
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
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
          >
            Fork Template
          </button>
        )}
      </div>
    </div>
  );
};

export default TemplateCard;
