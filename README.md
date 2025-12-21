# HeadlineGraphix V2

<div align="center">

![HeadlineGraphix Logo](https://via.placeholder.com/150x150/A7C4BC/FFFFFF?text=HG)

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
- [AI Flows](#ai-flows)
- [Technologies](#technologies)
- [Contributing](#contributing)
- [License](#license)

## Overview

HeadlineGraphix V2 is a sophisticated AI-powered content generation platform that transforms news headlines into engaging content packs. Built with Next.js 15, TypeScript, and Supabase, it leverages Google's Genkit AI framework to generate blog posts, LinkedIn content, and custom images based on current news trends.

The platform provides a comprehensive suite of tools for content creators, marketers, and social media managers to quickly produce high-quality, brand-aligned content from trending news topics.

## Features

### 🎯 Content Generation
- **AI-Powered Drafts**: Generate blog posts and LinkedIn posts from news headlines
- **Custom Brand Tone**: Apply your brand's voice and style to generated content
- **Reference Images**: Upload and use reference images to guide content generation
- **User Angles**: Add custom perspectives and angles to generated content

### 📰 News Integration
- **Headline Fetching**: Access the latest news headlines from various sources
- **Content Context**: Full article content integration for more accurate generation
- **Trending Topics**: Focus on specific topics relevant to your audience

### 🎨 Visual Content
- **AI Image Generation**: Create custom images and infographics using Google's Imagen
- **Image Archive**: Store and manage reference images for future use
- **Brand Kits**: Create and maintain consistent visual branding

### 📊 Content Management
- **Content Library**: Organize and track all generated content
- **History Tracking**: View and manage previously generated content packs
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
2. **Select Content**: Choose a headline and provide context
3. **Customize**: Add brand tone, reference images, and user angles
4. **Generate**: Create blog posts, LinkedIn content, and images
5. **Review**: Edit and export your generated content

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase project (database + storage)
- Google AI API key (for AI features)

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
```

**Important**: The `GOOGLE_GENAI_API_KEY` is required for AI content generation features to work.

### Environment Variables Reference

The `.env.local.example` file documents every variable the app currently expects. Copy it to `.env.local` and fill in the following values:

| Variable | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL exposed to the browser | `https://your-project-ref.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key used by the client SDK | `your_public_anon_key` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server actions / MCP automations (keep secret) | `your_service_role_key` |
| `SUPABASE_DB_PASSWORD` | Optional password for local `supabase db start` | `super-secret` |
| `GOOGLE_GENAI_API_KEY` | Google AI Studio key required by Genkit flows | `your_google_ai_api_key_here` |

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

### Google AI Setup
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the API key to your `.env.local` file
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

## AI Flows

The application implements several AI flows using Google's Genkit:

### Content Draft Generation
Located in `src/ai/flows/generate-content-drafts.ts`

- **Input**: Headline, article content, brand tone, reference images, user angle
- **Output**: Blog post (markdown), LinkedIn post (markdown), infographic URL
- **Models**: Google AI text generation and Imagen for images

### Image Generation
Located in `src/ai/flows/generate-image.ts`

- **Input**: Text prompt, brand style, reference images
- **Output**: Generated image URL
- **Models**: Google Imagen 4.0 Fast Generate

### Headline Summarization
Located in `src/ai/flows/summarize-headline.ts`

- **Input**: News headline and content
- **Output**: Summarized content for context

## Technologies

### Frontend
- **Next.js 15.3.3**: React framework with App Router
- **TypeScript 5+**: Type-safe JavaScript
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library

### Backend & AI
- **Supabase**: Hosted Postgres, Authentication, and Storage
- **Google Genkit 1.20.0**: AI framework for flows
- **Google AI**: Text and image generation models

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
