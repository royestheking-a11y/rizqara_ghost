const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint for the self-ping system
app.get('/', (req, res) => {
    res.status(200).send('Ghost Backend is awake.');
});

app.post('/scan', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || !url.startsWith('http')) {
            return res.status(400).json({ error: 'Invalid URL. Must start with http or https.' });
        }

        console.log(`Starting scan for: ${url}`);
        
        // Launch Puppeteer. 
        // We add standard flags to ensure it runs cleanly in a server/docker environment.
        const browser = await puppeteer.launch({
            headless: 'new',
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        
        const start = Date.now();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        const loadTimeMs = Date.now() - start;
        
        const html = await page.content();
        await browser.close();
        
        const $ = cheerio.load(html);

        const data = {
            title: $('title').text(),
            url: url,
            metaKeywords: $('meta[name="keywords"]').attr('content') || "",
            metaDescription: $('meta[name="description"]').attr('content') || "",
            scripts: $('script[src]').map((i, el) => $(el).attr('src')).get(),
            hasWhatsApp: !!html.match(/wa.me|whatsapp.com/i),
            hasPixel: !!html.match(/fbevents.js|facebook-pixel/i),
            hasGTM: !!html.match(/googletagmanager.com/i),
            hasHotjar: !!html.match(/hotjar/i),
            hasTikTok: !!html.match(/ttq.load|tiktok.com\/analytics/i),
            hasGA: !!html.match(/google-analytics.com|gtag/i),
            hasStripe: !!html.match(/stripe\.com/i),
            hasPayPal: !!html.match(/paypal\.com|paypalobjects/i),
            hasKlarna: !!html.match(/klarna\.com/i),
            hasAfterpay: !!html.match(/afterpay\.com/i),
            hasKlaviyo: !!html.match(/klaviyo\.com/i),
            hasMailchimp: !!html.match(/mailchimp\.com|mc\.us/i),
            socialLinks: extractSocialLinks($),
            emails: extractEmails(html),
            techHints: [],
            headings: {
                h1: $('h1').first().text() || "None",
                h2s: $('h2').map((i, el) => $(el).text()).get().slice(0, 3)
            },
            queryParams: {}, 
            loadTimeMs: loadTimeMs
        };

        // Tech stack hints
        if ($('#__next').length > 0) data.techHints.push("Next.js");
        if ($('[data-reactroot]').length > 0) data.techHints.push("React");
        if ($('meta[name="generator"]').attr('content')?.includes("WordPress")) data.techHints.push("WordPress");
        if ($('script[src*="shopify"]').length > 0) data.techHints.push("Shopify");
        if ($('script[src*="woo"]').length > 0) data.techHints.push("WooCommerce");
        if ($('script[src*="webflow"]').length > 0) data.techHints.push("Webflow");

        const analysis = analyzeData(data);

        res.json({ data, analysis });
    } catch (error) {
        console.error("Scan error:", error);
        res.status(500).json({ error: error.message });
    }
});

function extractSocialLinks($) {
    const links = $('a[href]').map((i, el) => $(el).attr('href')).get();
    const socials = [];
    if (links.some(l => l.includes('instagram.com'))) socials.push('Instagram');
    if (links.some(l => l.includes('linkedin.com'))) socials.push('LinkedIn');
    if (links.some(l => l.includes('twitter.com') || l.includes('x.com'))) socials.push('Twitter');
    if (links.some(l => l.includes('tiktok.com'))) socials.push('TikTok');
    return socials;
}

function extractEmails(html) {
    const emailMatch = html.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    return emailMatch ? emailMatch[1] : null;
}

