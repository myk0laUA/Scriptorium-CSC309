import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import CodeEditor from '../../components/CodeEditor';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';

const TemplateDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [template, setTemplate] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);

    if (id) {
      const fetchTemplate = async () => {
        try {
          const response = await axios.get(`/api/templates/${id}`);
          setTemplate(response.data);
          setCode(response.data.code);
          setLanguage(response.data.language || 'javascript');
        } catch (error) {
          console.error('Error fetching template:', error);
        }
      };
      fetchTemplate();
    }
  }, [id]);

  const handleFork = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to fork templates.');
      return;
    }

    const title = prompt('Enter a title for the forked template:');
    if (!title) {
      toast.error('Title is required to fork the template.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`/api/templates/fork/${id}`, {
        title,
        explanation: template.explanation,
        tags: template.tags,
        code,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Template forked successfully!');
      router.push('/my-templates');
    } catch (error) {
      toast.error('Error forking template.');
    }
  };

  const handleExecute = async () => {
    try {
      const response = await axios.post('/api/execute', {
        code,
        input,
        language,
      });

      if (response.data.output) {
        setOutput(response.data.output);
      } else if (response.data.error) {
        setOutput(response.data.error);
      }
    } catch (error) {
      toast.error('Execution failed.');
    }
  };

  return (
    <>
      <Navbar />
      {template && (
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{template.title}</h1>
          <p className="text-gray-700 mb-4">{template.explanation}</p>
          <CodeEditor
            language={language}
            code={code}
            onChange={(value) => setCode(value)}
          />
          <div className="mt-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-24 p-2 border rounded"
              placeholder="Enter input for your code..."
            />
          </div>
          <div className="mt-4">
            <button
              onClick={handleExecute}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Execute
            </button>
            {isAuthenticated && (
              <button
                onClick={handleFork}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4"
              >
                Fork Template
              </button>
            )}
          </div>
          <pre className="w-full h-24 p-2 border rounded bg-gray-100 mt-4">
            {output}
          </pre>
        </div>
      )}
    </>
  );
};

export default TemplateDetailPage;
