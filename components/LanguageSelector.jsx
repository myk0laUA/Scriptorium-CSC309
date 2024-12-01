const LanguageSelector = ({ language, onChange }) => {
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'swift', label: 'Swift' },
    { value: 'r', label: 'R' },
  ];

  return (
    <select
      value={language}
      onChange={onChange}
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition duration-300"
    >
      {languages.map((lang) => (
        <option
          key={lang.value}
          value={lang.value}
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        >
          {lang.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
