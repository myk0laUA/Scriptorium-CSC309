import React from 'react';

const LanguageSelector = ({ language, onChange, supportedLanguages }) => {
  return (
    <select
      value={language}
      onChange={onChange}
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition duration-300"
    >
      {supportedLanguages.map((lang) => (
        <option
          key={lang}
          value={lang}
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        >
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
