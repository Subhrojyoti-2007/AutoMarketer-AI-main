import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Schema for Gemini Structured Output matching User's exact requested structure
const campaignSchema: any = {
  type: "object",
  properties: {
    brandAudit: {
      type: "object",
      properties: {
        niche: { type: "string" },
        targetAudience: { type: "string" },
        swot: {
          type: "object",
          properties: {
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
          },
          required: ["strengths", "weaknesses"],
        },
        score: { type: "number" },
        growthHacks: { type: "array", items: { type: "string" } },
      },
      required: ["niche", "targetAudience", "swot", "score", "growthHacks"],
    },
    contentCalendar: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        properties: {
          day: { type: "string" }, // "Day 1", "Day 2", etc.
          platform: { type: "string" },
          postTitle: { type: "string" },
          caption: { type: "string" },
          visualPrompt: { type: "string" },
        },
        required: ["day", "platform", "postTitle", "caption", "visualPrompt"],
      },
    },
    adSlogans: {
      type: "array",
      items: { type: "string" },
    },
    imagePrompts: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["brandAudit", "contentCalendar", "adSlogans", "imagePrompts"],
};

// Real-time live website scraper
async function scrapeLiveWebsite(targetUrl: string) {
  const formattedUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;

  try {
    const response = await fetch(formattedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      next: { revalidate: 0 } // Disable caching for real-time fetch
    });

    if (!response.ok) throw new Error(`HTTP status ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove non-content tags
    $('script, style, nav, footer, iframe, noscript').remove();

    // Extract core context signals
    const pageTitle = $('title').text().trim() || $('meta[property="og:title"]').attr('content') || '';
    const metaDescription = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    const headings = $('h1, h2, h3').map((_, el) => $(el).text().trim()).get().slice(0, 10).join(' | ');
    const bodyText = $('p').map((_, el) => $(el).text().trim()).get().slice(0, 15).join(' ');

    return {
      success: true,
      data: {
        url: formattedUrl,
        pageTitle,
        metaDescription,
        headings,
        sampleContent: bodyText.substring(0, 1500) // First 1500 chars of main body text
      }
    };
  } catch (error) {
    console.warn("Real-time scraping failed/blocked, falling back to URL inference:", error);
    return { success: false, data: null };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { urlOrHandle, userContext } = body;

    if (!urlOrHandle) {
      return NextResponse.json(
        { error: "urlOrHandle is required" },
        { status: 400 }
      );
    }

    let brandName = urlOrHandle
      .replace(/https?:\/\/(www\.)?/, "")
      .replace(/^@/, "")
      .split(/[./]/)[0];
    brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);

    // Layer 1: Run scraper if it's a URL and not a handle
    const isInstagramHandle = urlOrHandle.startsWith("@");
    let extractedMeta = "";
    
    if (!isInstagramHandle) {
      const scrapeResult = await scrapeLiveWebsite(urlOrHandle);
      if (scrapeResult.success && scrapeResult.data) {
        extractedMeta = `
          URL: ${scrapeResult.data.url}
          Title: ${scrapeResult.data.pageTitle}
          Meta Description: ${scrapeResult.data.metaDescription}
          Headings (H1/H2/H3): ${scrapeResult.data.headings}
          Sample Content: ${scrapeResult.data.sampleContent}
        `.trim();
      } else {
        extractedMeta = "Scraping failed or blocked. Analyzing domain name context instead.";
      }
    } else {
      extractedMeta = `Instagram Profile Handle: ${urlOrHandle}. System will analyze profile name context.`;
    }

    const userContextStr = userContext
      ? `Bio: ${userContext.bio || "N/A"}. Products: ${userContext.products || "N/A"}. Target: ${userContext.audience || "N/A"}.`
      : "No direct user context form provided.";

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found. Using high-fidelity mock fallback generator.");
      const fallbackData = generateMockCampaign(brandName, urlOrHandle, extractedMeta, userContextStr);
      return NextResponse.json(fallbackData);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: campaignSchema,
      },
    });

    const prompt = `
      You are an elite Chief Marketing Officer and Creative Director.
      Analyze the following LIVE SCRAPED WEBSITE DATA for the brand ${brandName}:

      TARGET URL: ${urlOrHandle}
      EXTRACTED BRAND CONTEXT: ${extractedMeta}
      USER-PROVIDED BRAND CONTEXT: ${userContextStr}

      For the "imagePrompts" array in your JSON output:
      Generate 3 structured, commercial ad poster prompts matching the aesthetic of modern marketing campaigns (dynamic angles, floating branding elements, bold typographic integration, vibrant backdrop paths).

      PROMPT COMPOSITION FORMULA FOR EACH AD POSTER:
      1. Subject & Pose: A confident human model or hero product centered, shot from a dynamic angle (e.g. slight low-angle or high-angle overhead look-down).
      2. Graphic Overlay Elements: "floating 3D badges, glowing curved graphic ribbons weaving through the scene, sticker-style typography overlays, and sleek callout badges".
      3. Background & Color Palette: A textured studio backdrop featuring warm earth tones, energetic orange gradients, or sleek tech hues matching the brand niche.
      4. Lighting: "volumetric studio rim lighting, strong highlights, soft drop shadows on floating elements".
      5. Style Tag: End each prompt with: ", high-fashion advertising poster design, visual marketing graphic, 8k resolution, photorealistic, trending on Behance".

      - CONTENT CALENDAR REQUIREMENT: Generate exactly 7 content calendar posts, one for each day from Day 1 to Day 7. Do not truncate, return fewer days, or omit any fields.

      DO NOT return generic placeholders. Your campaign must be tailored to this exact business niche, its aesthetic, and its target demographic.

      Return JSON matching this EXACT structure:
      {
        "brandAudit": {
          "niche": "Exact identified industry",
          "targetAudience": "Specific demographic details",
          "swot": {
            "strengths": ["3 specific strengths based on this niche"],
            "weaknesses": ["3 specific missing content opportunities"]
          },
          "score": 85,
          "growthHacks": ["3 actionable social media growth opportunities"]
        },
        "contentCalendar": [
          {
            "day": "Day 1",
            "platform": "Instagram Reel / Post",
            "postTitle": "Hyper-specific post title matching the niche",
            "caption": "Full written caption with emojis and relevant niche hashtags",
            "visualPrompt": "Detailed visual description for ad generation"
          }
        ],
        "adSlogans": ["5 unique, catchy slogans strictly relevant to " + brandName],
        "imagePrompts": ["3 image generation prompts describing ad visuals for " + brandName]
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsedData = JSON.parse(responseText);
      return NextResponse.json(parsedData);
    } catch (apiError: any) {
      console.warn("Gemini API call failed or key is invalid. Falling back to high-fidelity mock generator:", apiError.message || apiError);
      const fallbackData = generateMockCampaign(brandName, urlOrHandle, extractedMeta, userContextStr);
      return NextResponse.json(fallbackData);
    }
  } catch (error: any) {
    console.error("General API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate campaign" },
      { status: 550 }
    );
  }
}

