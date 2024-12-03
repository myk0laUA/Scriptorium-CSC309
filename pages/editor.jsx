import React, { useState, useEffect } from 'react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import Layout from '../components/Layout';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import '../app/globals.css';

// Logic influenced by ChatGPT
const EditorPage = () => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Write your code here');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [templateId, setTemplateId] = useState(null);
  const [templateDetails, setTemplateDetails] = useState({
    title: '',
    explanation: '',
    tags: '',
  });

  const router = useRouter();

  useEffect(() => {
    let token = null;
    let userId = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('accessToken');
      setIsAuthenticated(!!token);
      if (token) {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        userId = decodedToken.id;
      }
    }

    const storedTemplate = localStorage.getItem('selectedTemplate');
    const editingFlag = localStorage.getItem('isEditing');
    const forkingFlag = localStorage.getItem('isForking');

    if (storedTemplate) {
      const template = JSON.parse(storedTemplate);
      setTemplateId(template.id);
      setCode(template.code);
      setLanguage(template.language || 'javascript');
      setTemplateDetails({
        title: template.title,
        explanation: template.explanation,
        tags: template.tags,
      });

      if (userId && template.userId === userId) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }

      if (editingFlag === 'true') {
        setIsEditing(true);
      } else if (forkingFlag === 'true') {
        setIsForking(true);
      } else {
        setIsEditing(false);
        setIsForking(false);
      }

      localStorage.removeItem('selectedTemplate');
      localStorage.removeItem('isEditing');
      localStorage.removeItem('isForking');
    }
  }, []);

  const handleExecute = async () => {
    setIsExecuting(true);
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
      toast.error('Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('You need to log in to save changes.');
      return;
    }

    const updatedTemplate = {
      ...templateDetails,
      code,
      language,
    };

    try {
      await axios.put(`/api/templates/${templateId}`, updatedTemplate, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Template updated successfully!');
      router.push('/my-templates');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Error saving changes.');
    }
  };

  const handleForkTemplate = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('You need to log in to fork templates.');
      return;
    }

    const newTitle = prompt('Enter a title for the forked template:', `Fork of ${templateDetails.title}`);
    if (!newTitle) {
      toast.error('Title is required to fork the template.');
      return;
    }

    const forkedTemplateData = {
      title: newTitle,
      explanation: templateDetails.explanation,
      tags: templateDetails.tags,
      code,
      language,
    };

    try {
      await axios.post(`/api/templates/fork/${templateId}`, forkedTemplateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Template forked successfully!');
      router.push('/my-templates');
    } catch (error) {
      console.error('Error forking template:', error);
      toast.error('Error forking template.');
    }
  };

  const handleSaveAsTemplate = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('You need to log in to save templates.');
      return;
    }

    const templateData = {
      title: templateDetails.title || prompt('Enter template title:'),
      explanation:
        templateDetails.explanation || prompt('Enter template explanation:'),
      tags: templateDetails.tags || prompt('Enter tags (comma-separated):'),
      code,
      language,
    };

    if (!templateData.title || !templateData.code) {
      toast.error('Title and code are required to save the template.');
      return;
    }

    try {
      await axios.post('/api/templates', templateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Template saved successfully!');
      router.push('/my-templates');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error saving template.');
    }
  };

  return (
    <Layout>
      <div className="p-6 dark:bg-gray-900 dark:text-gray-200 transition duration-300">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            value={templateDetails.title}
            onChange={(e) =>
              setTemplateDetails((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 mb-2"
            disabled={!isAuthenticated ? true : false}
          />
          <textarea
            placeholder="Explanation"
            value={templateDetails.explanation}
            onChange={(e) =>
              setTemplateDetails((prev) => ({
                ...prev,
                explanation: e.target.value,
              }))
            }
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 mb-2"
            disabled={!isAuthenticated ? true : false}
          />
          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={templateDetails.tags}
            onChange={(e) =>
              setTemplateDetails((prev) => ({
                ...prev,
                tags: e.target.value,
              }))
            }
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            disabled={!isAuthenticated ? true : false}
          />
        </div>
        <div className="flex justify-between mb-4">
          <LanguageSelector
            language={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
          <div className="flex space-x-4">
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-800"
            >
              {isExecuting ? 'Executing...' : 'Run Code'}
            </button>
            {isAuthenticated && isEditing && (
              <button
                onClick={handleSaveChanges}
                className="bg-green-500 dark:bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 dark:hover:bg-green-800"
              >
                Save Changes
              </button>
            )}
            {isAuthenticated && isForking && (
              <button
                onClick={handleForkTemplate}
                className="bg-purple-500 dark:bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-600 dark:hover:bg-purple-800"
              >
                Fork Template
              </button>
            )}
            {isAuthenticated && !isEditing && !isForking && (
              <button
                onClick={handleSaveAsTemplate}
                className="bg-green-500 dark:bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 dark:hover:bg-green-800"
              >
                Save as Template
              </button>
            )}
          </div>
        </div>
        <CodeEditor
          language={language}
          code={code}
          onChange={(value) => setCode(value)}
        />
        <div className="mt-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Input:</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          />
        </div>
        <div className="mt-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Output:</h3>
          <pre className="w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            {output}
          </pre>
        </div>
      </div>
    </Layout>
  );
};

export default EditorPage;