/**
 * Ghost Internet Intelligence System (GIIS)
 * A local, rule-based brain that analyzes business data without external APIs.
 */

const GIIS = {
    // Database of tech stacks and their business implications
    techPatterns: {
        "Shopify": { revenueMultiplier: 1.5, gap: "High app overhead, speed optimization needed", strategy: "Focus on conversion rate optimization (CRO) via upsell apps." },
        "WooCommerce": { revenueMultiplier: 1.0, gap: "Server latency issues common", strategy: "Implement advanced caching and CDN to reduce cart abandonment." },
        "Next.js": { revenueMultiplier: 2.0, gap: "High dev cost, potential SEO cannibalization", strategy: "Leverage SSR for lightning-fast dynamic product pages." },
        "React": { revenueMultiplier: 1.8, gap: "SEO indexing challenges if not SSR", strategy: "Ensure pre-rendering for product catalogs." },
        "Webflow": { revenueMultiplier: 1.2, gap: "CMS limits scale", strategy: "Migrate logic to headless architecture if traffic spikes." }
    },

    // Niche detection based on keywords
    niches: {
        "fashion": ["clothing", "wear", "apparel", "style", "boutique", "fashion"],
        "tech": ["software", "saas", "digital", "ai", "gadget", "platform"],
        "service": ["booking", "consulting", "agency", "help", "plumber", "electrician"],
        "ecommerce": ["store", "shop", "cart", "checkout", "buy", "shipping"]
    },

    analyze: function(data) {
        const result = {
            niche: this.detectNiche(data),
            vulnerabilityScore: 0,
            gaps: [],
            attackPlan: [],
            competitors: [],
            extractedEmail: data.emails || null
        };

        let vScore = 0;

        // 1. Tech Analysis
        data.techHints.forEach(tech => {
            if (this.techPatterns[tech]) {
                result.attackPlan.push(`🚀 <b>${tech} Optimization:</b> ${this.techPatterns[tech].strategy}`);
                result.gaps.push(this.techPatterns[tech].gap);
                vScore += 10;
            }
        });

        // 2. SEO & Keyword Analysis
        const keywords = (data.metaKeywords + " " + data.metaDescription).toLowerCase();
        if (keywords.length < 50) {
            result.gaps.push("Weak Meta Metadata (Under 50 chars)");
            result.attackPlan.push("🔍 <b>SEO Boost:</b> Expand Meta Description to 155 chars using high-intent keywords.");
            vScore += 20;
        }

        // 3. Marketing Signal Analysis
        if (!data.hasPixel) {
            result.gaps.push("No Retargeting (Missing Meta Pixel)");
            result.attackPlan.push("🎯 <b>Retargeting:</b> Deploy Meta Pixel immediately to capture 98% of visitors who leave without buying.");
            vScore += 25;
        }
        
        if (data.socialLinks && data.socialLinks.includes('TikTok') && !data.hasTikTok) {
            result.gaps.push("TikTok Traffic Unmonetized");
            result.attackPlan.push("📱 <b>TikTok Ads:</b> You have a TikTok audience but no Pixel. Install the TikTok Pixel to run targeted scaling ads.");
            vScore += 20;
        }

        if (data.hasWhatsApp) {
            result.attackPlan.push("💬 <b>WA Strategy:</b> Automate the first response with a discount code to close leads 2x faster.");
        } else {
            result.gaps.push("Manual Lead Capture Only");
            result.attackPlan.push("📲 <b>WhatsApp Integration:</b> Add a floating WA button. 70% of mobile users prefer chat over forms.");
            vScore += 15;
        }

        if (!data.hasGA) {
            result.gaps.push("Missing Analytics");
            vScore += 10;
        }

        const isEcommerce = result.niche === "ECOMMERCE" || data.techHints.includes("Shopify") || data.techHints.includes("WooCommerce");
        
        if (isEcommerce && !data.hasKlarna && !data.hasAfterpay) {
            result.gaps.push("Missing 'Buy Now, Pay Later'");
            result.attackPlan.push("💳 <b>BNPL Integration:</b> Install Klarna or Afterpay to increase average order value (AOV) by up to 45%.");
            vScore += 15;
        }

        if (!data.hasKlaviyo && !data.hasMailchimp) {
            result.gaps.push("No Email Automation Detected");
            result.attackPlan.push("✉️ <b>Email Marketing:</b> Missing Klaviyo/Mailchimp. Set up Abandoned Cart and Welcome flows to recover 15% of lost sales.");
            vScore += 15;
        }

        if (data.loadTimeMs && data.loadTimeMs > 4000) {
            result.gaps.push(`Slow Load Time (${(data.loadTimeMs / 1000).toFixed(1)}s)`);
            result.attackPlan.push("⚡ <b>Speed Optimization:</b> Site takes too long to load. Every second of delay loses 7% of conversions. Compress assets and deploy a CDN.");
            vScore += 20;
        }

        result.vulnerabilityScore = Math.min(vScore, 100);

        // 4. Competitor Logic
        result.competitors = this.getCompetitors(result.niche);

        result.pitch = this.generatePitch(data, result);

        return result;
    },

    generatePitch: function(data, analysis) {
        if (!analysis.gaps || analysis.gaps.length === 0) {
            return `Hey team at ${data.title},\n\nI noticed your site is incredibly well optimized. I'd love to connect and see how we can help scale your traffic even further.\n\nBest,\n[Your Name]`;
        }
    
        const mainGap = analysis.gaps[0];
        
        return `Subject: Quick question about ${data.url}
        
Hey there,

I was browsing your site today and noticed a critical gap in your setup: you are currently struggling with **${mainGap}**. 

In the ${analysis.niche} space, this usually means you are bleeding potential revenue every single day. For example, my scan showed that you are also dealing with:
${analysis.gaps.slice(1).map(g => `- ${g}`).join('\n')}

I specialize in fixing exactly these architectural bottlenecks. I've already mapped out a Growth Attack Plan for you:
${analysis.attackPlan.map(p => `- ${p.replace(/<[^>]*>?/gm, '')}`).join('\n')}

Are you open to a quick 5-minute chat this week to discuss how we can plug these leaks and scale your revenue?

Best regards,
[Your Name]`;
    },

    detectNiche: function(data) {
        if (!data) return "GENERAL BUSINESS";
        const text = ((data.title || "") + " " + (data.metaDescription || "")).toLowerCase();
        for (const [niche, keywords] of Object.entries(this.niches)) {
            if (keywords.some(k => text.includes(k))) return niche.toUpperCase();
        }
        return "GENERAL BUSINESS";
    },

    getCompetitors: function(niche) {
        const comps = {
            "FASHION": ["Zara", "H&M", "ASOS", "Local Market Leaders"],
            "TECH": ["ProductHunt Top 10", "G2 Rivals", "Local SaaS competitors"],
            "ECOMMERCE": ["Amazon", "AliExpress", "Ebay", "Niche Leaders"],
            "SERVICE": ["Thumbtack pros", "Yelp Leaders", "Local Agencies"],
            "GENERAL BUSINESS": ["Marketplace giants", "Direct search rivals"]
        };
        return comps[niche] || ["Direct Google Search Rivals"];
    }
};

if (typeof module !== 'undefined') {
    module.exports = GIIS;
}
