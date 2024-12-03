
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../app/globals.css';

const EditTemplatePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({
    title: '',
    explanation: '',
    tags: '',
    code: '',
  });

  useEffect(() => {
    if (id) {
      const fetchTemplate = async () => {
        try {
          const response = await axios.get(`/api/templates/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData(response.data);
        } catch (error) {
          console.error('Error fetching template:', error);
        }
      };
      fetchTemplate();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/templates/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Template updated successfully.');
      router.push('/my-templates');
    } catch (error) {
      toast.error('Error updating template.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      {/* Form fields for title, explanation, tags, code */}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Save Changes
      </button>
    </form>
  );
};

export default EditTemplatePage;
