import { GitHubUser, GitHubRepo, GitHubIssue } from '../types';

const BASE_URL = 'https://api.github.com';

const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  return headers;
};

export const fetchUser = async (username: string, token?: string): Promise<GitHubUser> => {
  const response = await fetch(`${BASE_URL}/users/${username}`, {
    headers: getHeaders(token),
  });
  if (!response.ok) {
    if (response.status === 404) throw new Error('User not found');
    if (response.status === 403) throw new Error('GitHub API rate limit exceeded. Please provide a token.');
    throw new Error('Failed to fetch user');
  }
  return response.json();
};

export const fetchUserRepos = async (username: string, token?: string): Promise<GitHubRepo[]> => {
  // Fetch up to 30 most recently updated repos to get a sense of current activity
  const response = await fetch(`${BASE_URL}/users/${username}/repos?sort=updated&per_page=30&direction=desc`, {
    headers: getHeaders(token),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch repositories');
  }
  return response.json();
};

export const searchIssues = async (query: string, token?: string): Promise<GitHubIssue[]> => {
  const response = await fetch(`${BASE_URL}/search/issues?q=${encodeURIComponent(query)}&per_page=100`, {
    headers: getHeaders(token),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Rate limit exceeded during search.');
    throw new Error('Failed to search issues');
  }
  const data = await response.json();
  
  // The search API doesn't return full repo details, but we can extract the repo name from the URL
  // or make secondary requests. For speed, we'll parse the repository_url
  const issues: GitHubIssue[] = data.items.map((item: any) => {
      // repository_url example: "https://api.github.com/repos/owner/repo"
      const repoUrlParts = item.repository_url.split('/');
      const repoFullName = `${repoUrlParts[repoUrlParts.length - 2]}/${repoUrlParts[repoUrlParts.length - 1]}`;
      return {
          ...item,
          repoFullName
      };
  });

  return issues;
};

export const parseUsername = (input: string): string => {
  try {
    const url = new URL(input);
    if (url.hostname === 'github.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[0];
    }
  } catch (e) {
    // Not a URL, assume username
  }
  return input.replace('@', '').trim();
};