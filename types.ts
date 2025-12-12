export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  updated_at: string;
}

export interface GitHubIssue {
  id: number;
  html_url: string;
  title: string;
  number: number;
  state: string;
  created_at: string;
  body: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  repository_url: string; // API URL, need to parse for display usually or fetch separate
  labels: {
    name: string;
    color: string;
  }[];
  comments: number;
  score?: number; // Search score
  // Enriched fields
  repoFullName?: string;
  repoStars?: number;
  repoLanguage?: string;
}

export interface AnalysisResult {
  expertise: string[];
  suggestedQueries: string[];
  summary: string;
}

export interface AppState {
  step: 'idle' | 'analyzing' | 'searching' | 'results' | 'error';
  user: GitHubUser | null;
  issues: GitHubIssue[];
  analysis: AnalysisResult | null;
  error: string | null;
  githubToken: string;
}
