import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, GitHubUser } from '../types';
import { Sparkles, Code2, User, Filter, Plus, Search } from 'lucide-react';

interface AnalysisViewProps {
  user: GitHubUser;
  analysis: AnalysisResult;
  selectedTags: string[];
  customTags: string[];
  onToggleTag: (tag: string) => void;
  onAddTag: (tag: string) => void;
  onRefineSearch: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ 
  user, 
  analysis, 
  selectedTags, 
  customTags,
  onToggleTag,
  onAddTag,
  onRefineSearch
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSubmitTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitTag();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTag('');
    }
  };

  // Combine AI tags and custom tags for display
  const allTags = [...analysis.expertise, ...customTags];

  return (
    <div className="w-full max-w-4xl mx-auto mb-12 animate-fadeIn">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* User Profile Summary */}
          <div className="flex-shrink-0 flex flex-col items-center md:items-start space-y-3">
            <img 
              src={user.avatar_url} 
              alt={user.login} 
              className="w-24 h-24 rounded-full border-4 border-[#30363d]"
            />
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-white">{user.name || user.login}</h2>
              <p className="text-gray-400 text-sm">@{user.login}</p>
            </div>
            <a 
              href={user.html_url} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-green-400 hover:underline flex items-center gap-1"
            >
              <User className="h-3 w-3" /> View Profile
            </a>
          </div>

          {/* AI Analysis */}
          <div className="flex-grow space-y-4 w-full">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-semibold uppercase tracking-wider text-sm">AI Profile Analysis</h3>
            </div>
            
            <p className="text-gray-300 leading-relaxed italic border-l-4 border-green-500/30 pl-4 py-1">
              "{analysis.summary}"
            </p>

            <div className="space-y-3 mt-5">
              <div className="flex justify-between items-end flex-wrap gap-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Identified Expertise
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Filter className="h-3 w-3" />
                  <span>Select tags to filter or refine search</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {allTags.map((skill, idx) => {
                  const isSelected = selectedTags.includes(skill);
                  return (
                    <button 
                      key={`${skill}-${idx}`} 
                      onClick={() => onToggleTag(skill)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-900/50 scale-105' 
                          : 'bg-green-900/10 text-green-400 border-green-900/50 hover:bg-green-900/30 hover:border-green-500/50'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}

                {/* Add Tag Button / Input */}
                {isAdding ? (
                  <div className="flex items-center">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onBlur={handleSubmitTag}
                      onKeyDown={handleKeyDown}
                      className="px-3 py-1 w-24 rounded-l-full text-xs font-medium border border-r-0 border-gray-600 bg-[#0d1117] text-white focus:outline-none focus:border-green-500"
                      placeholder="Add tag..."
                    />
                    <button 
                       onMouseDown={(e) => { e.preventDefault(); handleSubmitTag(); }}
                       className="px-2 py-1 rounded-r-full border border-l-0 border-gray-600 bg-[#21262d] hover:bg-green-700 hover:border-green-700 transition-colors"
                    >
                      <Plus className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                )}
              </div>
              
              {selectedTags.length > 0 && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                   <p className="text-[11px] text-gray-400">
                      Filtering results by: <span className="text-white font-medium">{selectedTags.join(', ')}</span>
                   </p>
                   <button 
                      onClick={onRefineSearch}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                   >
                      <Search className="h-3 w-3" />
                      Search GitHub for Selected Tags
                   </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