function analyzeData(data) {
    const techPatterns = {
        "Shopify": { revenueMultiplier: 1.5, gap: "High app overhead, speed optimization needed", strategy: "Focus on conversion rate optimization (CRO) via upsell apps." },
        "WooCommerce": { revenueMultiplier: 1.0, gap: "Server latency issues common", strategy: "Implement advanced caching and CDN to reduce cart abandonment." },
        "Next.js": { revenueMultiplier: 2.0, gap: "High dev cost, potential SEO cannibalization", strategy: "Leverage SSR for lightning-fast dynamic product pages." },
        "React": { revenueMultiplier: 1.8, gap: "SEO indexing challenges if not SSR", strategy: "Ensure pre-rendering for product catalogs." },
        "Webflow": { revenueMultiplier: 1.2, gap: "CMS limits scale", strategy: "Migrate logic to headless architecture if traffic spikes." }
    };

    const niches = {
        "fashion": ["clothing", "wear", "apparel", "style", "boutique", "fashion"],
        "tech": ["software", "saas", "digital", "ai", "gadget", "platform"],
        "service": ["booking", "consulting", "agency", "help", "plumber", "electrician"],
        "ecommerce": ["store", "shop", "cart", "checkout", "buy", "shipping"]
    };

    let niche = "GENERAL BUSINESS";
    const text = ((data.title || "") + " " + (data.metaDescription || "")).toLowerCase();
    for (const [n, keywords] of Object.entries(niches)) {
        if (keywords.some(k => text.includes(k))) {
            niche = n.toUpperCase();
            break;
        }
    }

    const result = {
        niche,
        vulnerabilityScore: 0,
        gaps: [],
        attackPlan: [],
        competitors: [],
        extractedEmail: data.emails || null,
        report: ""
    };

    let vScore = 0;

    data.techHints.forEach((tech) => {
        if (techPatterns[tech]) {
            result.attackPlan.push(`🚀 **${tech} Optimization:** ${techPatterns[tech].strategy}`);
            result.gaps.push(techPatterns[tech].gap);
            vScore += 10;
        }
    });

    const keywords = (data.metaKeywords + " " + data.metaDescription).toLowerCase();
    if (keywords.length < 50) {
        result.gaps.push("Weak Meta Metadata (Under 50 chars)");
        result.attackPlan.push("🔍 **SEO Boost:** Expand Meta Description to 155 chars using high-intent keywords.");
        vScore += 20;
    }

    if (!data.headings.h1 || data.headings.h1 === "None") {
        result.gaps.push("Missing H1 SEO Tag");
        result.attackPlan.push("🔍 **SEO Foundation:** Site is missing an H1 tag. Add a keyword-rich H1 to instantly boost organic ranking.");
        vScore += 15;
    } else if (data.headings.h1.length < 10) {
        result.gaps.push("Weak H1 SEO Tag");
        result.attackPlan.push("🔍 **SEO Foundation:** H1 tag is too short. Optimize it with high-intent keywords to capture organic search traffic.");
        vScore += 10;
    }

    if (!data.hasPixel) {
        result.gaps.push("No Retargeting (Missing Meta Pixel)");
        result.attackPlan.push("🎯 **Retargeting:** Deploy Meta Pixel immediately to capture 98% of visitors who leave without buying.");
        vScore += 25;
    }
    
    if (data.socialLinks && data.socialLinks.includes('TikTok') && !data.hasTikTok) {
        result.gaps.push("TikTok Traffic Unmonetized");
        result.attackPlan.push("📱 **TikTok Ads:** You have a TikTok audience but no Pixel. Install the TikTok Pixel to run targeted scaling ads.");
        vScore += 20;
    }

    if (data.hasWhatsApp) {
        result.attackPlan.push("💬 **WA Strategy:** Automate the first response with a discount code to close leads 2x faster.");
    } else {
        result.gaps.push("Manual Lead Capture Only");
        result.attackPlan.push("📲 **WhatsApp Integration:** Add a floating WA button. 70% of mobile users prefer chat over forms.");
        vScore += 15;
    }

    if (!data.hasGA) {
        result.gaps.push("Missing Analytics");
        vScore += 10;
    }

    const isEcommerce = niche === "ECOMMERCE" || data.techHints.includes("Shopify") || data.techHints.includes("WooCommerce");
    
    if (isEcommerce && !data.hasKlarna && !data.hasAfterpay) {
        result.gaps.push("Missing 'Buy Now, Pay Later'");
        result.attackPlan.push("💳 **BNPL Integration:** Install Klarna or Afterpay to increase average order value (AOV) by up to 45%.");
        vScore += 15;
    }

    if (!data.hasKlaviyo && !data.hasMailchimp) {
        result.gaps.push("No Email Automation Detected");
        result.attackPlan.push("✉️ **Email Marketing:** Missing Klaviyo/Mailchimp. Set up Abandoned Cart and Welcome flows to recover 15% of lost sales.");
        vScore += 15;
    }

    if (data.loadTimeMs && data.loadTimeMs > 4000) {
        result.gaps.push(`Slow Load Time (${(data.loadTimeMs / 1000).toFixed(1)}s)`);
        result.attackPlan.push("⚡ **Speed Optimization:** Site takes too long to load. Every second of delay loses 7% of conversions. Compress assets and deploy a CDN.");
        vScore += 20;
    }

    result.vulnerabilityScore = Math.min(vScore, 100);

    const comps = {
        "FASHION": ["Zara", "H&M", "ASOS", "Local Market Leaders"],
        "TECH": ["ProductHunt Top 10", "G2 Rivals", "Local SaaS competitors"],
        "ECOMMERCE": ["Amazon", "AliExpress", "Ebay", "Niche Leaders"],
        "SERVICE": ["Thumbtack pros", "Yelp Leaders", "Local Agencies"],
        "GENERAL BUSINESS": ["Marketplace giants", "Direct search rivals"]
    };
    result.competitors = comps[niche] || ["Direct Google Search Rivals"];

    result.report = generateGrowthReport(data, result);

    return result;
}

