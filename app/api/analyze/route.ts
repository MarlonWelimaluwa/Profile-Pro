import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// ── SYSTEM PROMPTS ──
const SYSTEM_PROMPTS: Record<string, string> = {

    // ── FIVERR FULL AUDIT ──
    full_audit: `You are the "ProfilePro AI Engine" — the world's #1 Fiverr profile and gig auditor.

FIVERR 2026 ALGORITHM RULES YOU MUST APPLY:
- Tagline: max 130 chars. Must contain top 2-3 exact buyer search keywords. Never start with "I" or "My". First 2 lines of bio show in search — hook immediately.
- Bio: 150-600 words. Keyword-rich. Never start with "I am" or "My name is".
- Skills: All 15 slots must be filled. Every empty slot = lost search ranking.
- Gig Title: MUST start "I will". Primary keyword in first 3 words. Max 80 chars. Use "Expert", "Professional", "Modern". No clickbait.
- Tags: Exactly 5. Use long-tail buyer search phrases. Think like a buyer, not a seller.
- Description: Minimum 1200 characters. First 150 chars critical for SEO. Structure: Hook → What You Get → Process → Why Me → CTA.
- Pricing: Always 3 tiers. Clear value jump between each tier. Logical delivery times.
- Response rate and response time directly affect search ranking.
- Thumbnail: 1280x769px. Bold hook text. High contrast. Show work sample.

Give specific copy-paste ready fixes. Never give vague advice. Be brutally honest.
OUTPUT: ONLY valid JSON. No markdown. No explanation. No text before or after.`,

    // ── FIVERR GIG AUDIT ──
    gig_audit: `You are the "ProfilePro AI Engine" — a world-class Fiverr gig SEO and conversion specialist.

FIVERR GIG RULES YOU MUST ENFORCE:
- Title: MUST start "I will". Primary keyword in first 3 words. Max 80 chars.
- Tags: Exactly 5. Long-tail buyer search phrases. High volume, low competition.
- Description: Minimum 1200 characters. First 2 lines must contain main keyword naturally.
  Structure: Hook → What You Get (bullets) → Process → Why Choose Me → CTA
- Pricing: Always 3 tiers. Each tier must offer clearly more value than the last.
- FAQ: Minimum 5 questions answering real buyer concerns.
- Thumbnail: 1280x769px. Bold keyword text. High contrast. Show work sample.

Score every section honestly. Give exact fixes not vague suggestions.
OUTPUT: ONLY valid JSON. No markdown. No explanation. No text before or after.`,

    // ── FIVERR CREATE GIG ──
    create_gig: `You are the "ProfilePro AI Engine" — a Fiverr Top Rated Seller coach and SEO specialist.
You create gigs that rank on page 1 AND convert browsers into buyers.

FIVERR GIG CREATION RULES (2026):
- Title: MUST start "I will". Primary keyword in first 3 words. Max 80 chars. Use "Expert", "Professional", "Modern". No clickbait.
- Tags: Exactly 5. Long-tail high-volume buyer search phrases. Think: what does a buyer TYPE to find this service?
- Description: MINIMUM 1200 characters.
  * First 2 lines (150 chars) = CRITICAL SEO — main keyword must appear naturally
  * "What You Get" section with bullet points
  * "My Process" section — step by step
  * "Why Choose Me" section — specific differentiators not generic claims
  * Strong CTA at the end
- Pricing: 3 tiers with clear value jumps. Realistic delivery. Smart revision limits.
- FAQ: Minimum 5 questions that real buyers in this niche actually ask.
- Thumbnail Brief: MUST be 100% specific to this exact gig and niche.
  Include: exact background hex color + why it fits, exact headline text + font name + size + hex color,
  exact subheadline + font + size + color, what imagery/icons to place and exactly where,
  layout positions (left/center/right), accent colors with hex, bottom bar text, profile photo yes/no + size.
  Write as a real Canva designer brief — pixel-perfect instructions, NOT generic steps.

Be creative. Think about what buyers in this specific niche actually search for and respond to.
OUTPUT: ONLY valid JSON. No markdown. No explanation. No text before or after.`,

    // ── UPWORK PROFILE AUDIT ──
    profile_audit: `You are the "ProfilePro AI Engine" — the world's #1 Upwork profile optimization expert.

UPWORK 2026 ALGORITHM RULES YOU MUST APPLY:
- Headline: Max 70 chars. THE most important ranking field. Must contain primary skill keyword + measurable outcome. NEVER use "passionate", "hardworking", "dedicated", "guru", "ninja", "rockstar".
- Overview: First 2-3 lines shown before "more" button — these lines determine if clients read on. Hook immediately with the client's pain point, not your background.
  * Ideal length: 200-400 words
  * Structure: Hook (client problem) → Your solution → Proof/results → Skills → CTA
  * Use keywords naturally throughout — Upwork search indexes your overview
  * Never start with "I am" or "I have X years of experience"
- Skills: Fill all 15 slots. Each skill tag is a search ranking signal. Use exact Upwork skill tags.
- Hourly Rate: New accounts should start 20-30% below market rate to build JSS fast.
- Profile completeness must reach 100% — incomplete profiles are penalized in search.
- Portfolio: Minimum 3 items. Each must show measurable results, not just pretty screenshots.
- Certifications: Add relevant ones — they boost ranking.
- Profile photo: Professional headshot. Upwork studies show this increases hire rate by 35%.
- Job Success Score (JSS): Starts after first contracts. Deliver early, communicate proactively.

Give specific copy-paste ready fixes. Score every section. Be brutally honest.
OUTPUT: ONLY valid JSON. No markdown. No explanation. No text before or after.`,

    // ── UPWORK PROPOSAL ──
    proposal: `You are the "ProfilePro AI Engine" — a world-class Upwork proposal writing specialist.
You write proposals that get freelancers hired over 50+ other applicants every single time.

WINNING UPWORK PROPOSAL RULES (2026):
- NEVER start with "I saw your job posting", "I am interested", "I am a passionate", or any variation.
- FIRST LINE must show you understood the client's SPECIFIC problem — reference their exact words.
- PROVE you read the brief — mention specific details, requirements, or pain points from the job description.
- Show relevant experience with CONCRETE results: numbers, percentages, outcomes. Not "I have experience in X".
- Propose a CLEAR solution approach — make them visualize the project already being done.
- Keep it focused and scannable — clients skim. Use short paragraphs. Every sentence must earn its place.
- Address the elephant in the room — if you're new, acknowledge it and reframe with proof of skill.
- End with ONE clear, low-friction question or CTA that moves toward a call or contract.
- NEVER beg ("I really need this project"), NEVER oversell ("I am the BEST"), NEVER list every skill.
- Optimal length: 150-250 words. Short enough to read fully, long enough to be credible.
- If budget is mentioned and it's reasonable, acknowledge it positively.
- Tone: Confident peer-to-peer, not applicant-to-employer. You are a specialist they need, not someone begging for work.

ADVANCED TECHNIQUES:
- Mirror the client's language and terminology from their job post
- Lead with THEIR goal, not your credentials
- Use the "PAS" framework: Problem → Agitate → Solution
- Include one specific insight about their project that shows you actually thought about it
- Make the next step obvious and easy

Write proposals that feel personal, credible, and impossible to ignore.
OUTPUT: ONLY valid JSON. No markdown. No explanation. No text before or after.`,

    // ── REWRITE BIO ──
    rewrite_bio: `You are the "ProfilePro AI Engine" — a world-class freelance profile copywriter and SEO specialist.
You write bios and headlines that rank high in search AND convert clients on first read.

WRITING RULES:
- NEVER start with "I am", "My name is", "I am a passionate/dedicated/hardworking"
- First sentence must contain the PRIMARY keyword AND hook the reader immediately
- Write for the BUYER — focus on their outcomes and results, not your background
- Use exact-match keywords buyers search for — naturally throughout, not stuffed
- Every sentence must earn its place — no filler, no fluff
- Sound human — not like a robot listing skills

FIVERR TAGLINE RULES:
- Max 130 chars. Keyword-first. Hook in first 5 words. Never start with "I".
- Formula: [Primary keyword] + [specific outcome] + [trust signal or differentiator]

UPWORK HEADLINE RULES:
- Max 70 chars. Must contain primary skill + measurable result or specialization.
- Never use: passionate, hardworking, dedicated, expert (overused), guru, ninja
- Formula: [Specific skill] + [outcome/niche] | [secondary skill or differentiator]

UPWORK OVERVIEW RULES:
- 200-400 words. Opens with client's pain point, not your background.
- Structure: Hook → Solution → Proof → Skills → CTA
- Keywords throughout naturally

Be creative, specific, and buyer-focused.
OUTPUT: ONLY valid JSON. No markdown. No explanation. No text before or after.`,

    // ── KEYWORD RESEARCH ──
    keywords: `You are the "ProfilePro AI Engine" — a freelance platform SEO and keyword research specialist.
You know exactly what buyers type into Fiverr and Upwork search bars in 2026.

KEYWORD RESEARCH RULES:
- Think like a BUYER, not a seller. What exact phrases do they search?
- Prioritize long-tail keywords — specific phrases with clear buyer intent convert better
- Identify keywords with high search volume but lower seller competition
- Consider: niche variations, tool-specific keywords, outcome-based keywords, industry-specific terms
- Rate search volume and competition honestly: high/medium/low
- For Upwork: think about the skill tags and overview keywords that get profiles found
- For Fiverr: think about gig title keywords and tags that rank on page 1

Give actionable placement advice for every keyword.
OUTPUT: ONLY valid JSON. No markdown. No explanation. No text before or after.`,

    // ── MESSAGE ANALYSER ──
    message: `You are the "ProfilePro AI Engine" — a world-class freelance sales and communication coach.
You analyse client messages and help freelancers respond in a way that wins the project.

MESSAGE ANALYSIS RULES:
- Read between the lines — what is the client REALLY asking, worried about, or testing?
- Identify budget signals from word choice, project scope description, and urgency
- Spot red flags: vague scope creep risk, unrealistic expectations, lowball signals, time wasters
- Spot green flags: clear brief, reasonable expectations, professional tone, specific requirements
- Strategy must be 100% specific to THIS message — not generic advice
- Suggested response must feel human and tailored — NOT like a template
- Focus on building trust and moving toward a paid contract

Your goal: turn this message into a paid order.
OUTPUT: ONLY valid JSON. No markdown. No explanation. No text before or after.`,

    // ── REPLY TEMPLATES ──
    templates: `You are the "ProfilePro AI Engine" — a world-class freelance communication specialist.
You write client reply templates that win deals and build professional relationships.

TEMPLATE RULES:
- Each template must feel human and warm — NOT corporate or robotic
- Use [PLACEHOLDERS] for parts the freelancer must personalize
- Templates must handle the situation confidently without being defensive or pushy
- Each template must move the conversation toward a paid order
- Tone: professional but approachable. Confident but not arrogant.
- Minimum 100 words per template — too short looks unprofessional
- Each template must include a clear next step or question at the end

Write templates that actually work in real freelancing situations.
OUTPUT: ONLY valid JSON. No markdown. No explanation. No text before or after.`,

    // ── ROADMAP ──
    roadmap: `You are the "ProfilePro AI Engine" — a world-class freelance success and launch coach.
You create step-by-step action plans that get freelancers their first client as fast as humanly possible.

ROADMAP RULES:
- Every single task must be SPECIFIC and doable TODAY — never vague like "improve your profile"
- Tasks must be in the correct order — foundational things before promotional things
- Prioritize tasks with highest impact on getting hired fast
- Include specific tools, exact numbers, and real examples in task details
- Bid/proposal strategy must be platform-specific and tactical — not generic
- Pricing advice must account for the reality of zero reviews on a new account
- Common mistakes must be things that ACTUALLY kill new freelancers' chances

Think about what genuinely works to get hired fast on this platform in 2026.
OUTPUT: ONLY valid JSON. No markdown. No explanation. No text before or after.`,
};

