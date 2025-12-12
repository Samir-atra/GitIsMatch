import React from 'react';
import { GitHubIssue } from '../types';
import { GitPullRequest, MessageCircle, Star, ExternalLink, Calendar } from 'lucide-react';

interface IssueListProps {
  issues: GitHubIssue[];
}

export const IssueList: React.FC<IssueListProps> = ({ issues }) => {
  if (issues.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p>No issues found matching your profile. Try adjusting your GitHub activity!</p>
      </div>
    );
  }

  // Remove duplicate issues (sometimes different queries find same issue)
  const uniqueIssuesMap = new Map<number, GitHubIssue>();
  for (const issue of issues) {
    uniqueIssuesMap.set(issue.id, issue);
  }
  const uniqueIssues = Array.from(uniqueIssuesMap.values());

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-slideUp">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <GitPullRequest className="h-6 w-6 text-green-500" />
        Curated Opportunities ({uniqueIssues.length})
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        {uniqueIssues.map((issue) => (
          <div 
            key={issue.id}
            className="group bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-gray-500 rounded-lg p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col gap-3"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                   <span className="font-semibold text-green-400 hover:underline cursor-pointer">
                     {issue.repoFullName}
                   </span>
                   <span>•</span>
                   <span className="flex items-center gap-1">
                     <Calendar className="h-3 w-3" />
                     {new Date(issue.created_at).toLocaleDateString()}
                   </span>
                </div>
                <a 
                  href={issue.html_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors block"
                >
                  {issue.title} <span className="text-gray-500 font-normal">#{issue.number}</span>
                </a>
              </div>
              <a 
                 href={issue.html_url}
                 target="_blank"
                 rel="noreferrer"
                 className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
              >
                 <ExternalLink className="h-5 w-5" />
              </a>
            </div>

            {/* Labels */}
            <div className="flex flex-wrap gap-2">
              {issue.labels.map(label => {
                  // Determine text color based on background luminance roughly
                  // Simple heuristic: default to black text on hex colors, unless specific dark ones
                  return (
                    <span 
                      key={label.name}
                      style={{ 
                          backgroundColor: `#${label.color}`,
                          color: isLightColor(label.color) ? '#000' : '#fff'
                      }}
                      className="px-2 py-0.5 rounded-full text-xs font-medium border border-white/10"
                    >
                      {label.name}
                    </span>
                  );
              })}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400 mt-2 border-t border-[#30363d] pt-3">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                <span>{issue.comments} comments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>{issue.state}</span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

// Helper to determine text contrast
function isLightColor(hex: string) {
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128;
}