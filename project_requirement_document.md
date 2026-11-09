# Project Requirement Document (PRD) - AutoMarketer AI

## Executive Summary
AutoMarketer AI is an autonomous, end-to-end campaign setup engine built in a high-contrast Neo-Brutalist design. The application ingests a website URL, fetches metadata and main text copy in real time, generates brand metrics, builds content calendars, renders graphical banners via Pollinations, and schedules mock social media dispatch runs.

## Core Features
1. **Real-time Live Fetching & Scraper Pipeline**:
   - Ingests user URLs and extracts metadata tags (`og:title`, meta description, h1/h2 headings, and body copy) in real time using Cheerio.
2. **Neo-Brutalist Dashboard UX**:
   - Electric Yellow, Mint Green, Hot Orange, Retro Lavender, and Retro Blue styling.
   - High-contrast 4px black borders and solid black drop shadows with zero blur.
   - Micro-interactions where elements shift +4px or +6px X and Y on click.
3. **Structured Gemini Strategy Output**:
   - Returns niche, target demographic, 2-column SWOT (strengths/weaknesses), content calendars, slogans, and image prompts.
4. **Autonomous Webhook Queue**:
   - Simulates live webhook dispatching.
