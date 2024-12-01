import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TemplateCard from '../../components/TemplateCard';
import Layout from '../../components/Layout';
import PaginationControls from '../../components/PaginationControls';
import { toast } from 'react-toastify';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/api/templates/public', {
          params: { search, page, limit: 10 },
        });
        setTemplates(response.data.templates);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };
    fetchTemplates();
  }, [search, page]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('You need to be logged in to delete templates.');
        return;
      }

      await axios.delete(`/api/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Template deleted successfully.');
      // Remove the deleted template from the state
      setTemplates((prev) => prev.filter((template) => template.id !== id));
    } catch (error) {
      toast.error('Error deleting template.');
    }
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-100 dark:bg-gray-900">
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDelete={handleDelete}
            />
          ))}
        </div>
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </Layout>
  );
};

export default TemplatesPage;
