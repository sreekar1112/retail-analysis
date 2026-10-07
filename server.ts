import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Insights endpoint using Gemini API server-side
app.post('/api/insights', async (req, res) => {
  try {
    const { kpis, categoryHighlights, competitorHighlights, filters, dataQualityScore } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured in environment. Deterministic analysis active.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are a Senior Retail Market Share & Competitive Intelligence Analyst at a leading US home-improvement retailer.

Analyze the following calculated metrics derived from retail intelligence data.
STRICT GUIDELINES:
- Do NOT invent facts or figures outside the supplied data.
- Do NOT assume external causes that are not supported by the data.
- Clearly distinguish observed findings from hypotheses.
- If a cause cannot be established from the available data, explicitly state: "Cause cannot be established from the available data; further investigation is required."
- Maintain an executive, analytical tone.

INPUT DATA:
- Active Filter Period: Year ${filters?.year || 'All'}, Quarter ${filters?.quarter || 'All'}, Category ${filters?.category || 'All'}
- Total Market Sales: $${kpis?.totalMarketSales?.toFixed(1) || 'N/A'}M
- Lowe's Sales: $${kpis?.lowesSales?.toFixed(1) || 'N/A'}M
- Lowe's Market Share: ${kpis?.lowesMarketShare?.toFixed(2) || 'N/A'}%
- Lowe's YoY Growth: ${kpis?.lowesYoYGrowth?.toFixed(2) || 'N/A'}%
- Home Depot Market Share: ${kpis?.homeDepotMarketShare?.toFixed(2) || 'N/A'}%
- Market Share Change: ${kpis?.marketShareChange?.toFixed(2) || 'N/A'} pts
- Data Quality Score: ${dataQualityScore?.toFixed(1) || 'N/A'}%

Category Performance Highlights:
${JSON.stringify(categoryHighlights, null, 2)}

Competitor Dynamics:
${JSON.stringify(competitorHighlights, null, 2)}

TASK: Return a structured JSON response matching this schema:
{
  "topFindings": [
    { "finding": "...", "implication": "...", "recommendedAction": "..." },
    { "finding": "...", "implication": "...", "recommendedAction": "..." },
    { "finding": "...", "implication": "...", "recommendedAction": "..." }
  ],
  "topRisks": [
    { "risk": "...", "evidence": "...", "mitigation": "..." },
    { "risk": "...", "evidence": "...", "mitigation": "..." }
  ],
  "topOpportunities": [
    { "opportunity": "...", "evidence": "...", "strategicAction": "..." },
    { "opportunity": "...", "evidence": "...", "strategicAction": "..." }
  ],
  "recommendedNextAnalyses": [
    "...", "...", "..."
  ],
  "executiveSummary": "..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = { rawText: responseText };
    }

    return res.json({
      success: true,
      insights: parsedData,
    });
  } catch (error: any) {
    console.error('Error generating insights with Gemini:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate AI insights',
    });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Retail Intelligence Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
