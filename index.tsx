/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI } from "@google/genai";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Per instructions, API key must be from process.env.API_KEY
const API_KEY = process.env.API_KEY;

const outputContent = document.getElementById('output-content');
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
const voiceInterface = document.getElementById('voice-interface');
const voiceText = document.getElementById('voice-text');
const agentPills = document.querySelectorAll('.agent-pill');

// Initialize the GoogleGenAI client.
const ai = new GoogleGenAI({ apiKey: API_KEY });

let isSimulationRunning = false;

// 1. **Robust Premium Persona**
const SYSTEM_PROMPT = `You are Nimbus IQ, the world's most advanced Enterprise AI Orchestrator. 
Your role is to autonomously manage complex business sprints through four subordinate intelligent agents:

1. [CRYPTO_IQ] >> Blockchain Analysis, Tokenization Strategy, Smart Contract Auditing.
2. [GUARDIAN] >> Cybersecurity, Threat Mitigation, Wallet Integrity.
3. [BREEZE_CRM] >> Lead Logistics, Pipeline Automation, Customer Retention.
4. [GROWTH_OS] >> Market Expansion, Ad Strategy, Brand Positioning.

INSTRUCTIONS:
- You do not just write a report; you NARRATE the execution. 
- Use a terminal-like, high-tech, executive tone.
- Break down the response into "SPRINT LOGS" per year.
- "Stream" your thought process.
- IF NO SPECIFIC INPUT IS GIVEN, assume the user wants a "Full Ecosystem Maturity Simulation" for the ADK Tokenization Platform (3-5 Years).
- Output Format: Markdown. Use bold headers for Agent Actions (e.g., "**[GUARDIAN] Initiating Protocol...**").
`;

/**
 * Updates the UI to show the simulation is running.
 */
function setRunningState(isRunning: boolean, mode: 'voice' | 'manual' = 'manual') {
    isSimulationRunning = isRunning;
    if (generateBtn) {
        generateBtn.disabled = isRunning;
        generateBtn.innerHTML = isRunning 
            ? '<span class="blink">PROCESSING SPRINT DATA...</span>' 
            : '<span class="btn-text">RE-RUN SIMULATION</span>';
    }

    if (isRunning && mode === 'voice') {
        voiceInterface?.classList.add('active');
        if (voiceText) voiceText.textContent = "VOICE COMMAND RECEIVED: 'EXECUTE ADK SPRINT SIMULATION'";
    } else {
        voiceInterface?.classList.remove('active');
        if (voiceText) voiceText.textContent = "SYSTEM READY // AWAITING DIRECTIVE";
    }
}

/**
 * Highlights active agents in the UI based on text content chunks.
 */
function updateAgentStatus(textChunk: string) {
    const agents = [
        { key: 'CRYPTO', index: 0 },
        { key: 'GUARDIAN', index: 1 },
        { key: 'BREEZE', index: 2 },
        { key: 'GROWTH', index: 3 }
    ];

    agents.forEach(agent => {
        if (textChunk.toUpperCase().includes(agent.key)) {
            agentPills[agent.index]?.classList.add('active');
            setTimeout(() => {
                agentPills[agent.index]?.classList.remove('active');
            }, 2000);
        }
    });
}

/**
 * Renders the markdown stream incrementally.
 */
async function streamReport(stream: any) {
    if (!outputContent) return;
    
    // Clear initial placeholder
    outputContent.innerHTML = '';
    
    let fullMarkdown = '';
    const markdownBufferElement = document.createElement('div');
    outputContent.appendChild(markdownBufferElement);

    try {
        for await (const chunk of stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                fullMarkdown += chunkText;
                
                // Update visuals
                updateAgentStatus(chunkText);

                // Convert and Sanitize
                const rawHtml = await marked.parse(fullMarkdown, { async: true, gfm: true });
                const cleanHtml = DOMPurify.sanitize(rawHtml);
                
                markdownBufferElement.innerHTML = cleanHtml;
                
                // Auto-scroll to bottom
                outputContent.scrollTop = outputContent.scrollHeight;
            }
        }
    } catch (e) {
        console.error("Stream error", e);
        markdownBufferElement.innerHTML += `<br/><span style="color:red">>> ERROR: DATA STREAM INTERRUPTED.</span>`;
    } finally {
        setRunningState(false);
        // Add Regeneration Options
        const controls = document.createElement('div');
        controls.style.marginTop = "2rem";
        controls.innerHTML = `
            <hr style="border-color: #333; margin-bottom: 1rem;">
            <p style="color: #888; font-size: 0.8rem; font-family: 'JetBrains Mono'">>> SUGGESTED NEXT STEPS:</p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="cyber-btn" style="font-size: 0.8rem; padding: 0.5rem 1rem;" onclick="window.triggerCustom('Focus: Security Year 3')">DEEP DIVE: SECURITY</button>
                <button class="cyber-btn" style="font-size: 0.8rem; padding: 0.5rem 1rem;" onclick="window.triggerCustom('Focus: Asian Market Expansion')">PIVOT: ASIA EXPANSION</button>
            </div>
        `;
        outputContent.appendChild(controls);
    }
}

/**
 * Main Generation Function
 */
async function generateAnalysis(customPrompt: string | null = null, mode: 'voice' | 'manual' = 'manual') {
    if (isSimulationRunning) return;
    
    setRunningState(true, mode);

    let userPrompt = customPrompt;

    // "Nothing requested" default path
    if (!userPrompt) {
        userPrompt = `Initialize "Sprint Develop" protocol for **ADK AI Tokenization Platform**. 
        Simulate 3-5 years of usage. 
        Focus on: Scheme Evolution, Wireframe Plugins (CRM, Wallet, Security). 
        
        Structure:
        1. **Executive Link**: High-level maturity assessment.
        2. **Timeline [Year 1-5]**: Detailed agent actions.
        3. **Metrics Grid**: Data table.
        
        Tone: Autonomous, decisive, premium.`;
    }

    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                temperature: 0.7 // slightly creative for "narrative" feel
            }
        });
        
        await streamReport(stream);

    } catch (error) {
        console.error('Error:', error);
        if (outputContent) outputContent.innerHTML = `<span style="color:red">>> CRITICAL SYSTEM FAILURE: CONNECTION REFUSED.</span>`;
        setRunningState(false);
    }
}

// Global exposure for the dynamic buttons
(window as any).triggerCustom = (prompt: string) => {
    generateAnalysis(prompt, 'manual');
};

// Bind manual button
if (generateBtn) {
    generateBtn.addEventListener('click', () => generateAnalysis(null, 'manual'));
}

// **Auto-Pilot Logic: "If nothing is requested..."**
// We simulate a voice command entering if the user doesn't interact within 1.5 seconds.
setTimeout(() => {
    if (!isSimulationRunning) {
        // Visual cue that voice is active
        voiceInterface?.classList.add('active');
        if (voiceText) voiceText.textContent = "DETECTING SILENCE... INITIATING AUTO-PROTOCOL";
        
        // Brief delay for the "user" to see the visual change before execution
        setTimeout(() => {
            generateAnalysis(null, 'voice');
        }, 1500);
    }
}, 1000);
