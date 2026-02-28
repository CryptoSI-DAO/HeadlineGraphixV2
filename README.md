# HeadlineGraphix V2

<div align="center">

<img src="public/hglogolite.png" alt="HeadlineGraphix Logo" width="180" />

**AI-Powered Content Generation Platform**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Platform-3FCF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [AI Models & Flows](#ai-models--flows)
- [Technologies](#technologies)
- [Contributing](#contributing)
- [License](#license)

## Overview

HeadlineGraphix V2 is an AI-powered content studio that turns current headlines into marketing-ready drafts and visuals. Built with Next.js 15, TypeScript, and Supabase, it combines RSS headline feeds, optional full-article extraction, brand kits, and model selection to deliver blog posts, LinkedIn drafts, and infographic-ready images.

The platform is designed for content creators, marketers, and social media teams who need fast, brand-aligned output with repeatable workflows.

## Features

### 🎯 Content Generation
- **AI-Powered Drafts**: Generate blog posts and LinkedIn posts from headlines or full articles
- **Model Selector**: Switch between OpenRouter MiMo V2 Flash and Z.ai GLM 4.5 Air
- **Brand Kits**: Apply consistent colors, fonts, and tone across drafts
- **Backlink Suggestions**: Inject preferred backlink URLs into generated content
- **User Angles**: Add custom perspectives and notes for the AI to emphasize

### 📰 News Integration
- **Headline Fetching**: Access the latest news headlines from various sources
- **Content Context**: Optional full-article extraction for deeper context
- **Trending Topics**: Focus on specific topics relevant to your audience

### 🎨 Visual Content
- **Prompt Builder**: Generate art-direction prompts with MiMo V2 Flash or GLM-4.6V (with references)
- **Image Generation**: Produce images via OpenAI `gpt-image-1.5`
- **Reference Images**: Upload and reuse image references in the archive
- **Brand Kits**: Apply brand colors, fonts, and styles to visuals

### 📊 Content Management
- **Content Library**: Organize and track generated content packs
- **History Slots**: Save and revisit previous drafts
- **User Preferences**: Save focus topics and backlink URLs for quick access

### 🎨 Design & UX
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Intuitive Navigation**: Sidebar navigation with clear section organization

## Demo

### Dashboard
The main dashboard provides an overview of your content generation activity, credit balance, and quick access to all features.

### Content Generation Workflow
1. **Fetch Headlines**: Browse the latest news headlines
2. **Select Content**: Choose a headline and optionally pull the full article text
3. **Customize**: Pick a model, brand kit, references, and user angle
4. **Generate**: Create blog posts and LinkedIn drafts
5. **Save**: Store drafts in the content library

### Infographic Workflow
1. **Summarize**: Create or auto-generate a short summary
2. **Prompt**: Build a detailed prompt (MiMo V2 Flash or GLM-4.6V with references)
3. **Generate**: Produce the image with OpenAI `gpt-image-1.5`
4. **Archive**: Save the final image to the archive

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase project (database + storage)
- Google AI API key (for Genkit flows)
- OpenRouter API key (MiMo V2 Flash text + prompt generation)
- Z.ai API key (GLM 4.5 Air text + GLM-4.6V prompt generation with references)
- OpenAI API key (image generation)

### Clone the Repository
```bash
git clone https://github.com/yourusername/headline-graphix-v2.git
cd headline-graphix-v2
```

### Install Dependencies
```bash
npm install
```

### Environment Setup
1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` with your actual API keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_PASSWORD=optional_local_db_password

# Google AI Configuration (Required for AI features)
GOOGLE_GENAI_API_KEY=your_google_ai_api_key

# OpenRouter (drafts + prompt/summary)
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=xiaomi/mimo-v2-flash:free

# Z.ai (GLM 4.5 Air drafts + GLM-4.6V prompt generation)
ZAI_API_KEY=your_zai_api_key

# OpenAI (image generation)
OPENAI_API_KEY=your_openai_api_key
```

**Note**: `GOOGLE_GENAI_API_KEY` is only required for Genkit-based flows. The main draft and image workflows use OpenRouter, Z.ai, and OpenAI.

### Environment Variables Reference

The `.env.local.example` file documents every variable the app currently expects. Copy it to `.env.local` and fill in the following values:

| Variable | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL exposed to the browser | `https://your-project-ref.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key used by the client SDK | `your_public_anon_key` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server actions / MCP automations (keep secret) | `your_service_role_key` |
| `SUPABASE_DB_PASSWORD` | Optional password for local `supabase db start` | `super-secret` |
| `GOOGLE_GENAI_API_KEY` | Google AI Studio key required by Genkit flows | `your_google_ai_api_key_here` |
| `OPENROUTER_API_KEY` | OpenRouter key for drafts + prompt/summary | `sk-or-...` |
| `OPENROUTER_MODEL` | OpenRouter model slug used for text drafts, prompt generation, and summaries | `xiaomi/mimo-v2-flash:free` |
| `ZAI_API_KEY` | Z.ai key for GLM 4.5 Air + GLM-4.6V (vision prompt) | `zai-...` |
| `OPENAI_API_KEY` | OpenAI key for image generation (`gpt-image-1.5`) | `sk-...` |

If you only plan to use one content model provider, you can omit the other key; selecting the missing provider will return an error.

### Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration

### Supabase Setup
1. Create a new Supabase project at [Supabase](https://supabase.com/) and note the **Project Reference** plus API keys.
2. In the SQL editor (or via MCP), create the tables described in the implementation plan (`hgprofiles`, `reference_images`, `content_packs`).
3. Create a Storage bucket (e.g., `reference-images`) and configure public/private access per your needs.
4. Enable Row Level Security and add policies that scope data to the authenticated user (or the temporary demo user) before shipping to production.
5. Install the Supabase CLI and configure the Supabase MCP server so automations and the Codex CLI can run migrations/queries with the service role key.

### MCP Setup (Recommended)
1. Install the latest [Supabase CLI](https://supabase.com/docs/reference/cli/installation) and run `supabase login`.
2. Enable the `supabase` MCP server in your IDE/CLI config so Codex can reach the project (see the Supabase MCP docs for the exact config snippet).
3. Store `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your MCP secret manager so the automation layer never reads them from plain `.env` files.

### Google AI Setup (Optional)
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the API key to your `.env.local` file if you plan to use Genkit-based flows
3. Ensure you have the necessary permissions for content generation

### News Feed Setup
The headlines page now lets you toggle between three RSS providers, all of which work without API keys or extra `.env` values:

| Provider | Description |
| --- | --- |
| `Google News` (default) | Aggregated global coverage via the Google News RSS search endpoint |
| `Bing News` | Microsoft Bing News RSS search feed with regional coverage |
| `Reddit` | Topic-matching posts across Reddit communities (Atom feed) |

Your selection is stored locally in the browser so the app remembers your preferred source. If you would like to add or tweak a provider, edit `src/lib/news/providers.ts` (metadata) and `src/lib/news/index.ts` (fetcher + parser) accordingly.

### Genkit Configuration
The application uses Google's Genkit for AI flows. Configuration is handled in `src/ai/genkit.ts`.

## Usage

### Basic Workflow
1. **Login**: Start by logging into the application
2. **Set Preferences**: Configure your focus topics and backlink URLs in the dashboard
3. **Upload Images**: Add reference images to your image archive
4. **Fetch Headlines**: Browse and select news headlines from the headlines page
5. **Generate Content**: Use the content generation tools to create drafts
6. **Customize**: Edit and refine the generated content as needed
7. **Export**: Download or share your final content

### Advanced Features
- **Brand Kits**: Create consistent branding for all generated content
- **Batch Generation**: Process multiple headlines at once
- **Content Templates**: Save and reuse content generation configurations

## Project Structure

```
HeadlineGraphixV2/
├── src/
│   ├── ai/                    # AI flows and configurations
│   │   ├── flows/            # AI flow implementations
│   │   ├── genkit.ts         # Genkit configuration
│   │   └── dev.ts            # Development AI setup
│   ├── app/                   # Next.js app router pages
│   │   ├── (app)/           # Main application pages
│   │   ├── login/           # Authentication pages
│   │   ├── globals.css      # Global styles
│   │   └── layout.tsx       # Root layout
│   ├── components/           # Reusable React components
│   │   ├── ui/              # UI component library
│   │   ├── AppSidebar.tsx   # Main navigation
│   │   └── Header.tsx       # Page headers
│   ├── context/             # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and types
│   └── types.ts             # TypeScript type definitions
├── docs/                    # Documentation
├── public/                  # Static assets
├── apphosting.yaml         # Legacy Firebase Hosting config (optional)
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Data Model

See `docs/data-model.md` for a full breakdown of the Supabase tables and JSON shapes (hgprofiles, reference images, AI preferences, and content packs).

## AI Models & Flows

HeadlineGraphix uses multiple model providers depending on the workflow:

### Content Draft Generation
Located in `src/ai/flows/generate-content-drafts/index.ts`

- **Input**: Headline, article content, brand tone, reference images, user angle
- **Output**: Blog post (markdown), LinkedIn post (markdown), infographic metadata
- **Models**:
  - **OpenRouter**: `xiaomi/mimo-v2-flash:free`
  - **Z.ai**: `glm-4.5-air`

### Image Prompt + Summary
Located in `src/app/api/image-summary/route.ts` and `src/app/api/image-prompt/route.ts`

- **Summary model**: `xiaomi/mimo-v2-flash:free` via OpenRouter
- **Prompt model (no references)**: `xiaomi/mimo-v2-flash:free` via OpenRouter
- **Prompt model (with references)**: `GLM-4.6V` via Z.ai

### Image Generation
Located in `src/app/api/glm-image/route.ts`

- **Model**: OpenAI `gpt-image-1.5`

## AI Utilities

The Genkit configuration defaults to `googleai/gemini-2.5-flash` in `src/ai/genkit.ts` for any Genkit-based flows.

## Technologies

### Frontend
- **Next.js 15.3.3**: React framework with App Router
- **TypeScript 5+**: Type-safe JavaScript
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library

### Backend & AI
- **Supabase**: Hosted Postgres, Authentication, and Storage
- **OpenRouter**: MiMo V2 Flash for drafts and prompt/summary
- **Z.ai**: GLM 4.5 Air + GLM-4.6V for drafts and vision prompts
- **OpenAI**: `gpt-image-1.5` for image generation
- **Google Genkit**: Optional flows and utilities

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Patch Package**: Package patching

## Contributing

We welcome contributions to HeadlineGraphix V2! Please follow these guidelines:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a pull request

### Code Style
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Bug Reports
- Use the issue tracker for bug reports
- Include steps to reproduce
- Provide environment details
- Add screenshots if applicable

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the HeadlineGraphix Team**

[Website](https://headlinegraphix.com) • [Documentation](https://docs.headlinegraphix.com) • [Support](mailto:support@headlinegraphix.com)

</div>
