import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TemplateCard from '../../components/TemplateCard';
import PaginationControls from '../../components/PaginationControls';
import Navbar from '../../components/Navbar';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const MyTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('/api/templates/user', {
          params: { page, limit: 10 },
          headers: { Authorization: `Bearer ${token}` },
        });
        setTemplates(response.data.templates);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        toast.error('Error fetching user templates.');
      }
    };

    fetchTemplates();
  }, [page]);

  const handleEdit = (id) => {
    router.push(`/my-templates/edit/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`/api/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Template deleted successfully.');
      setTemplates((prev) => prev.filter((template) => template.id !== id));
    } catch (error) {
      toast.error('Error deleting template.');
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">My Templates</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
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

export default MyTemplatesPage;
