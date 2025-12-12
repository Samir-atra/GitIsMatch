import React, { useState } from 'react';
import { Search, Github, Key } from 'lucide-react';

interface GitHubInputProps {
  onSearch: (username: string, token: string) => void;
  isLoading: boolean;
}

export const GitHubInput: React.FC<GitHubInputProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input, token);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Github className="h-6 w-6 text-gray-500 group-focus-within:text-green-500 transition-colors" />
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-32 py-4 bg-[#161b22] border border-[#30363d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-xl transition-all text-lg"
          placeholder="Enter GitHub URL or username..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-2 bottom-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <span>Analyze</span>
              <Search className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="flex flex-col items-center">
        <button 
          type="button"
          onClick={() => setShowToken(!showToken)}
          className="text-xs text-gray-500 hover:text-green-400 flex items-center gap-1 transition-colors"
        >
          <Key className="h-3 w-3" />
          {showToken ? 'Hide API Token' : 'Add GitHub API Token (Optional but Recommended)'}
        </button>
        
        {showToken && (
           <div className="w-full mt-2 animate-fadeIn">
             <input 
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
             />
             <p className="text-[10px] text-gray-600 mt-1 text-center">
               Used only for this session to increase rate limits. Not stored.
             </p>
           </div>
        )}
      </div>
    </div>
  );
};
