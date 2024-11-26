// components/CodeEditor.jsx
import React from 'react';
import MonacoEditor from '@monaco-editor/react';

const CodeEditor = ({ language, code, onChange }) => (
  <MonacoEditor
    height="500px"
    defaultLanguage={language}
    value={code}
    onChange={onChange}
    theme="vs-dark"
  />
);

export default CodeEditor;
