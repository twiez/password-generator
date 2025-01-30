import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, ShieldCheck, Lock, AlertTriangle, XCircle, KeyRound, Github } from 'lucide-react';

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  special: boolean;
}

function App() {
  const [password, setPassword] = useState('');
  const [displayPassword, setDisplayPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [customPassword, setCustomPassword] = useState('');
  const [options, setOptions] = useState<PasswordOptions>({
    length: 12,
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true,
  });

  const generatePassword = useCallback(() => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let chars = '';
    if (options.uppercase) chars += upper;
    if (options.lowercase) chars += lower;
    if (options.numbers) chars += nums;
    if (options.special) chars += special;

    if (!chars) return '';

    let result = '';
    for (let i = 0; i < options.length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }, [options]);

  useEffect(() => {
    if (password) {
      let isMounted = true;
      setDisplayPassword('');
      let index = 0;
      
      const interval = setInterval(() => {
        if (index < password.length && isMounted) {
          setDisplayPassword(password.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 50);

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [password]);

  const analyzePassword = (pwd: string) => {
    if (!pwd) return { strength: 'none', color: 'gray', icon: Lock, message: '' };
    
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};:,.<>?]/.test(pwd);
    const length = pwd.length;
    const hasCommonPattern = /(123|abc|password|qwerty|admin)/i.test(pwd);
    const hasRepeatingChars = /(.)\1{2,}/.test(pwd);
    const hasSequential = /(012|123|234|345|456|567|678|789)/.test(pwd);

    let score = 0;
    let message = '';

    if (hasUpper) score += 1;
    if (hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;

    if (hasCommonPattern) {
      score = Math.max(0, score - 2);
      message = 'Ah yes, "password123". Pure genius. Try harder.';
    } else if (hasSequential) {
      score = Math.max(0, score - 1);
      message = '123? What\'s next, "abc"? Get creative!';
    } else if (hasRepeatingChars) {
      score = Math.max(0, score - 1);
      message = 'Repeating chars? Your keyboard has other keys, you know.';
    } else if (length < 8) {
      message = 'A password shorter than a tweet? Seriously?';
    } else if (!hasSpecial && !hasNumber) {
      message = 'Spice it up! This isn\'t your grandma\'s cookbook password.';
    } else if (score >= 5) {
      message = 'Look who finally learned how to make a proper password!';
    }

    switch (score) {
      case 0:
      case 1:
        return { strength: 'Very Weak', color: 'red', icon: XCircle, message };
      case 2:
        return { strength: 'Weak', color: 'orange', icon: AlertTriangle, message };
      case 3:
      case 4:
        return { strength: 'Good', color: 'yellow', icon: Lock, message };
      default:
        return { strength: 'Strong', color: 'green', icon: ShieldCheck, message };
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
    setDisplayPassword(newPassword);
  };

  const generatedPasswordAnalysis = analyzePassword(password);
  const customPasswordAnalysis = analyzePassword(customPassword);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="w-full max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-3">
            <KeyRound className="w-12 h-12 text-gray-300" />
            <h1 className="text-6xl font-bold text-white">
              Password Gen
            </h1>
          </div>
          <p className="text-gray-400">Secure Password Generation Tool</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Length: {options.length}</label>
              <span className="text-gray-400 text-sm">{options.length} characters</span>
            </div>
            <input
              type="range"
              min="8"
              max="32"
              value={options.length}
              onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { key: 'uppercase', label: 'Uppercase (ABC)' },
              { key: 'lowercase', label: 'Lowercase (abc)' },
              { key: 'numbers', label: 'Numbers (123)' },
              { key: 'special', label: 'Special (#$&)' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={options[key as keyof Omit<PasswordOptions, 'length'>]}
                  onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                  className="w-5 h-5 bg-gray-800 border-2 border-gray-600 rounded"
                />
                <span className="text-gray-300 group-hover:text-white transition-colors">{label}</span>
              </label>
            ))}
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <div className="w-full p-4 pr-24 text-white bg-gray-900 rounded-lg min-h-[60px] flex items-center border border-gray-800">
                <span className="animate-typing">{displayPassword}</span>
              </div>
              <button
                onClick={() => handleCopy(password)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!password}
              >
                {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
              </button>
            </div>

            {password && (
              <div className="flex items-center space-x-2 text-gray-300 animate-fade-in">
                {React.createElement(generatedPasswordAnalysis.icon, { className: "w-5 h-5" })}
                <span>{generatedPasswordAnalysis.strength} Password</span>
                {generatedPasswordAnalysis.message && (
                  <span className="text-gray-400 ml-2">{generatedPasswordAnalysis.message}</span>
                )}
              </div>
            )}

            <button
              onClick={handleGenerate}
              className="w-full py-4 px-6 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-medium border border-gray-700"
            >
              Generate Password
            </button>
          </div>

          <div className="pt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Password Checker
            </h2>
            <div className="relative">
              <input
                type="text"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                className="w-full p-4 text-white bg-gray-900 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all border border-gray-800"
                placeholder="Enter a password to check its strength"
              />
            </div>
            
            {customPassword && (
              <div className="flex items-center space-x-2 text-gray-300 animate-fade-in">
                {React.createElement(customPasswordAnalysis.icon, { className: "w-5 h-5" })}
                <span>{customPasswordAnalysis.strength} Password</span>
                {customPasswordAnalysis.message && (
                  <span className="text-gray-400 ml-2">{customPasswordAnalysis.message}</span>
                )}
              </div>
            )}
          </div>

          <div className="pt-8 border-t border-gray-800">
            <div className="text-gray-400 text-sm space-y-4">
              <p className="font-bold text-red-500">
                Make your damn passwords strong! Don't jump on every link, crack file, etc. you see. Doing so inadvertently puts your system and personal data at risk. Take your security seriously!
              </p>
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <span>Code by</span>
                <a
                  href="https://github.com/twiez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>twiez</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;