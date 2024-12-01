import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SaveTemplateButton = ({ code, language }) => {
  const handleSave = async () => {
    let token = null;

    if (typeof window !== 'undefined') {
      token = localStorage.getItem('accessToken');
    }

    if (!token) {
      toast.error('You need to be logged in to save templates.');
      return;
    }

    const templateData = {
      title: 'Template Title',
      explanation: 'Template Explanation',
      tags: 'tag1,tag2',
      code,
      language,
    };

    try {
      await axios.post('/api/templates', templateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Template saved successfully.');
    } catch (error) {
      toast.error('Error saving template.');
    }
  };

  return (
    <button
      onClick={handleSave}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400"
    >
      Save as Template
    </button>
  );
};

export default SaveTemplateButton;
