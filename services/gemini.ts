import { GoogleGenAI, Type } from "@google/genai";
import { GitHubRepo, GitHubUser, AnalysisResult } from '../types';

export const analyzeProfileAndGenerateQueries = async (
  user: GitHubUser,
  repos: GitHubRepo[]
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Gemini API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  // Prepare data for the model
  const repoSummary = repos.map(r => ({
    name: r.name,
    description: r.description,
    language: r.language,
    topics: r.topics,
    stars: r.stargazers_count
  })).slice(0, 15); // Send top 15 updated repos to save tokens but give good context

  const prompt = `
    Analyze this GitHub user profile and their recent repositories.
    
    User Bio: ${user.bio || "No bio"}
    User Name: ${user.name}
    
    Repositories (Top 15 recently active):
    ${JSON.stringify(repoSummary, null, 2)}
    
    GOAL: Identify the user's core technical skills, interests (e.g., "frontend", "compilers", "machine learning"), and preferred languages.
    Then, generate 3 distinct, high-quality GitHub Search API queries to find "help wanted" or "good first issue" issues in OTHER repositories that match their skills.
    
    The search queries must be valid for the GitHub Issue Search API.
    Examples of good query parts: 'language:typescript', 'label:"good first issue"', 'is:open', 'is:issue', 'no:assignee'.
    Combine them intelligently. Exclude their own repos if possible (using '-user:${user.login}').
    
    Return a JSON object with:
    1. 'expertise': Array of strings describing their skills.
    2. 'summary': A short paragraph (2 sentences) describing their coding persona.
    3. 'suggestedQueries': Array of 3 valid GitHub search query strings.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          expertise: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          summary: { type: Type.STRING },
          suggestedQueries: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["expertise", "summary", "suggestedQueries"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  return JSON.parse(text) as AnalysisResult;
};