function generateGrowthReport(data, analysis) {
    if (!analysis.gaps || analysis.gaps.length === 0) {
        return `# Growth Audit Report: ${data.url}\n\nYour site is incredibly well optimized. I'd love to connect and see how we can help scale your traffic even further.`;
    }

    return `# 📈 Full Growth Audit Report: ${data.url}

## Executive Summary
Upon scanning the digital infrastructure of **${data.url}**, our intelligence engine detected a **Vulnerability Score of ${analysis.vulnerabilityScore}/100**. In the competitive **${analysis.niche}** space, these unoptimized gaps mean you are actively losing high-intent traffic, failing to capture leads, and bleeding potential revenue daily to competitors like ${analysis.competitors.slice(0,2).join(" and ")}.

---

## ⚠️ Identified Technical & SEO Vulnerabilities
Our deep scan of your live code revealed the following critical leaks:
${analysis.gaps.map(g => `- **${g}**`).join('\n')}

---

## 🚀 The Revenue Solution (Growth Attack Plan)
To plug these leaks and aggressively scale your revenue, we have engineered the following immediate action plan:
${analysis.attackPlan.map(p => `- ${p.replace(/\*\*(.*?)\*\*/g, '**$1**')}`).join('\n')}

---

## 💼 The Partnership Proposal
While your internal team could attempt to patch these issues individually, solving them requires cross-disciplinary expertise combining Advanced SEO, Full-Stack Development, and Performance Marketing. 

**Our team specializes in full-scale digital optimization.** We don't just point out the flaws; we architect, build, and deploy the exact systems needed to fix them and guarantee growth. 

Are you open to a brief 10-minute strategy call this week to discuss migrating your infrastructure and scaling your revenue?

**Prepared for:** ${analysis.extractedEmail ? analysis.extractedEmail : "The " + data.title + " Team"}
`;
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Ghost Backend is running on port ${PORT}`);
    
    // Self-ping system to keep Render free tier awake
    // Render goes to sleep after 15 minutes of inactivity. We ping every 14 minutes.
    const pingUrl = 'https://rizqara-ghost.onrender.com';
    setInterval(() => {
        fetch(pingUrl)
            .then(() => console.log('Self-ping successful. Server is awake.'))
            .catch(err => console.error('Self-ping failed:', err.message));
    }, 14 * 60 * 1000); // 14 minutes
});
