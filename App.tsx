import React, { useState, useCallback, useMemo } from 'react';
import { GitHubInput } from './components/GitHubInput';
import { AnalysisView } from './components/AnalysisView';
import { IssueList } from './components/IssueList';
import { AppState, GitHubUser, GitHubRepo, GitHubIssue, AnalysisResult } from './types';
import { fetchUser, fetchUserRepos, searchIssues, parseUsername } from './services/github';
import { analyzeProfileAndGenerateQueries } from './services/gemini';
import { Github, Loader2 } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>({
    step: 'idle',
    user: null,
    issues: [],
    analysis: null,
    error: null,
    githubToken: ''
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);

  const handleSearch = useCallback(async (input: string, token: string) => {
    setState(prev => ({ ...prev, step: 'analyzing', error: null, githubToken: token }));
    setSelectedTags([]); // Reset filters on new search
    setCustomTags([]); // Reset custom tags
    
    try {
      const username = parseUsername(input);
      if (!username) throw new Error("Invalid GitHub URL or username");

      // 1. Fetch User Data
      const user = await fetchUser(username, token);
      
      // 2. Fetch Repos
      const repos = await fetchUserRepos(username, token);
      if (repos.length === 0) {
        throw new Error("No public repositories found. Cannot analyze profile.");
      }

      setState(prev => ({ ...prev, user }));

      // 3. Analyze with Gemini
      const analysis = await analyzeProfileAndGenerateQueries(user, repos);
      setState(prev => ({ ...prev, analysis, step: 'searching' }));

      // 4. Search Issues based on queries
      let allIssues: GitHubIssue[] = [];
      const queryPromises = analysis.suggestedQueries.map(q => searchIssues(q, token));
      
      // Execute searches in parallel
      const results = await Promise.allSettled(queryPromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allIssues = [...allIssues, ...result.value];
        }
      });

      setState(prev => ({ 
        ...prev, 
        issues: allIssues, 
        step: 'results' 
      }));

    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: err.message || "An unexpected error occurred." 
      }));
    }
  }, []);

  const reset = () => {
    setState({
      step: 'idle',
      user: null,
      issues: [],
      analysis: null,
      error: null,
      githubToken: ''
    });
    setSelectedTags([]);
    setCustomTags([]);
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleAddTag = (tag: string) => {
    // Avoid duplicates in customTags
    if (!customTags.includes(tag) && !state.analysis?.expertise.includes(tag)) {
      setCustomTags(prev => [...prev, tag]);
    }
    // Automatically select the new tag if it's not already selected
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleRefineSearch = async () => {
    if (selectedTags.length === 0) return;

    setState(prev => ({ ...prev, step: 'searching' }));
    
    try {
      // Construct a broad OR query for the selected tags
      // We use parens for OR logic: (tag1 OR tag2)
      // And standard quality filters
      const tagsQuery = selectedTags.map(t => `"${t}"`).join(' OR ');
      const fullQuery = `${tagsQuery} is:open is:issue no:assignee label:"help wanted" sort:updated-desc`;
      
      console.log("Refining search with:", fullQuery);

      const newIssues = await searchIssues(fullQuery, state.githubToken);
      
      setState(prev => ({
        ...prev,
        issues: newIssues,
        step: 'results'
      }));

    } catch (err: any) {
       console.error(err);
       setState(prev => ({ 
         ...prev, 
         step: 'error', 
         error: err.message || "Failed to refine search." 
       }));
    }
  };

  // Filter issues based on selected tags
  const filteredIssues = useMemo(() => {
    if (selectedTags.length === 0) return state.issues;

    return state.issues.filter(issue => {
      // Create a search corpus from the issue details
      const corpus = `
        ${issue.title} 
        ${issue.body || ''} 
        ${issue.repoFullName || ''} 
        ${issue.labels.map(l => l.name).join(' ')}
      `.toLowerCase();

      // Check if ANY selected tag is present in the corpus
      return selectedTags.some(tag => corpus.includes(tag.toLowerCase()));
    });
  }, [state.issues, selectedTags]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#30363d] bg-[#161b22] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={reset}
          >
            <div className="bg-white p-1 rounded-full">
              <Github className="h-6 w-6 text-[#161b22]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">GitIsMatch</h1>
          </div>
          <div className="text-sm text-gray-400 hidden sm:block">
            Find your next open source contribution
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start pt-12 px-4 pb-20">
        
        {state.step === 'idle' && (
          <div className="text-center space-y-8 max-w-2xl animate-fadeIn">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                Match your code <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                  with purpose.
                </span>
              </h2>
              <p className="text-lg text-gray-400">
                We analyze your GitHub profile to understand your expertise, 
                then find open issues in other projects that need exactly your skills.
              </p>
            </div>
            <GitHubInput onSearch={handleSearch} isLoading={false} />
          </div>
        )}

        {state.step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-fadeIn py-20">
             <div className="relative">
               <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
               <Loader2 className="h-16 w-16 text-green-500 animate-spin relative z-10" />
             </div>
             <p className="text-xl font-medium text-white">Analyzing your coding DNA...</p>
             <p className="text-sm text-gray-500">Reading repositories, languages, and stars</p>
          </div>
        )}

        {state.step === 'searching' && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-fadeIn py-20">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin relative z-10" />
             </div>
             <div className="text-center space-y-2">
                <p className="text-xl font-medium text-white">Scouring GitHub for matches...</p>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                   Searching for: <span className="text-blue-400 italic">
                      {selectedTags.length > 0 
                        ? `"${selectedTags.join('", "')}"`
                        : state.analysis?.suggestedQueries[0] || "issues"}
                   </span>...
                </p>
             </div>
          </div>
        )}

        {state.step === 'error' && (
           <div className="text-center space-y-6 max-w-xl animate-fadeIn">
             <div className="p-6 bg-red-900/20 border border-red-900/50 rounded-xl text-red-200">
               <h3 className="text-lg font-bold mb-2">Something went wrong</h3>
               <p>{state.error}</p>
             </div>
             <button 
               onClick={reset}
               className="bg-[#21262d] hover:bg-[#30363d] text-white px-6 py-2 rounded-lg font-medium transition-colors border border-[#30363d]"
             >
               Try Again
             </button>
           </div>
        )}

        {state.step === 'results' && state.user && state.analysis && (
          <div className="w-full max-w-5xl space-y-8">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-2xl font-bold text-white">Your Match Report</h2>
                <button 
                    onClick={reset}
                    className="text-sm text-gray-400 hover:text-white underline decoration-gray-600 hover:decoration-white underline-offset-4"
                >
                    Start Over
                </button>
            </div>
            
            <AnalysisView 
              user={state.user} 
              analysis={state.analysis} 
              selectedTags={selectedTags}
              customTags={customTags}
              onToggleTag={handleToggleTag}
              onAddTag={handleAddTag}
              onRefineSearch={handleRefineSearch}
            />
            
            <IssueList issues={filteredIssues} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-8 text-center text-sm text-gray-600">
        <p>Powered by Google Gemini & GitHub API</p>
      </footer>
    </div>
  );
}