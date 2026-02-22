
import React, { useState } from 'react';
import { LogoIcon } from '../components/icons';
import { AdminUser } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
  admins: AdminUser[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, admins }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من وجود المستخدم في القائمة
    let validUser = admins.find(admin => admin.username === username && admin.password === password);
    
    // Fallback for first-time setup if database is empty
    if (!validUser && admins.length === 0 && username === 'admin' && password === '123456') {
        validUser = {
            id: 'default-admin',
            username: 'admin',
            password: '123456',
            role: 'superadmin',
            assignedBattalion: 'الكل',
            protectedPages: [],
            createdAt: new Date().toISOString()
        };
    }
    
    if (validUser) {
      setError('');
      onLoginSuccess(validUser);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="flex justify-center">
             <LogoIcon className="w-20 h-20 text-amber-400" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white">
            نظام الخيالة
          </h1>
          <p className="mt-2 text-gray-400">يرجى تسجيل الدخول للمتابعة</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">اسم المستخدم</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                placeholder="اسم المستخدم"
              />
            </div>
            <div>
              <label htmlFor="password-input" className="sr-only">الرقم السري</label>
              <input
                id="password-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                placeholder="الرقم السري"
              />
            </div>
          </div>

          {error && (
            <div className="text-center text-red-400 text-sm pt-2">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-500"
            >
              تسجيل الدخول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
