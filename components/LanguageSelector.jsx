import React from 'react';

const LanguageSelector = ({ language, onChange, supportedLanguages }) => {
  return (
    <select value={language} onChange={onChange} className="p-2 border rounded">
      {supportedLanguages.map((lang) => (
        <option key={lang} value={lang}>
          {lang.toUpperCase()}
        </option>
      ))}
    </select>
  );
};

LanguageSelector.defaultProps = {
  supportedLanguages: ['javascript', 'python', 'c', 'cpp', 'java'],
};

export default LanguageSelector;
