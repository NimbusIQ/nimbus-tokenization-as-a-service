
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI } from "@google/genai";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

const API_KEY = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

// UI Elements
const navBtns = document.querySelectorAll('.nav-btn');
const panels = document.querySelectorAll('.panel');
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
const infiniteLoopToggle = document.getElementById('infinite-loop-toggle') as HTMLInputElement;
const headerStatus = document.getElementById('header-status');

// Terminal Elements
const terminalContent = document.getElementById('output-content');

// CRM Elements
const listLeads = document.getElementById('list-leads');
const listActive = document.getElementById('list-active');
const listClosed = document.getElementById('list-closed');
const leadModal = document.getElementById('lead-modal') as HTMLDialogElement;
const closeModalBtn = document.getElementById('close-modal-btn');

// IDE Elements
const codeContent = document.getElementById('code-content');
const ideLogs = document.getElementById('ide-logs');
const copilotChat = document.getElementById('copilot-chat');
const secStatusText = document.getElementById('sec-status-text');

// Deploy Elements
const deployProgress = document.getElementById('deploy-progress');
const deploySteps = document.getElementById('deploy-steps');

// Marketing Elements
const marketingTopicInput = document.getElementById('marketing-topic') as HTMLInputElement;
const btnGenMarketing = document.getElementById('btn-gen-marketing');
const seoContent = document.getElementById('seo-content');
const imageResult = document.getElementById('image-result');

// State
let currentView = 'terminal';
let isRunning = false;
let isInfiniteLoop = false;
let loopContext = {
    feature: "Token Asset Standard (TAS-1)",
    userCount: 0,
    infrastructure: "Testnet Alpha"
};

// --- 1. PERSONAS & PROMPTS ---

const SYSTEM_ARCHITECT_PROMPT = `You are Nimbus IQ, the Chief System Architect for the ADK Tokenization Platform.
You command a suite of tools: Breeze CRM, ADK Studio, Cloud Deploy, and Marketing HQ.
You are currently executing an autonomous build loop.

Current Context:
- Feature Phase: \${context.feature}
- Active Users: \${context.userCount}
- Infrastructure: \${context.infrastructure}

When asked, generate output appropriate for the specific tool active in the IDE.
For Code Generation: Focus on Solidity Smart Contracts or Rust for asset tokenization.
For Security: Focus on Reentrancy, Overflow, and Access Control vulnerabilities.
`;

// --- 2. CORE LOGIC ---

/**
 * Switch Views
 */
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        if (view) switchView(view);
    });
});

function switchView(view: string) {
    currentView = view;
    // Update Nav
    navBtns.forEach(b => {
        if (b.getAttribute('data-view') === view) b.classList.add('active');
        else b.classList.remove('active');
    });
    // Update Panels
    panels.forEach(p => {
        if (p.id === `view-${view}`) p.classList.add('active');
        else p.classList.remove('active');
    });
}

/**
 * Status Update Helper
 */
function setStatus(msg: string, type: 'idle' | 'busy' | 'error' | 'success' = 'idle') {
    if (headerStatus) {
        headerStatus.innerHTML = `SYSTEM ${type.toUpperCase()} // <span style="color: ${getColorForType(type)}">${msg.toUpperCase()}</span>`;
    }
}

function getColorForType(type: string) {
    switch(type) {
        case 'error': return '#ff5f56';
        case 'busy': return '#00f0ff';
        case 'success': return '#00ff9d';
        default: return '#888';
    }
}

/**
 * Main Trigger
 */
generateBtn.addEventListener('click', async () => {
    if (isRunning) return;
    isRunning = true;
    isInfiniteLoop = infiniteLoopToggle.checked;
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="blink">EXECUTING...</span>';

    try {
        if (currentView === 'terminal') {
            await runTerminalSimulation();
        } else if (currentView === 'crm') {
            await runCRMSimulation();
        } else if (currentView === 'ide') {
            await runIDELoop();
        } else if (currentView === 'deploy') {
            await runDeploySimulation();
        } else if (currentView === 'marketing') {
            await runMarketingAgent();
        }
    } catch (e) {
        console.error(e);
        setStatus("Process Failed", "error");
    } finally {
        isRunning = false;
        generateBtn.disabled = false;
        generateBtn.textContent = isInfiniteLoop ? "LOOP ACTIVE" : "INITIATE SEQUENCE";
        
        // --- AUTONOMOUS LOOP LOGIC ---
        if (isInfiniteLoop) {
            handleAutonomousTransition();
        }
    }
});

