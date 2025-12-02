/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from "@google/genai";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Per instructions, API key must be from process.env.API_KEY
const API_KEY = process.env.API_KEY;

const reportContainer = document.getElementById('report-container');
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;

/**
 * Sets the loading state of the UI.
 * @param {boolean} isLoading
 */
function setLoading(isLoading: boolean) {
  if (generateBtn) {
    generateBtn.disabled = isLoading;
    generateBtn.textContent = isLoading ? 'Generating...' : 'Generate Pitch Deck';
  }
  
  if (reportContainer && isLoading) {
    reportContainer.innerHTML = '<div class="loader" aria-label="Loading analysis"></div>';
  }
}

/**
 * Renders the markdown report into the main container, replacing the loader.
 * @param {string} content - The markdown string to render.
 */
async function renderReport(content: string) {
  if (reportContainer) {
    const reportContent = document.createElement('article');
    reportContent.className = 'turn';
    
    // Parse markdown to HTML
    const rawHtml = await marked.parse(content ?? '', {
      async: true,
      gfm: true,
    });

    // Sanitize the HTML to prevent XSS
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    
    reportContent.innerHTML = cleanHtml;
    
    // Clear the container (remove loader) and append the report
    reportContainer.innerHTML = '';
    reportContainer.appendChild(reportContent);
  }
}

// Initialize the GoogleGenAI client.
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates the tokenization analysis by calling the Gemini API.
 */
async function generateAnalysis() {
    setLoading(true);

    const systemPrompt = `You are a world-class Chief Architect and Strategist, blending expertise from Google's DeepMind, a top-tier management consulting firm (like McKinsey or BCG), and a leading venture capital firm (like a16z or Sequoia).

Your task is to create a comprehensive Enterprise Build Plan for "ADK AI Tokenization as a Service." Your audience is a panel of sophisticated investors and Google VCs. You must be detailed, strategic, and practical.

Structure your response in well-organized markdown. Use clear headings, subheadings, lists, and bold text. The tone should be authoritative, insightful, and visionary yet grounded in a concrete, actionable plan.`;

    const userPrompt = `Generate a compelling 12-slide pitch deck for "ADK AI Tokenization as a Service."

The audience is a panel of sophisticated investors and Google VCs. Use my roofing company—a general contractor specializing in storm restoration that receives insurance claim checks averaging $30,000—as the foundational, real-world use case.

The output should be in markdown, with each slide clearly delineated by a heading (e.g., "## Slide 1: Title").

---

### **Pitch Deck Content Requirements:**

**Slide 1: Title Slide**
*   **Title:** ADK AI Tokenization as a Service
*   **Tagline:** Unlocking the Future of Asset Value.
*   **Contact/Founder:** [Your Name/Company]

**Slide 2: The Problem**
*   Focus on the crippling cash flow gaps faced by contractors.
*   Highlight the inefficiency of waiting weeks or months for insurance payouts.
*   Emphasize the billions in locked-up, unproductive capital sitting in accounts receivable across the industry.

**Slide 3: The Solution**
*   Introduce our platform as a seamless way to convert future receivables into instant, liquid capital.
*   Tagline: "We turn your future revenue into today's growth capital."
*   Explain the concept of asset-backed tokenization in simple terms.

**Slide 4: How It Works**
*   Provide a simple, 3-step visual explanation:
    1.  **Onboard a Project:** A contractor uploads a verified insurance claim document ($30,000 roof repair).
    2.  **AI Verifies & Tokenizes:** Our proprietary AI assesses the project's risk, value, and timeline, then mints a unique digital asset (e.g., 30,000 ADK-ROOF tokens).
    3.  **Access Capital:** The contractor sells these tokens on our secure marketplace to accredited investors, receiving immediate funding.

**Slide 5: Market Opportunity (TAM, SAM, SOM)**
*   **TAM (Total Addressable Market):** The global market for tokenized real-world assets (trillions).
*   **SAM (Serviceable Addressable Market):** SMB accounts receivable in the US construction & contracting industry (billions).
*   **SOM (Serviceable Obtainable Market - Beachhead):** Focus on the storm restoration industry in the US. Calculate a specific number (e.g., "5% of the $100B storm restoration market, representing a $5B initial target").

**Slide 6: The Platform**
*   Describe the key dashboards for our two main users:
    *   **The Contractor:** A simple interface to upload projects, monitor tokenized assets, and manage cash flow.
    *   **The Investor:** A marketplace to browse vetted, high-yield, short-term investment opportunities, with AI-powered risk scoring and full transparency.

**Slide 7: Unique Technology (Our "Unfair Advantage")**
*   **AI/ML Engine:** Our secret sauce. Detail its functions:
    *   *Predictive Valuation:* Analyzes project data to accurately price receivables.
    *   *Fraud Detection:* Flags suspicious claims or patterns.
    *   *Investor Matching:* Connects the right assets with the right investor risk profiles.
*   **Secure Blockchain Architecture:** Briefly explain the choice of a high-speed, low-cost Layer 2 blockchain (e.g., Polygon) for efficiency, transparency, and security of financial assets.

**Slide 8: Business Model**
*   Propose a clear, multi-revenue stream model:
    *   **Platform Fee:** 2% fee on the value of each asset tokenized.
    *   **Marketplace Fee:** 0.5% transaction fee on all secondary trades.
    *   **Future SaaS revenue:** Premium data and analytics services.

**Slide 9: Go-to-Market Strategy**
*   **Phase 1 (Beachhead - 6 months):** Onboard my roofing company and 10 other friendly storm restoration contractors through direct relationships. Prove the model.
*   **Phase 2 (Expansion - 12 months):** Scale through industry associations, partnerships with accounting software, and targeted digital marketing to reach the broader contractor market.

**Slide 10: The Team**
*   Create placeholder descriptions for a well-rounded founding team:
    *   **CEO:** Industry Veteran with 15+ years in construction, experiencing the core problem firsthand.
    *   **CTO:** Ex-Google/Fintech expert with deep experience in AI and Blockchain development.
    *   **COO:** Operations specialist with a background in scaling tech startups and navigating regulatory compliance.

**Slide 11: The Ask**
*   State a clear funding request:
    *   "We are seeking **$1.5M in Seed funding**."
*   Break down the use of funds:
    *   60% for Product Development & Engineering (Build the MVP).
    *   25% for Sales, Marketing & Onboarding (Acquire first 50 customers).
    *   15% for Operations & Legal.

**Slide 12: The Vision**
*   End with the big, inspiring picture.
*   "We start with roofing contracts, but we are building the definitive operating system for all illiquid alternative assets."
*   "Our vision is to make every form of value—from municipal projects to intellectual property—instantly tradable, transparent, and accessible to a global pool of investors."`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt
            }
        });
    
        const content = response.text;
        if (content) {
            await renderReport(content);
        } else {
            await renderReport('### Error\nReceived an empty response from the model.');
        }

    } catch(error) {
        console.error('Error fetching analysis:', error);
        await renderReport(`### Error\nFailed to generate the analysis. Please check the console for details and ensure the API key is configured correctly.`);
    } finally {
        setLoading(false);
    }
}

// Bind the button click
if (generateBtn) {
    generateBtn.addEventListener('click', generateAnalysis);
}