// Fallback high-fidelity mockup generator updated to match the new schema structure
function generateMockCampaign(brandName: string, url: string, extractedMeta: string, userContext: string) {
  const combinedContext = (url + " " + extractedMeta + " " + userContext).toLowerCase();
  
  let niche = "Software & Tech Productivity";
  let targetAudience = "Builders, creators, and SaaS founders looking to automate operations.";
  let strengths = [
    "High-speed operations framework with low friction setup",
    "Modern neo-brutalist visual style and brand identity",
    "Highly optimized autonomous execution workflows",
  ];
  let weaknesses = [
    "Underutilized video-first social channels (TikTok/Reels)",
    "Limited long-form case studies proving production efficacy",
    "High reliance on direct outreach rather than organic content",
  ];
  let score = 88;

  const isCafe = combinedContext.includes("coffee") || combinedContext.includes("cafe") || combinedContext.includes("food") || combinedContext.includes("delight");
  const isFashion = combinedContext.includes("fashion") || combinedContext.includes("clothing") || combinedContext.includes("apparel") || combinedContext.includes("wear") || combinedContext.includes("style") || combinedContext.includes("savana") || combinedContext.includes("boutique") || combinedContext.includes("dress") || combinedContext.includes("fit") || combinedContext.includes("shop") || combinedContext.includes("store") || combinedContext.includes("cloth");

  if (isCafe) {
    niche = "Boutique Food & Beverage / Specialty Cafe";
    targetAudience = "Local coffee enthusiasts, remote workers, and specialty breakfast seekers.";
    strengths = [
      "Aesthetically pleasing cozy environment and local community backing",
      "Vibrant organic social engagement and Instagram story sharing",
      "High-grade specialty beans sourced directly from independent farmers",
    ];
    weaknesses = [
      "Inconsistent posting schedules on main grid channels",
      "Lack of structured local SEO search term optimization",
      "No automated reservation or remote pre-order setup active",
    ];
    score = 82;
  } else if (isFashion) {
    niche = "Retail & E-commerce Fashion Brand";
    targetAudience = "Trend-conscious shoppers, fashion creators, and premium apparel buyers.";
    strengths = [
      "High visual aesthetic and curated product catalog representation",
      "Highly engaging community-driven customer reviews and influencer styling reels",
      "Streamlined checkout experience with multiple sizing guides and fast shipping",
    ];
    weaknesses = [
      "Inconsistent video storytelling showcasing apparel fits and materials",
      "Under-optimized email marketing flows for cart abandonment recovery",
      "Low organic visibility for sustainability-related apparel searches",
    ];
    score = 85;
  } else if (combinedContext.includes("design") || combinedContext.includes("creative") || combinedContext.includes("agency")) {
    niche = "Creative Design & Branding Agency";
    targetAudience = "SaaS startups, high-growth scaleups, and brands looking for premium identity redesigns.";
    strengths = [
      "Extremely strong portfolio and design execution standard",
      "Deep understanding of modern UX paradigms and design systems",
      "Fast iteration sprints utilizing collaborative Figma structures",
    ];
    weaknesses = [
      "Lack of active build-in-public thought leadership content",
      "Irregular email marketing newsletter distribution",
      "Low visibility for the agency founders' personal branding profiles",
    ];
    score = 91;
  }

  const contentCalendar = Array.from({ length: 7 }, (_, i) => {
    const dayNum = i + 1;
    const day = `Day ${dayNum}`;
    let platform = "Instagram Reel";
    let postTitle = "";
    let caption = "";
    let visualPrompt = "";

    if (isCafe) {
      switch (dayNum) {
        case 1:
          platform = "Instagram Post";
          postTitle = "The Morning Ritual";
          caption = `Step inside your second home. ☕ From the first espresso grind to the afternoon latte art, we pour craftsmanship into every cup. Stop by and find your workspace at ${brandName} today. #LocalCafe #EspressoRitual #SpecialtyCoffee #CafeVibes`;
          visualPrompt = "A macro slow motion shot of warm espresso dripping into a ceramic cup, soft steam rising, warm morning light pouring through a window";
          break;
        case 2:
          platform = "TikTok Video";
          postTitle = "Behind the Grind";
          caption = "Ever wondered what goes into sourcing direct-trade beans? Today we are breaking down our farmer-to-cup journey. Transparency tastes better. 🌿 #DirectTrade #CoffeeRoasting #BaristaLife #SourcingRight";
          visualPrompt = "Barista with leather apron pouring fresh roasted coffee beans into a stainless steel grinder, rustic woody textures";
          break;
        case 3:
          platform = "LinkedIn Post";
          postTitle = "Building Local Community Hubs";
          caption = "Why did we design our cafe tables with charging ports and wide spaces? Because we believe coffee shops are the startup incubators of the modern era. Here is how we fostered a local builder community. #CommunityBuilding #CoworkingSpaces #StartupCulture #LocalBusiness";
          visualPrompt = "Wide perspective shot of a bustling cafe interior, patrons working on laptops, warm wood panels and green plants hanging from the ceiling";
          break;
        default:
          platform = "Instagram Reel";
          postTitle = "Brewing Perfect V60 Pour Over";
          caption = "The perfect ratio: 15g coffee to 250g water. Watch the bloom. 🌸 Slow down and master your mornings with our simple brew-at-home recipe. #PourOverCoffee #V60Brewing #SlowCoffee #HomeBarista";
          visualPrompt = "A detailed top-down view of hot water pouring from a copper kettle into a paper cone filter, blooming coffee bubbling gently";
          break;
      }
    } else if (isFashion) {
      switch (dayNum) {
        case 1:
          platform = "Instagram Reel";
          postTitle = "Minimalist Wardrobe Essentials";
          caption = `Upgrade your daily fits with our top essentials. Effortless transitions from day to night. 🧥 Discover the new collection at ${brandName}. #MinimalistFashion #WardrobeEssentials #StyleInspo #EverydayStyle`;
          visualPrompt = "A professional model walking down a clean aesthetic city sidewalk wearing a minimalist beige trench coat and white linen pants, cinematic morning lighting";
          break;
        case 2:
          platform = "Instagram Post";
          postTitle = "Quality in Every Stitch";
          caption = "We believe in apparel that doesn't just look good, but feels exceptional. Handcrafted materials, custom stitching, premium organic cotton. #SlowFashion #PremiumCotton #ApparelDesign #Details";
          visualPrompt = "Close-up macro shot of white organic cotton fabric texture and clean sewing patterns, soft warm ambient lighting";
          break;
        case 3:
          platform = "TikTok Video";
          postTitle = "Styling Ideas for Fall";
          caption = "3 ways to layer your favorite outfit this season. Which styling layout is your favorite? Let us know below! 👇 #FallFits #StylingTips #LayeringApparel #FashionTikTok";
          visualPrompt = "Splitscreen video of model showing styling ideas for fall coat layering, vibrant retro lavender background";
          break;
        default:
          platform = "Instagram Post";
          postTitle = "Effortless Outfits";
          caption = "From weekend loungewear to mid-week meetings, style should be effortless. Find your perfect fit on our site today. #Loungewear #PremiumStyle #EffortlessFits #DailyOutfit";
          visualPrompt = "Flatlay styling of a curated fashion set on a warm off-white linen background, neat lines and retro branding tag";
          break;
      }
    } else {
      switch (dayNum) {
        case 1:
          platform = "LinkedIn Article";
          postTitle = "Scale with Systemic Automation";
          caption = `If you are still executing your marketing tasks manually, you are wasting 15 hours a week. Here is the exact autonomous builder blueprint we used to scale ${brandName}. #Automation #GrowthHacks #FutureOfWork #SaaSScaling`;
          visualPrompt = "A futuristic workspace with floating neon holographic UI screens displaying marketing statistics, high-tech dark background";
          break;
        case 2:
          platform = "Instagram Reel";
          postTitle = "The Autopilot Brand";
          caption = "What if your social campaigns setup and queued themselves while you slept? Stop guessing and let autonomous pipelines do the heavy lifting. ⚡ #MarketingAI #NoCodeTech #FounderLife #GrowthEngine";
          visualPrompt = "A futuristic robotic hand typing on an illuminated crystal glass keyboard, glowing cyan and indigo lights, cinematic perspective";
          break;
        case 3:
          platform = "X (Twitter) Post";
          postTitle = "Stop Building Manual Loops";
          caption = "Most startups fail not because they lack code, but because they waste founders' time on manual repetitive operations. Systemize early. Automate immediately. Read our full setup guide: [link] #TechTrends #Solopreneur #SystemsDesign";
          visualPrompt = "An abstract 3D render of vibrant glowing liquid loops wrapping around a glowing sphere, high contrast, clean minimalist art";
          break;
        default:
          platform = "Instagram Post";
          postTitle = "Next-Gen Campaign Studio";
          caption = `Zero generic copy. Real structured metadata ingestion. High-fidelity creatives. That is the ${brandName} promise. Ready to run? Let's scale. #AIEngineering #GrowthHacking #PromptWars #HackathonPro`;
          visualPrompt = "Minimalist layout of a black dashboard with glowing neon yellow tabs and thick bordered cards displaying brand metrics";
          break;
      }
    }

    return { day, platform, postTitle, caption, visualPrompt };
  });

  const adSlogans = isCafe
    ? [
        "Crafted Espresso. Sourced with Care.",
        "Your Cozy Workspace Away From Home.",
        "Precision Brewing. Exceptional Mornings.",
        "From Farm to Cup. No Middlemen.",
        "Fuel Your Productivity Daily.",
      ]
    : isFashion
    ? [
        "Style That Speaks. Quality That Lasts.",
        "Your Daily Wardrobe, Elevated.",
        "Effortless Comfort. Curated For You.",
        "Uncompromising Quality, Every Stitch.",
        "Redefine Your Everyday Style.",
      ]
    : [
        "Automate the Hustle. Scale the Impact.",
        "Your Brand Strategy, on Autopilot.",
        "Next-Gen Growth, Zero Manual Effort.",
        "Ingest. Analyze. Deploy Instantly.",
        "AI-Powered Campaigns That Deliver.",
      ];

  const imagePrompts = isCafe
    ? [
        "A warm morning scene inside a coffee shop, steaming cup of espresso on a rustic wooden table next to a notebook",
        "A barista carefully pouring steamed milk to make an intricate leaf pattern latte, close-up shot",
        "A pour over coffee station, glass carafe collecting rich dark liquid, copper kettle in background",
      ]
    : isFashion
    ? [
        "A professional fashion photoshoot of a model wearing a minimalist trench coat, studio setting, warm soft lighting",
        "Close-up of premium linen fabric texture, clean stitching, high-end apparel macro details",
        "A beautifully organized walk-in closet displaying curated pastel clothing items, minimalist interior",
      ]
    : [
        "A sleek developer workspace setup with floating neon holographic UI screens displaying growth statistics",
        "A futuristic robot fingers typing on an illuminated keyboard, cyan and indigo glowing wires",
        "Abstract rendering of glowing golden data pipes structuring themselves into an organized geometric node",
      ];

  const growthHacks = isCafe
    ? [
        "Create Instagram Reels showing daily latte art tutorials to drive organic local traffic.",
        "Launch a Friday morning business networking discount to establish the cafe as a remote work hub.",
        "Implement a QR-code based referral discount at tables for customers inviting a coworker.",
      ]
    : isFashion
    ? [
        "Implement a customer styling transformation Reel sequence to drive organic clothing page virality.",
        "Partner with local fashion micro-influencers on TikTok showcase fit videos.",
        "Deploy a free personalized wardrobe quiz tool on the shop website to capture buyer leads.",
      ]
    : [
        "Implement a 'build-in-public' campaign sharing weekly progress charts on social media channels.",
        "Deploy a free useful interactive operations auditor tool to drive organic search lead captures.",
        "Offer a double-sided user invite referral credit framework to accelerate viral signups.",
      ];

  return {
    brandAudit: {
      niche,
      targetAudience,
      swot: { strengths, weaknesses },
      score,
      growthHacks,
    },
    contentCalendar,
    adSlogans,
    imagePrompts,
  };
}