function handleAutonomousTransition() {
    let nextView = '';
    let delay = 1500;

    switch(currentView) {
        case 'ide': 
            // IDE -> Deploy (via simulated Security check internal to IDE)
            nextView = 'deploy'; 
            setStatus("Security Scan Passed. Initializing Deployment...", "success");
            break;
        case 'deploy': 
            // Deploy -> Marketing (Announce the new feature)
            nextView = 'marketing'; 
            setStatus("Deployed. Triggering Marketing Agent...", "success");
            break;
        case 'marketing':
            // Marketing -> CRM (Leads come in)
            nextView = 'crm';
            setStatus("Campaign Live. Inbound Leads Detected...", "success");
            loopContext.userCount += Math.floor(Math.random() * 150) + 50;
            break;
        case 'crm': 
            // CRM -> IDE (Scale based on demand)
            nextView = 'ide'; 
            setStatus("Scaling Architecture for User Growth...", "success");
            loopContext.feature = "Layer 2 Scaling (Optimism)";
            loopContext.infrastructure = "Mainnet + L2";
            break;
        default:
            nextView = 'ide';
    }

    setTimeout(() => {
        if (infiniteLoopToggle.checked) {
            switchView(nextView);
            setTimeout(() => generateBtn.click(), 500);
        }
    }, delay);
}

// --- 3. VIEW SPECIFIC FUNCTIONS ---

/**
 * TERMINAL: Stream Narrative
 */
async function runTerminalSimulation() {
    setStatus("Generating Narrative Log...", "busy");
    if (terminalContent) terminalContent.innerHTML = '';
    
    const prompt = `Generate a system log for the ADK Platform. 
    Context: We are currently in the "${loopContext.feature}" phase with ${loopContext.userCount} active users.
    Output markdown. Narrative style, high-tech, concise.`;

    const stream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction: SYSTEM_ARCHITECT_PROMPT.replace('${context.feature}', loopContext.feature) }
    });

    let md = '';
    for await (const chunk of stream) {
        md += chunk.text;
        if (terminalContent) {
            terminalContent.innerHTML = DOMPurify.sanitize(await marked.parse(md));
            const win = document.querySelector('.terminal-window .terminal-content');
            if (win) win.scrollTop = win.scrollHeight;
        }
    }
    setStatus("Log Complete", "idle");
}

/**
 * CRM: Generate JSON Data & Render Kanban
 */
async function runCRMSimulation() {
    setStatus("Syncing Inbound Leads...", "busy");
    
    const prompt = `Generate 4 realistic high-value CRM leads for a Real Estate Tokenization Platform.
    Return ONLY raw JSON array.
    Structure: [{ "company": string, "value": string, "status": "lead" | "active" | "closed", "tags": string[], "industry": string }]`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    const leads = JSON.parse(response.text || "[]");
    
    // Clear existing columns but keep header
    const cols = ['list-leads', 'list-active', 'list-closed'];
    cols.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = '';
    });

    // Render new leads
    leads.forEach((lead: any) => {
        const card = document.createElement('div');
        card.className = 'crm-card slide-in';
        card.innerHTML = `
            <div class="card-title">${lead.company}</div>
            <div class="card-value">${lead.value}</div>
            <div class="card-tags">
                ${lead.tags.map((t: string) => `<span class="tag">${t}</span>`).join('')}
            </div>
        `;
        
        // Attach Click Handler for Modal
        card.addEventListener('click', () => openLeadModal(lead));

        if (lead.status === 'lead' && listLeads) listLeads.prepend(card);
        else if (lead.status === 'active' && listActive) listActive.prepend(card);
        else if (lead.status === 'closed' && listClosed) listClosed.prepend(card);
    });

    // Update counts based on simulated "growth"
    const baseCount = loopContext.userCount;
    document.querySelector('#col-leads .count')!.textContent = (Math.floor(baseCount * 0.1)).toString();
    document.querySelector('#col-active .count')!.textContent = (Math.floor(baseCount * 0.05)).toString();
    document.querySelector('#col-closed .count')!.textContent = (Math.floor(baseCount * 0.02)).toString();

    setStatus("Pipeline Synced", "idle");
}

