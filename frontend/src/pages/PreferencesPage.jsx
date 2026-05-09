import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Type, Palette } from 'lucide-react';

const NOTE_COLORS = [
  { label: 'White',  value: '#ffffff' },
  { label: 'Yellow', value: '#fef9c3' },
  { label: 'Green',  value: '#dcfce7' },
  { label: 'Blue',   value: '#dbeafe' },
  { label: 'Pink',   value: '#fce7f3' },
  { label: 'Purple', value: '#ede9fe' },
  { label: 'Orange', value: '#ffedd5' },
  { label: 'Gray',   value: '#f3f4f6' },
];

const FONT_SIZES = [
  { label: 'Small',  value: 'small',  size: 'text-xs' },
  { label: 'Medium', value: 'medium', size: 'text-sm' },
  { label: 'Large',  value: 'large',  size: 'text-base' },
];

const PreferencesPage = () => {
  const navigate = useNavigate();

  // Load preferences từ localStorage
  const loadPrefs = () => {
    const saved = localStorage.getItem('preferences');
    return saved ? JSON.parse(saved) : {
      fontSize:  'medium',
      noteColor: '#ffffff',
      theme:     'light',
    };
  };

  const [prefs, setPrefs] = useState(loadPrefs);
  const [saved, setSaved] = useState(false);

  // Áp dụng theme lên <html>
  useEffect(() => {
    if (prefs.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [prefs.theme]);

  const update = (key, value) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    localStorage.setItem('preferences', JSON.stringify(newPrefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      prefs.theme === 'dark' ? 'bg-[#191919] text-white' : 'bg-[#f7f7f5] text-[#37352f]'
    }`}>
      {/* Header */}
      <div className={`border-b px-6 py-4 flex items-center gap-4 ${
        prefs.theme === 'dark' ? 'bg-[#252525] border-[#333]' : 'bg-white border-[#e9e9e8]'
      }`}>
        <button
          onClick={() => navigate('/dashboard')}
          className="p-1.5 hover:opacity-70 rounded-md transition-opacity"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold">Preferences</h1>
        {saved && (
          <span className="ml-auto text-xs text-green-500 font-medium">✓ Saved</span>
        )}
      </div>

      <div className="max-w-lg mx-auto px-6 py-10 space-y-6">

        {/* THEME */}
        <div className={`rounded-xl border p-6 ${
          prefs.theme === 'dark' ? 'bg-[#252525] border-[#333]' : 'bg-white border-[#e9e9e8]'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            {prefs.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            <h2 className="font-semibold text-sm">Theme</h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => update('theme', 'light')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-all ${
                prefs.theme === 'light'
                  ? 'border-[#37352f] bg-[#37352f] text-white'
                  : 'border-[#e9e9e8] hover:bg-[#f7f7f5]'
              }`}
            >
              <Sun size={15} /> Light
            </button>
            <button
              onClick={() => update('theme', 'dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-all ${
                prefs.theme === 'dark'
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-[#e9e9e8] hover:bg-[#f7f7f5]'
              }`}
            >
              <Moon size={15} /> Dark
            </button>
          </div>
        </div>

        {/* FONT SIZE */}
        <div className={`rounded-xl border p-6 ${
          prefs.theme === 'dark' ? 'bg-[#252525] border-[#333]' : 'bg-white border-[#e9e9e8]'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Type size={16} />
            <h2 className="font-semibold text-sm">Font Size</h2>
          </div>
          <div className="flex gap-3">
            {FONT_SIZES.map(f => (
              <button
                key={f.value}
                onClick={() => update('fontSize', f.value)}
                className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${f.size} ${
                  prefs.fontSize === f.value
                    ? 'border-[#37352f] bg-[#37352f] text-white'
                    : prefs.theme === 'dark'
                      ? 'border-[#444] hover:bg-[#333]'
                      : 'border-[#e9e9e8] hover:bg-[#f7f7f5]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {/* Preview */}
          <div className={`mt-4 p-3 rounded-lg ${prefs.theme === 'dark' ? 'bg-[#333]' : 'bg-[#f7f7f5]'}`}>
            <p className={`${
              prefs.fontSize === 'small' ? 'text-xs' :
              prefs.fontSize === 'large' ? 'text-base' : 'text-sm'
            } opacity-70`}>
              Preview: This is how your note text will look.
            </p>
          </div>
        </div>

        {/* NOTE COLOR */}
        <div className={`rounded-xl border p-6 ${
          prefs.theme === 'dark' ? 'bg-[#252525] border-[#333]' : 'bg-white border-[#e9e9e8]'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Palette size={16} />
            <h2 className="font-semibold text-sm">Default Note Color</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {NOTE_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => update('noteColor', c.value)}
                title={c.label}
                className={`h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                  prefs.noteColor === c.value
                    ? 'border-[#37352f] scale-105 shadow-md'
                    : 'border-transparent hover:border-gray-300'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
          {/* Preview note */}
          <div
            className="mt-4 p-4 rounded-lg border border-[#e9e9e8]"
            style={{ backgroundColor: prefs.noteColor }}
          >
            <p className={`font-semibold text-sm text-[#37352f] ${
              prefs.fontSize === 'small' ? 'text-xs' :
              prefs.fontSize === 'large' ? 'text-base' : 'text-sm'
            }`}>Note Preview</p>
            <p className={`text-[#9b9a97] mt-1 ${
              prefs.fontSize === 'small' ? 'text-xs' :
              prefs.fontSize === 'large' ? 'text-sm' : 'text-xs'
            }`}>This is how your notes will appear.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PreferencesPage;