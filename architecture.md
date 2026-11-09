# Architecture Plan - AutoMarketer AI

## Tech Stack
- **Framework**: Next.js 14 App Router
- **Core Library**: React, TypeScript, Cheerio
- **Styling**: Tailwind CSS
- **Design Paradigm**: Neo-Brutalism (chunky borders, flat hard shadows, retro color blocks)

## API Endpoints

### 1. POST `/api/generate-campaign`
- **Request Payload**:
  ```json
  {
    "urlOrHandle": "string",
    "userContext": {
      "bio": "string",
      "products": "string",
      "audience": "string"
    }
  }
  ```
- **Gemini Structured Output JSON**:
  ```typescript
  interface CampaignResponse {
    brandAudit: {
      niche: string;
      targetAudience: string;
      score: number;
      strengths: string[];
      growthHacks: string[];
    };
    contentCalendar: Array<{
      day: string;
      platform: string;
      postTitle: string;
      caption: string;
      visualPrompt: string;
    }>;
    adSlogans: string[];
    imagePrompts: string[];
  }
  ```
