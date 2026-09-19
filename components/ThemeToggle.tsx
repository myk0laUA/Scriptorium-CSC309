import React, { useEffect, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

// Logic influenced by ChatGPT
const ThemeToggle = () => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        setDarkMode(theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    }, []);

    const toggleTheme = () => {
        const next = !darkMode;
        setDarkMode(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };

    return (
        <button type="button" onClick={toggleTheme} aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:bg-gray-700">
            {darkMode ? <FaSun size={19} /> : <FaMoon size={19} />}
        </button>
    );
};

export default ThemeToggle;
