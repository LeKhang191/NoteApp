import React, { useState } from 'react';
import { Box, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if(isLogin) {
      navigate('/dashboard');
    } else {
      alert("Sign up Successfully. Pls Log in.");
      setIsLogin(true);
    }
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col justify-center items-center px-4 font-sans text-[#37352f]">
      <div className="mb-10 flex flex-col items-center">
        <div className="w-12 h-12 border-2 border-[#37352f] rounded-xl flex items-center justify-center mb-3 shadow-[4px_4px_0px_0px_rgba(55,53,47,1)]">
          <span className="text-2xl font-black">N</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Noteapp</h1>
      </div>

      <div className="w-full max-w-[400px] space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            {isLogin ? "Welcomeback" : "Create new Account"}
          </h2>
          <p className="text-[#9b9a97] text-sm">
            {isLogin ? "Log in to organize notes." : "Sign up for organize your work."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97] ml-1">Display name</label>
              <input 
                type="text" 
                placeholder="Name.."
                className="w-full px-4 py-2 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] transition-all placeholder:text-gray-300"
              />
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97] ml-1">Email</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              className="w-full px-4 py-2 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] transition-all placeholder:text-gray-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97] ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] transition-all placeholder:text-gray-300"
            />
          </div>

          <button className="w-full bg-[#37352f] text-white py-2.5 rounded-md font-semibold hover:bg-black transition-all flex items-center justify-center gap-2 group mt-2">
            {isLogin ? "Log in" : "Continue"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#e9e9e8] text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-[#37352f] opacity-60 hover:opacity-100 hover:underline underline-offset-4 transition-all"
          >
            {isLogin ? "Sign up" : "Bacl to Log in"}
          </button>
        </div>
      </div>

      <footer className="mt-20 text-[12px] text-[#9b9a97]">
        <p>© 2026 NoteApp</p>
      </footer>
    </div>
  );
};

export default AuthPage;