document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    const growthSection = document.getElementById('growthSection');
    const gapSection = document.getElementById('gapSection');
    const competitorCard = document.getElementById('competitorCard');
    const emailCard = document.getElementById('emailCard');
    const vHeader = document.getElementById('vulnerabilityHeader');
    
    console.log("Ghost Internet: Popup Loaded");

    scanBtn.addEventListener('click', async () => {
        console.log("Ghost Internet: Starting Scan...");
        
        // UI Feedback
        scanBtn.innerHTML = '<i data-lucide="refresh-cw" class="spin"></i> Decoding...';
        scanBtn.disabled = true;
        lucide.createIcons();

        // Reset UI
        growthSection.classList.remove('active');
        gapSection.classList.remove('active');
        competitorCard.style.display = 'none';
        emailCard.style.display = 'none';
        vHeader.style.display = 'none';

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
                throw new Error("Invalid URL. Try on a business website.");
            }

            // Attempt to communicate
            chrome.tabs.sendMessage(tab.id, { action: "extract" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn("Content script not found, attempting injection...");
                    injectAndScan(tab.id);
                } else if (response) {
                    renderAnalysis(response);
                } else {
                    throw new Error("No data received from page.");
                }
            });
        } catch (err) {
            console.error("Ghost Internet Error:", err);
            alert(err.message);
            resetButton();
        }
    });

    function injectAndScan(tabId) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }, () => {
            chrome.tabs.sendMessage(tabId, { action: "extract" }, (retryResponse) => {
                if (retryResponse) {
                    renderAnalysis(retryResponse);
                } else {
                    alert("Analysis failed. Please refresh the page manually.");
                    resetButton();
                }
            });
        });
    }

    function renderAnalysis(data) {
        console.log("Ghost Internet: Rendering Analysis Data", data);
        
        const analysis = GIIS.analyze(data);

        setTimeout(() => {
            // Update Data Cards
            document.getElementById('revenue').innerText = calculateRevenue(data);
            document.getElementById('traffic').innerText = inferTraffic(data);
            document.getElementById('seo').innerText = calculateSEOScore(data);
            document.getElementById('tech').innerText = data.techHints.length > 0 ? data.techHints[0] : "Proprietary";

            // Update Badges
            document.getElementById('badge-revenue').classList.toggle('active', data.techHints.includes('Shopify'));
            document.getElementById('badge-traffic').classList.toggle('active', data.hasPixel);
            document.getElementById('badge-seo').classList.toggle('active', data.headings.h1 !== "None");

            // Vulnerability Score
            vHeader.style.display = 'block';
            document.getElementById('vScoreText').innerText = analysis.vulnerabilityScore;
            document.getElementById('vBarFill').style.width = analysis.vulnerabilityScore + '%';
            if(analysis.vulnerabilityScore > 60) document.getElementById('vBarFill').style.backgroundColor = '#ff4d4d';
            else if(analysis.vulnerabilityScore > 30) document.getElementById('vBarFill').style.backgroundColor = '#ffc107';
            else document.getElementById('vBarFill').style.backgroundColor = '#28a745';

            // Growth Plan
            const growthHtml = analysis.attackPlan.map(p => `
                <div class="list-item">
                    <i data-lucide="check-circle-2" style="width: 18px;"></i>
                    <span>${p}</span>
                </div>
            `).join("");
            document.getElementById('growthPlan').innerHTML = growthHtml;
            growthSection.classList.add('active');

            // Gap Analysis
            const gapHtml = analysis.gaps.map(g => `
                <div class="list-item">
                    <i data-lucide="x-circle" style="width: 18px; color: #ff4d4d;"></i>
                    <span>${g}</span>
                </div>
            `).join("");
            document.getElementById('gapAnalysis').innerHTML = gapHtml;
            gapSection.classList.add('active');

            // Competitors & Email
            document.getElementById('competitors').innerText = analysis.competitors.join(" • ");
            competitorCard.style.display = 'block';

            if(analysis.extractedEmail) {
                document.getElementById('extractedEmail').innerText = analysis.extractedEmail;
                emailCard.style.display = 'block';
            }

            lucide.createIcons();
            resetButton();
        }, 1000);
    }

    function resetButton() {
        scanBtn.innerHTML = '<i data-lucide="zap"></i> Run Intelligence Scan';
        scanBtn.disabled = false;
        lucide.createIcons();
    }

    function calculateRevenue(data) {
        let val = 5000;
        if (data.techHints.includes("Shopify")) val = 75000;
        if (data.hasPixel) val *= 2.5;
        if (data.hasWhatsApp) val *= 1.2;
        return "$" + Math.floor(val/1000) + "k - $" + Math.floor((val*3)/1000) + "k/mo";
    }

    function inferTraffic(data) {
        if (data.hasPixel && data.hasGTM) return "Paid/Scaling";
        if (data.socialLinks && data.socialLinks.includes('TikTok')) return "Social/Viral";
        if (data.metaKeywords.length > 10) return "Organic SEO";
        return "Direct Lead";
    }

    function calculateSEOScore(data) {
        let score = 35;
        if (data.metaKeywords) score += 20;
        if (data.metaDescription) score += 20;
        if (data.headings.h1 !== "None") score += 25;
        return score + "% Efficiency";
    }
});