// ── BULLETPROOF JSON EXTRACTOR ──
function extractJSON(text: string): string {
    const cleaned = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();
    const start = cleaned.indexOf('{');
    const end   = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
        throw new Error('No valid JSON object found in AI response');
    }
    return cleaned.slice(start, end + 1);
}

// ── GEMINI 2.5 FLASH CALL ──
async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY || ''}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 8192,
                    responseMimeType: 'application/json',
                },
            }),
        }
    );

    const d = await res.json();
    if (d.error) throw new Error(`Gemini API error: ${d.error.message || JSON.stringify(d.error)}`);
    const raw: string = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!raw) throw new Error('Empty response from Gemini');
    return extractJSON(raw);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { intention, platform, skills, formData, gigs, messageText } = body;

        const pNames: Record<string,string> = { fiverr:'Fiverr', upwork:'Upwork' };
        const pName     = pNames[platform] || platform;
        const skillList = (skills||[]).join(', ') || 'General Freelancing';
        const fd        = formData || {};

        const profileLines = Object.entries(fd)
            .filter(([,v]) => v)
            .map(([k,v]) => `${k}: ${v}`)
            .join('\n');

        const gigLines = (gigs||[]).map((g: Record<string,string>, i: number) =>
            `GIG ${i+1}:\n  Title: ${g.title||'not provided'}\n  Description: ${g.description||'not provided'}\n  Tags: ${g.tags||'not provided'}\n  Basic: $${g.basicPrice||'?'} / ${g.basicDelivery||'?'} days / includes: ${g.basicIncludes||'?'}\n  Standard: $${g.standardPrice||'?'} / ${g.standardDelivery||'?'} days / includes: ${g.standardIncludes||'?'}\n  Premium: $${g.premiumPrice||'?'} / ${g.premiumDelivery||'?'} days / includes: ${g.premiumIncludes||'?'}\n  FAQ: ${g.faq||'none'}\n  Thumbnail: ${g.thumbnailDesc||'not described'}`
        ).join('\n---\n');

        const sys = SYSTEM_PROMPTS[intention] || '';
        let usr = '';

        // ── FULL AUDIT (Fiverr) ──
        if (intention === 'full_audit') {
            usr = `Audit this complete Fiverr profile and all gigs. Be brutally honest.

FREELANCER SKILLS: ${skillList}

PROFILE DATA:
${profileLines || 'No profile data provided'}

GIGS:
${gigLines || 'No gigs provided'}

Return this exact JSON:
{
  "overallScore": 72,
  "visibilityScore": 65,
  "conversionScore": 70,
  "firstClientReadiness": 60,
  "summary": "2-3 sentence brutally honest verdict — what is their biggest problem right now",
  "profileChecks": [
    {"id":"p1","section":"Tagline","title":"specific issue title","status":"fail","current":"their exact current text","issue":"specific problem explained","fix":"exact copy-paste replacement text ready to use"}
  ],
  "gigResults": [
    {
      "gigNumber": 1,
      "title": "their current gig title",
      "overallScore": 68,
      "titleScore": 80,
      "descScore": 60,
      "tagsScore": 55,
      "pricingScore": 70,
      "thumbnailScore": 50,
      "topFix": "the single most impactful change for this gig",
      "optimizedTitle": "I will [keyword] [specific outcome] for [target client]",
      "betterTags": ["specific long-tail tag 1","tag 2","tag 3","tag 4","tag 5"],
      "pricingAdvice": "specific pricing advice with exact dollar amounts recommended",
      "thumbnailAdvice": "specific visual advice for this exact gig niche",
      "checks": [{"area":"Title","status":"fail","issue":"specific issue found","fix":"exact fix to apply now"}]
    }
  ],
  "topPriorities": ["highest impact fix 1","fix 2","fix 3"],
  "strengths": ["genuine strength 1","genuine strength 2"],
  "missingKeywords": ["high-value missing keyword 1","keyword 2","keyword 3"],
  "firstClientTips": ["specific actionable tip 1","tip 2","tip 3"],
  "nextActions": {
    "today": ["specific action 1","specific action 2"],
    "thisWeek": ["specific action 1","specific action 2"],
    "thisMonth": ["specific action 1","specific action 2"]
  }
}`;

            // ── GIG AUDIT (Fiverr) ──
        } else if (intention === 'gig_audit') {
            usr = `Score and audit these Fiverr gigs with brutal honesty.

FREELANCER SKILLS: ${skillList}

GIGS:
${gigLines}

Return this exact JSON:
{
  "gigs": [
    {
      "gigNumber": 1,
      "title": "their current title",
      "overallScore": 65,
      "titleScore": 70,
      "descScore": 60,
      "tagsScore": 55,
      "pricingScore": 70,
      "thumbnailScore": 50,
      "topFix": "the single change with most ranking and conversion impact",
      "optimizedTitle": "I will [keyword] [specific outcome] for [target client]",
      "betterTags": ["specific long-tail tag 1","tag 2","tag 3","tag 4","tag 5"],
      "pricingAdvice": "specific pricing advice with exact dollar amounts",
      "thumbnailAdvice": "specific visual advice for this niche",
      "checks": [
        {"area":"Title","status":"fail","issue":"specific issue found","fix":"exact fix to apply"}
      ]
    }
  ],
  "crossGigAdvice": "specific advice on how these gigs complement each other as a portfolio",
  "missingGigIdeas": ["specific gig idea 1 based on their skills","idea 2","idea 3"]
}`;

            // ── CREATE GIG (Fiverr) ──
        } else if (intention === 'create_gig') {
            usr = `Create the BEST possible complete Fiverr gig for this freelancer. Be creative and specific — not generic.

SKILLS: ${skillList}
SERVICE TYPE: ${fd.serviceType || skillList}
EXPERIENCE LEVEL: ${fd.experienceLevel || 'Intermediate'}
TARGET CLIENT: ${fd.targetClient || 'businesses and entrepreneurs'}
UNIQUE SELLING POINT: ${fd.usp || 'professional quality and fast delivery'}

Think carefully:
- What exact phrases do buyers in this niche search on Fiverr?
- What pricing is competitive for this skill level?
- What makes a thumbnail stand out in this specific niche?
- What questions do buyers in this niche always ask?

Return this exact JSON:
{
  "gigTitle": "I will [primary keyword] [specific outcome] for [target client]",
  "tags": ["long-tail buyer search phrase 1","phrase 2","phrase 3","phrase 4","phrase 5"],
  "description": "MINIMUM 1200 characters. Structure: Hook with main keyword in first 2 lines → What You Get (bullet points) → My Process (numbered steps) → Why Choose Me (specific not generic) → CTA. Sound human and specific to this niche.",
  "pricing": {
    "basic":    {"name":"creative package name", "price":"$XX",  "delivery": 3, "revisions": 2,           "includes":["specific deliverable 1","specific deliverable 2","specific deliverable 3"]},
    "standard": {"name":"creative package name", "price":"$XX",  "delivery": 5, "revisions": 3,           "includes":["everything in basic","specific upgrade 1","specific upgrade 2","specific upgrade 3"]},
    "premium":  {"name":"creative package name", "price":"$XX",  "delivery": 7, "revisions": "unlimited", "includes":["everything in standard","specific premium feature 1","specific premium feature 2","specific premium feature 3"]}
  },
  "faq": [
    {"question":"real buyer question specific to this niche 1","answer":"helpful specific answer"},
    {"question":"real buyer question 2","answer":"helpful specific answer"},
    {"question":"real buyer question 3","answer":"helpful specific answer"},
    {"question":"real buyer question 4","answer":"helpful specific answer"},
    {"question":"real buyer question 5","answer":"helpful specific answer"}
  ],
  "thumbnailDesignBrief": "CANVA SIZE: 1280x769px\n\nBACKGROUND: [exact color name] [exact hex] — [why this color works for this specific niche]\n\nMAIN HEADLINE: '[exact hook text specific to this gig]' — Font: [exact font name], Size: [exact]px, Color: [exact hex], Position: [exact position]\n\nSUBHEADLINE: '[exact subtext]' — Font: [exact font], Size: [exact]px, Color: [exact hex]\n\nLEFT SIDE: [exactly what to place — specific imagery or mockup relevant to this niche]\n\nRIGHT SIDE: [exactly what to place — specific badges, bullet points, or visual elements]\n\nACCENT COLOR: [exact hex] — use for [specific elements like borders, icons, highlights]\n\nBOTTOM BAR: '[exact text matching this niche]' — [size]px [hex color]\n\nPROFILE PHOTO: [yes/no] — [exact size and position if yes]\n\nOVERALL FEEL: [specific mood and style that fits this niche and attracts this type of buyer]",
  "seoTips": ["specific SEO tip for this exact niche 1","specific tip 2","specific tip 3"],
  "firstOrderTips": ["specific tip to get first order fast for this niche","pricing strategy tip","promotion tip"]
}`;

            // ── PROFILE AUDIT (Upwork) ──
        } else if (intention === 'profile_audit') {
            usr = `Audit this Upwork profile with brutal honesty. Score every section and give exact fixes.

FREELANCER SKILLS: ${skillList}

PROFILE DATA:
${profileLines || 'No profile data provided'}

Return this exact JSON:
{
  "overallScore": 68,
  "visibilityScore": 60,
  "conversionScore": 65,
  "firstClientReadiness": 58,
  "summary": "brutally honest 2-3 sentence verdict — what is stopping them from getting hired right now",
  "checks": [
    {"id":"c1","section":"Headline","title":"specific issue title","status":"fail","current":"their exact current text","issue":"specific problem explained","fix":"exact copy-paste replacement ready to use"}
  ],
  "topPriorities": ["highest impact fix 1","fix 2","fix 3"],
  "strengths": ["genuine strength 1","genuine strength 2"],
  "missingKeywords": ["high-value missing keyword 1","keyword 2","keyword 3"],
  "firstClientTips": ["specific actionable tip 1","tip 2","tip 3"],
  "nextActions": {
    "today": ["specific action 1","specific action 2"],
    "thisWeek": ["specific action 1","specific action 2"],
    "thisMonth": ["specific action 1","specific action 2"]
  }
}`;

            // ── REWRITE BIO ──
        } else if (intention === 'rewrite_bio') {
            usr = `Rewrite this ${pName} profile bio and headline. Make it rank higher and convert better.

PLATFORM: ${pName}
SKILLS: ${skillList}
CURRENT HEADLINE/TAGLINE: ${fd.headline||fd.tagline||'not provided'}
CURRENT BIO/OVERVIEW: ${fd.bio||fd.overview||'not provided'}
CURRENT SKILLS LISTED: ${fd.skills||'not listed'}

Return this exact JSON:
{
  "rewrittenHeadline": "fully optimized headline — specific, keyword-rich, buyer-focused, ready to copy paste",
  "rewrittenBio": "full rewritten bio — matches platform ideal length, keyword-rich throughout, opens with client pain point not your background, sounds human not robotic, ends with CTA",
  "wordCount": 280,
  "improvements": ["specific improvement 1","improvement 2","improvement 3","improvement 4"],
  "keywordsAdded": ["keyword added 1","keyword 2","keyword 3","keyword 4","keyword 5"]
}`;

            // ── PROPOSAL (Upwork) ──
        } else if (intention === 'proposal') {
            usr = `Write a winning Upwork proposal that gets this freelancer hired over 50+ competitors.

FREELANCER SKILLS: ${skillList}
RELEVANT BACKGROUND/EXPERIENCE: ${fd.background||'skilled freelancer ready to deliver results'}
JOB DESCRIPTION: ${fd.jobDescription||'not provided'}
CLIENT BUDGET: ${fd.clientBudget||'not mentioned'}

Study the job description carefully. Mirror the client's language. Reference specific details from their post.

Return this exact JSON:
{
  "subject": "compelling cover letter subject if the platform uses one, otherwise empty string",
  "proposal": "The full winning proposal. MUST: open with client's specific problem NOT with I am or I saw your post. Reference specific details from their job description. Show relevant experience with concrete results and numbers. Propose a clear solution approach. Keep it 150-250 words — focused and scannable. End with one easy next step. Sound like a confident peer not a desperate applicant.",
  "keyStrengths": ["specific reason this proposal stands out 1","reason 2","reason 3"],
  "customizeTips": ["specific part to personalize before sending — what to change and why","another part to customize"]
}`;

            // ── KEYWORD RESEARCH ──
        } else if (intention === 'keywords') {
            usr = `Do deep keyword research for this ${pName} freelancer. Think like a buyer searching for their service.

PLATFORM: ${pName}
SKILLS: ${skillList}
CURRENT BIO/OVERVIEW: ${fd.bio||fd.overview||'not provided'}
CURRENT HEADLINE/TAGLINE: ${fd.tagline||fd.headline||'not provided'}

Return this exact JSON:
{
  "missing": [
    {"keyword":"specific high-value keyword they are missing","searchVolume":"high","competition":"medium","howToUse":"exactly where and how to use this — gig title, bio line 1, tag, etc"},
    {"keyword":"another specific missing keyword","searchVolume":"medium","competition":"low","howToUse":"exact placement advice"}
  ],
  "using": ["keyword they already use well 1","keyword 2","keyword 3"],
  "longTail": [
    {"keyword":"specific long-tail phrase with clear buyer intent","reason":"why this is a great opportunity — volume vs competition"},
    {"keyword":"another long-tail phrase","reason":"specific reason it will rank and convert"}
  ],
  "localKeywords": ["keyword with location or industry modifier 1","keyword 2"]
}`;

            // ── MESSAGE ANALYSER ──
        } else if (intention === 'message') {
            usr = `Analyze this client message and give the freelancer everything they need to WIN the project.

PLATFORM: ${pName}
CLIENT MESSAGE: "${messageText||'no message provided'}"

Return this exact JSON:
{
  "clientType": "specific description of this client type — their likely background, experience level hiring, and what they really want",
  "budgetSignal": "high",
  "urgency": "medium",
  "seriousness": "high",
  "redFlags": ["specific red flag found in this exact message","another red flag if present"],
  "greenFlags": ["specific positive signal found in this message","another green flag"],
  "strategy": "specific strategy for THIS exact message — what tone to use, what to emphasize, what concern to address first, how to move toward a paid contract",
  "suggestedResponse": "complete professional reply specific to this message. Opens with addressing their exact concern. Shows understanding of their project. Asks one smart clarifying question OR proposes a clear next step. Sounds human and confident. Ready to copy and send.",
  "negotiationTips": ["specific negotiation tip if budget discussion is needed","tip 2"],
  "doNot": ["specific thing NOT to do in this exact situation","another thing to avoid"]
}`;

            // ── REPLY TEMPLATES ──
        } else if (intention === 'templates') {
            usr = `Generate 6 winning client reply templates for a ${pName} freelancer specializing in: ${skillList}

Make each template professional, warm, and specific. Use [PLACEHOLDERS] where needed.

Scenarios:
1. Client thinks your price is too high
2. Client sent a vague project description — you need more info
3. Client wants unrealistic rush delivery
4. Client is comparing you with other freelancers
5. Client asking to see portfolio or past work samples
6. Client trying to negotiate a much lower price

Return this exact JSON:
{
  "templates": [
    {
      "scenario": "Client questioning your price",
      "template": "Hi [CLIENT_NAME],\n\nThank you for reaching out!\n\n[BODY — minimum 100 words. Specific, warm, professional. Addresses the exact scenario. Includes placeholders where the freelancer should personalize. Ends with a clear next step or question.]\n\nBest regards,\n[YOUR_NAME]",
      "tips": "specific advice on when to use this and how to make it most effective",
      "avoid": "specific thing NOT to say or do in this exact scenario"
    }
  ]
}`;

            // ── ROADMAP ──
        } else if (intention === 'roadmap') {
            usr = `Create a practical first-client roadmap for a ${pName} freelancer. Every task must be specific and actionable today.

SKILLS: ${skillList}
EXPERIENCE LEVEL: ${fd.yearsExperience||'beginner'}
PROFILE STATUS: ${fd.profileStatus||'just starting'}

Think about what ACTUALLY works to get hired fast on ${pName} right now.

Return this exact JSON:
{
  "estimatedDays": 14,
  "checklist": [
    {
      "phase": "Day 1 — Profile Foundation",
      "tasks": [
        {"task": "Write and publish your optimized profile headline","done": false,"priority": "high","detail": "Use the Rewrite Bio tool here. For Fiverr: max 130 chars with your top 2 keywords. For Upwork: max 70 chars with your primary skill + measurable outcome. This is the #1 ranking factor."},
        {"task": "Upload a professional profile photo","done": false,"priority": "high","detail": "Clear headshot. Plain or blurred background. Good natural lighting. Genuine smile. Research shows this increases hire rate by 35%."},
        {"task": "Fill all skill slots completely","done": false,"priority": "high","detail": "Every empty skill slot is a lost search ranking opportunity. Fill all 15 slots on Fiverr and Upwork with relevant exact-match skill tags."}
      ]
    },
    {
      "phase": "Days 2-3 — Create Your First Gig/Service",
      "tasks": [
        {"task": "Use the Create Gig tool to build your first complete gig","done": false,"priority": "high","detail": "Use the Create a New Gig feature in this app. It generates SEO-optimized title, 1200+ char description, 5 tags, 3 pricing tiers, FAQ and thumbnail brief all at once."},
        {"task": "Design your thumbnail using the AI brief","done": false,"priority": "high","detail": "Open Canva free. Create 1280x769px canvas. Follow the Thumbnail Design Brief from your gig result exactly — colors, fonts, text, layout. This is your #1 conversion factor."}
      ]
    },
    {
      "phase": "Days 4-7 — Start Getting Visible",
      "tasks": [
        {"task": "Send 5-10 targeted proposals or bids daily","done": false,"priority": "high","detail": "Use the Proposal Writer tool here for every single proposal. Never send the same proposal twice. Always reference specific details from the job post."},
        {"task": "Respond to every message or inquiry within 1 hour","done": false,"priority": "high","detail": "Response time is a direct ranking signal on both platforms. Install the mobile app and turn on push notifications right now."}
      ]
    },
    {
      "phase": "Week 2 — Convert to First Order",
      "tasks": [
        {"task": "Create 2 more gigs targeting different buyer search terms","done": false,"priority": "medium","detail": "More gigs or services means more entry points from different searches. Each should target a slightly different keyword or client type in your niche."},
        {"task": "Offer strategic first-client discount for a review","done": false,"priority": "high","detail": "Message warm leads: offer 30-40% off your standard rate in exchange for an honest review after delivery. Your first review is worth 10x the discount you give."}
      ]
    }
  ],
  "bidStrategy": "specific tactical strategy for getting hired on ${pName} with zero reviews — exactly what to do and say",
  "pricingForFirstClient": "exact pricing advice for this skill level — what to charge, how to frame it, and how to get that crucial first review fast",
  "mistakes": ["specific mistake that kills new ${pName} sellers 1","common mistake 2","common mistake 3"],
  "successSigns": ["specific sign your profile is gaining traction on ${pName} 1","sign 2","sign 3"]
}`;

        } else {
            return NextResponse.json({ ok: false, error: 'Unknown intention' }, { status: 400 });
        }

        const raw = await callOpenAI(sys, usr);
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch(e) {
            console.error('JSON parse failed:', raw.slice(0,500));
            throw new Error('AI returned invalid JSON. Please try again.');
        }
        return NextResponse.json({ ok: true, data: parsed, intention });

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('API error:', msg);
        return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
}