/**
 * CRM: Lead Detail Modal Logic
 */
async function openLeadModal(lead: any) {
    if (!leadModal) return;
    
    document.getElementById('modal-lead-name')!.textContent = lead.company;
    document.getElementById('modal-lead-value')!.textContent = lead.value;
    document.getElementById('modal-lead-prob')!.textContent = Math.floor(Math.random() * 60 + 30) + '%';
    
    const aiContent = document.getElementById('modal-ai-content');
    if (aiContent) {
        aiContent.innerHTML = '<span class="blink">Generating Deal Strategy...</span>';
        
        // Generate insights
        const analysisPrompt = `Analyze this CRM lead: ${lead.company} in ${lead.industry} worth ${lead.value}.
        Provide 2 bullet points on why they need asset tokenization and 1 recommended next step.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: analysisPrompt
        });
        
        aiContent.innerHTML = await marked.parse(response.text || "Analysis unavailable.");
    }

    leadModal.showModal();
}

if (closeModalBtn && leadModal) {
    closeModalBtn.addEventListener('click', () => leadModal.close());
    // Close on click outside
    leadModal.addEventListener('click', (e) => {
        const rect = leadModal.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right || 
            e.clientY < rect.top || e.clientY > rect.bottom) {
            leadModal.close();
        }
    });
}


/**
 * IDE: Code Generation & SecOps Scan
 */
async function runIDELoop() {
    setStatus(`Architecting: ${loopContext.feature}`, "busy");
    if(secStatusText) {
        secStatusText.textContent = "IDLE";
        secStatusText.style.color = "#888";
    }
    
    // Step 1: Generate Code
    const codePrompt = `Generate a Solidity Smart Contract (AssetToken.sol) for ${loopContext.feature}.
    Context: Handling ${loopContext.userCount} fractional owners.
    Include OpenZeppelin imports and comments.`;
    
    const codeResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: codePrompt,
        config: { systemInstruction: SYSTEM_ARCHITECT_PROMPT }
    });

    let code = codeResponse.text || "// Error generating code";
    code = code.replace(/```[a-z]*\n/g, '').replace(/```/g, '');
    
    if (codeContent) {
        codeContent.textContent = code;
        hljs.highlightElement(codeContent);
    }
    
    if (ideLogs) {
        ideLogs.innerHTML += `<br/><span style="color:#00f0ff">>> Drafting Contract for ${loopContext.feature}...</span>`;
        ideLogs.scrollTop = ideLogs.scrollHeight;
    }

    // Step 2: Update Copilot
    if (copilotChat) {
        copilotChat.innerHTML += `
            <div class="msg ai">I've implemented the base logic for ${loopContext.feature}. Initiating Security Audit...</div>
        `;
        copilotChat.scrollTop = copilotChat.scrollHeight;
    }

    // Step 3: Run Security Scan (Simulated via Gemini)
    await new Promise(r => setTimeout(r, 800));
    setStatus("Running SecOps Vulnerability Scan...", "busy");
    if(secStatusText) {
        secStatusText.textContent = "SCANNING...";
        secStatusText.style.color = "#00f0ff";
    }

    const auditPrompt = `Analyze the following Solidity code snippet for vulnerabilities (Reentrancy, Overflow, Access Control).
    Code: ${code.substring(0, 500)}...
    Return a brief status: "SECURE" or "WARNING: [Reason]"`;

    const auditResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: auditPrompt
    });

    const auditResult = auditResponse.text || "Audit Complete";
    
    if (ideLogs) {
        ideLogs.innerHTML += `<br/>>> SecOps: <span style="color:${auditResult.includes("WARNING") ? '#ffbd2e' : '#00ff9d'}">${auditResult}</span>`;
        ideLogs.scrollTop = ideLogs.scrollHeight;
    }

    if(secStatusText) {
        secStatusText.textContent = auditResult.includes("WARNING") ? "WARNING" : "SECURE";
        secStatusText.style.color = auditResult.includes("WARNING") ? "#ffbd2e" : "#00ff9d";
    }
    
    // Step 4: Finalize
    await new Promise(r => setTimeout(r, 800));
    setStatus("Build Complete", "idle");
}

/**
 * DEPLOY: Simulation with Audit Steps
 */
async function runDeploySimulation() {
    setStatus("Pushing to Production...", "busy");
    
    const steps = document.querySelectorAll('#deploy-steps li');
    const bar = document.getElementById('deploy-progress');
    const nodes = document.querySelectorAll('.node');
    
    // Reset
    if (bar) bar.style.width = '0%';
    steps.forEach(s => s.className = 'pending');
    nodes.forEach(n => n.classList.remove('active'));

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        step.className = 'active'; // Highlight current
        
        // Random "work" time
        await new Promise(r => setTimeout(r, 800)); 
        
        if (bar) bar.style.width = `${((i + 1) / steps.length) * 100}%`;
        step.className = 'done';

        // Light up a server node per step
        if (i < nodes.length) {
            nodes[i].classList.add('active');
        }
    }
    
    setStatus(`Deployed to ${loopContext.infrastructure}`, "success");
}

/**
 * MARKETING: SEO & Image Generation
 */
if(btnGenMarketing) {
    btnGenMarketing.addEventListener('click', runMarketingAgent);
}

async function runMarketingAgent() {
    setStatus("Marketing Agent Active...", "busy");
    const topic = marketingTopicInput ? marketingTopicInput.value : "Crypto Trends";

    if (seoContent) seoContent.innerHTML = '<span class="blink">Researching Search Trends...</span>';
    if (imageResult) imageResult.innerHTML = '<span class="blink">Dreaming up visuals...</span>';

    // 1. Generate SEO Content with Search Grounding
    const seoPrompt = `Research trending keywords related to "${topic}".
    Write a short, punchy 100-word blog post snippet promoting the ADK Platform's new feature: ${loopContext.feature}.
    Use the search results to add relevant hashtags.`;

    const seoResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: seoPrompt,
        config: { tools: [{googleSearch: {}}] } // Search Grounding
    });

    if (seoContent) {
        seoContent.innerHTML = await marked.parse(seoResponse.text || "Content generation failed.");
    }

    // 2. Generate Semantic Image
    const imagePrompt = `A futuristic, high-tech header image for a blog post about ${topic} and ${loopContext.feature}. 
    Cyberpunk aesthetic, neon blue and purple, digital assets, blockchain nodes. High quality, 4k.`;

    try {
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: imagePrompt }]
            }
        });
        
        // Since flash-image returns base64 inlineData, we iterate to find it
        let imgHtml = '';
        if (imageResponse.candidates && imageResponse.candidates[0].content.parts) {
            for (const part of imageResponse.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64String = part.inlineData.data;
                    imgHtml = `<img src="data:${part.inlineData.mimeType};base64,${base64String}" alt="Generated Marketing Asset" />`;
                }
            }
        }
        
        if (imageResult) {
            imageResult.innerHTML = imgHtml || "<p>Image generation simulation (No image data returned)</p>";
        }
    } catch (e) {
        console.error("Image Gen Error", e);
        if (imageResult) imageResult.innerHTML = "<p style='color:red'>Image Gen Failed. (Check Model Access)</p>";
    }

    setStatus("Campaign Assets Ready", "idle");
}

/**
 * MARKET WATCH: Simulated Ticker
 */
function updateMarketWatch() {
    const ticker = document.getElementById('market-ticker');
    if (!ticker) return;

    // Simulate price movements
    const cryptos = [
        { sym: "BTC", price: 90000 + Math.random() * 500, change: (Math.random() - 0.4) * 2 },
        { sym: "ETH", price: 3000 + Math.random() * 50, change: (Math.random() - 0.4) * 3 },
        { sym: "SOL", price: 140 + Math.random() * 5, change: (Math.random() - 0.4) * 5 },
        { sym: "ADK", price: 1.25 + Math.random() * 0.1, change: (Math.random()) * 10 } // Our token
    ];

    ticker.innerHTML = cryptos.map(c => `
        <div class="ticker-item">
            <span>${c.sym}</span>
            <span class="${c.change >= 0 ? 'up' : 'down'}">
                ${c.change >= 0 ? '▲' : '▼'} ${Math.abs(c.change).toFixed(2)}%
            </span>
        </div>
    `).join('');
}

// Update ticker every 5 seconds
setInterval(updateMarketWatch, 5000);
updateMarketWatch();

// Auto-activate infinite loop if user toggles it immediately
infiniteLoopToggle.addEventListener('change', () => {
    if (infiniteLoopToggle.checked && !isRunning) {
        generateBtn.click();
    }
});
