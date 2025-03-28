import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ShieldCheck, RefreshCw, Copy, Check, Sun, Moon } from 'lucide-react';
import { checkPasswordStrength, generateStrongPassword, type PasswordStrength } from './utils/passwordStrength';

function App() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const checkStrength = async () => {
      if (password) {
        setLoading(true);
        try {
          const result = await checkPasswordStrength(password);
          setStrength(result);
        } catch (error) {
          console.error('Error checking password strength:', error);
        }
        setLoading(false);
      } else {
        setStrength(null);
      }
    };

    const debounceTimer = setTimeout(checkStrength, 300);
    return () => clearTimeout(debounceTimer);
  }, [password]);

  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword();
    setPassword(newPassword);
  };

  const handleCopyPassword = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Password Strength Checker</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              {password && (
                <button
                  onClick={handleCopyPassword}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  title="Copy password"
                >
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              )}
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleGeneratePassword}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors w-full justify-center"
          >
            <RefreshCw size={20} />
            Generate Strong Password
          </button>

          {loading && (
            <div className="text-center text-gray-600 dark:text-gray-400">
              Checking password strength...
            </div>
          )}

          {strength && !loading && (
            <>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Strength:</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: strength.color }}
                  >
                    {strength.category.charAt(0).toUpperCase() + strength.category.slice(1)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(strength.score / 6) * 100}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
              </div>

              {strength.isBreached && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                  <h2 className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">⚠️ Password Compromised!</h2>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    This password has appeared in {strength.breachCount?.toLocaleString()} data breaches. 
                    Please choose a different password.
                  </p>
                </div>
              )}

              {strength.feedback.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggestions:</h2>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {strength.feedback.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span>•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;