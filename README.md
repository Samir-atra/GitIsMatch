# GitIsMatch

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=samiratra95@gmail.com&item_name=Code+Broker+Donation&currency_code=USD)
[![License](https://img.shields.io/github/license/Samir-atra/GitIsMatch)](https://github.com/Samir-atra/GitIsMatch/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Samir-atra/GitIsMatch)](https://github.com/Samir-atra/GitIsMatch/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Samir-atra/GitIsMatch)](https://github.com/Samir-atra/GitIsMatch/network)
[![GitHub issues](https://img.shields.io/github/issues/Samir-atra/GitIsMatch)](https://github.com/Samir-atra/GitIsMatch/issues)
[![YouTube](https://img.shields.io/badge/YouTube-Watch_Demo-red?logo=youtube)](https://youtu.be/uuZ0VhK5V0I)

**Match your code with purpose.**

Demo Video: [YouTube](https://youtu.be/uuZ0VhK5V0I)

GitIsMatch is an intelligent web application that bridges the gap between developers and open-source contributions. By analyzing your GitHub profile using Google's Gemini AI, it creates a unique "coding persona" based on your repositories and bio, then actively searches for "help wanted" issues that align with your specific skills and interests.

## 🚀 Features

- **AI-Powered Profile Analysis**: Utilizes **Google Gemini 2.5 Flash** to read your bio, top repositories, languages, and topics to create a comprehensive summary of your expertise.
- **Intelligent Issue Discovery**: Automatically generates complex, optimized GitHub search queries based on your analysis to find relevant issues.
- **Smart Filtering & Refinement**: 
  - Filter results instantly by clicking on AI-identified skill tags.
  - **Add Custom Tags**: Manually add specific technologies you want to work with.
  - **Deep Search**: Select tags and trigger a refined search to query GitHub specifically for those topics.
- **High-Volume Results**: Fetches up to 100 relevant issues per search to ensure you have plenty of options.
- **Privacy Focused**: Runs entirely in the browser. Your API token (if provided) is never stored permanently.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (`@google/genai`)
- **Data**: GitHub REST API
- **Icons**: Lucide React

## 📦 Getting Started

### Prerequisites

- Node.js installed.
- A Google Gemini API Key.
- (Optional) A GitHub Personal Access Token for higher rate limits.

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (Gemini API Key).
4. Start the development server:
   ```bash
   npm run dev
   ```

## 💡 How to Use

1. **Enter a Profile**: Paste a GitHub URL (e.g., `https://github.com/torvalds`) or username.
2. **Analyze**: The app fetches public data and sends it to Gemini for analysis.
3. **Explore**: View your "Match Report" containing a summary of your skills and a list of curated issues.
4. **Refine**: 
   - Click tags to filter the current list.
   - Click "**+ Add**" to input new skills (e.g., "Rust").
   - Select multiple tags and click "**Search GitHub for Selected Tags**" to perform a fresh, targeted search.

## 📄 License

This project is licensed under the MIT License.
