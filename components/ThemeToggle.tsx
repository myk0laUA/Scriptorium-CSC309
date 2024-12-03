import React, { useEffect, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

// Logic influenced by ChatGPT
const ThemeToggle = () => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === "dark") {
            setDarkMode(true);
        }
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <div onClick={() => setDarkMode(!darkMode)} className="cursor-pointer">
            {darkMode ? <FaSun size={24} className="text-yellow-300" /> : <FaMoon size={24} className="text-gray-400" />}
        </div>
    );
};

export default ThemeToggle;