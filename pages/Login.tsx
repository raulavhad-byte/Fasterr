import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/storageService';
import { User } from '../types';
import { Lock } from 'lucide-react';

interface LoginProps {
  setUser: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const user = loginUser(name);
      setUser(user);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-brand-100 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-brand-600" />
            </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to Fasterr</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or simply enter a name to simulate a login
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Display Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm"
                placeholder="Enter your name (e.g. Alex)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
            >
              Sign In / Register
            </button>
          </div>
        </form>
        <div className="text-center text-xs text-gray-400">
            <p>This is a demo. No password required.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;