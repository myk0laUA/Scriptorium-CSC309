import React, { useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

// Logic influenced by ChatGPT
const CodeEditor = ({ language, code, onChange }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Update theme based on the document's class
    const currentTheme = document.documentElement.classList.contains('dark')
      ? 'vs-dark'
      : 'light';
    setTheme(currentTheme);

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const updatedTheme = document.documentElement.classList.contains('dark')
        ? 'vs-dark'
        : 'light';
      setTheme(updatedTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <MonacoEditor
      height="500px"
      defaultLanguage={language}
      value={code}
      onChange={onChange}
      theme={theme} // Dynamically set the theme
    />
  );
};

export default CodeEditor;
