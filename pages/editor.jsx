import React, { useState, useEffect } from 'react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

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
    // Check if the user is authenticated
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

    // Retrieve template data from localStorage
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

      // Check if the template belongs to the authenticated user
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

      // Clear localStorage to prevent stale data
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
    <>
      <Navbar />
      <div className="p-6">
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
            className="w-full p-2 border rounded mb-2"
            disabled={!isEditing && !isForking}
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
            className="w-full p-2 border rounded mb-2"
            disabled={!isEditing && !isForking}
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
            className="w-full p-2 border rounded"
            disabled={!isEditing && !isForking}
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
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {isExecuting ? 'Executing...' : 'Run Code'}
            </button>
            {isAuthenticated && isEditing && (
              <button
                onClick={handleSaveChanges}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save Changes
              </button>
            )}
            {isAuthenticated && isForking && (
              <button
                onClick={handleForkTemplate}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Fork Template
              </button>
            )}
            {isAuthenticated && !isEditing && !isForking && !isOwner && (
              <button
                onClick={() => {
                  setIsForking(true);
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Fork Template
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
          <h3 className="font-semibold">Input:</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-24 p-2 border rounded"
          />
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">Output:</h3>
          <pre className="w-full h-24 p-2 border rounded bg-gray-100">
            {output}
          </pre>
        </div>
      </div>
    </>
  );
};

export default EditorPage;