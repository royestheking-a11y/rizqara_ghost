// Advanced Content script for Intelligent Data Extraction
// Using IIFE to prevent variable redeclaration errors
(function() {
    if (window.ghostInternetLoaded) return;
    window.ghostInternetLoaded = true;

    function extractData() {
        try {
            const html = document.body.innerHTML;
            const data = {
                title: document.title,
                url: window.location.href,
                metaKeywords: document.querySelector('meta[name="keywords"]')?.content || "",
                metaDescription: document.querySelector('meta[name="description"]')?.content || "",
                scripts: Array.from(document.scripts).map(s => s.src).filter(src => src),
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
                socialLinks: extractSocialLinks(),
                emails: extractEmails(html),
                techHints: [],
                loadTimeMs: window.performance ? (window.performance.timing.loadEventEnd - window.performance.timing.navigationStart) : 0,
                headings: {
                    h1: document.querySelector('h1')?.innerText || "None",
                    h2s: Array.from(document.querySelectorAll('h2')).map(h => h.innerText).slice(0, 3)
                },
                queryParams: Object.fromEntries(new URLSearchParams(window.location.search)),
                whatsappDetails: extractWhatsAppDetails()
            };

            // Enhanced tech stack detection
            if (document.querySelector('#__next')) data.techHints.push("Next.js");
            if (window.React || document.querySelector('[data-reactroot]')) data.techHints.push("React");
            if (document.querySelector('meta[name="generator"]')?.content?.includes("WordPress")) data.techHints.push("WordPress");
            if (document.querySelector('script[src*="shopify"]') || window.Shopify) data.techHints.push("Shopify");
            if (document.querySelector('script[src*="woo"]')) data.techHints.push("WooCommerce");
            if (document.querySelector('script[src*="webflow"]')) data.techHints.push("Webflow");

            return data;
        } catch (e) {
            console.error("Ghost Internet Extraction Error:", e);
            return null;
        }
    }

    function extractSocialLinks() {
        const links = Array.from(document.querySelectorAll('a[href]')).map(a => a.href);
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

    function extractWhatsAppDetails() {
        const waLink = document.querySelector('a[href*="wa.me"], a[href*="whatsapp.com"]');
        if (!waLink) return null;
        
        try {
            const href = waLink.href;
            const phone = href.match(/phone=([0-9]+)/)?.[1] || "Detected";
            const text = decodeURIComponent(href.match(/text=([^&]+)/)?.[1] || "None");
            return { phone, text };
        } catch (e) {
            return { phone: "Detected", text: "None" };
        }
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "extract") {
            sendResponse(extractData());
        }
        return true; // Keep message channel open for async
    });
})();
