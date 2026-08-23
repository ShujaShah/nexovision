const axios = require('axios');
const fs = require('fs');
const path = require('path');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'dcarrascosa/medgemma-1.5-4b-it:Q4_K_M';

/**
 * Checks if Ollama server is running and the model is available
 */
exports.checkHealth = async () => {
  try {
    const res = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    const models = res.data.models;
    const hasMedGemma = models.some(m => m.name === OLLAMA_MODEL);
    
    return {
      status: 'ok',
      hasMedGemma,
      models: models.map(m => m.name)
    };
  } catch (error) {
    console.error('Ollama health check failed:', error.message);
    return { status: 'error', message: 'Ollama server not reachable' };
  }
};

/**
 * Reads an image file and converts it to a base64 string
 */
const imageToBase64 = (filePath) => {
  const fullPath = path.join(__dirname, '..', '..', filePath);
  const bitmap = fs.readFileSync(fullPath);
  return Buffer.from(bitmap).toString('base64');
};

/**
 * Prompts MedGemma with an image and medical context
 */
exports.analyzeMedicalImage = async (filePath, imageType, bodyPart, clinicalContext = '') => {
  try {
    const base64Image = imageToBase64(filePath);
    
    const prompt = `You are an expert AI radiologist assistant powered by MedGemma.
Please analyze this ${imageType} of the ${bodyPart}. 
${clinicalContext ? `Clinical context: ${clinicalContext}` : ''}

Provide a structured report with the following sections EXACTLY as formatted below. Do not deviate from this format.

IMPRESSION:
[Provide a brief 1-2 sentence overall impression]

FINDINGS:
- [Region 1]: [Description] (Severity: normal|mild|moderate|severe|critical)
- [Region 2]: [Description] (Severity: normal|mild|moderate|severe|critical)

RECOMMENDATIONS:
- [Recommendation 1]
- [Recommendation 2]

DIFFERENTIAL DIAGNOSIS:
- [Diagnosis 1]
- [Diagnosis 2]`;

    console.log(`Sending request to Ollama (${OLLAMA_MODEL})...`);
    
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, {
      model: OLLAMA_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
          images: [base64Image]
        }
      ],
      stream: false,
    }, {
      timeout: 120000 // 2 minute timeout for generation
    });

    const rawResponse = response.data.message.content;
    const structuredData = parseMedGemmaResponse(rawResponse);

    return {
      raw: rawResponse,
      structured: structuredData
    };
  } catch (error) {
    console.error('Ollama Analysis Error:', error.response?.data || error.message);
    throw new Error('Failed to analyze image with MedGemma');
  }
};

/**
 * Parses the raw text from MedGemma into a structured JSON object
 */
function parseMedGemmaResponse(rawText) {
  const result = {
    impression: '',
    findings: [],
    recommendations: [],
    differentialDiagnosis: []
  };

  try {
    // Basic regex-based parsing to extract sections
    const impressionMatch = rawText.match(/IMPRESSION:\s*([\s\S]*?)(?=FINDINGS:|RECOMMENDATIONS:|DIFFERENTIAL DIAGNOSIS:|$)/i);
    if (impressionMatch) result.impression = impressionMatch[1].trim();

    const findingsMatch = rawText.match(/FINDINGS:\s*([\s\S]*?)(?=RECOMMENDATIONS:|DIFFERENTIAL DIAGNOSIS:|$)/i);
    if (findingsMatch) {
      const lines = findingsMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
      lines.forEach(line => {
        // Expected format: - [Region]: [Description] (Severity: [severity])
        const regionMatch = line.match(/-\s*([^:]+):/);
        const severityMatch = line.match(/\(Severity:\s*([^)]+)\)/i);
        
        const region = regionMatch ? regionMatch[1].trim() : 'General';
        let severity = severityMatch ? severityMatch[1].trim().toLowerCase() : 'normal';
        
        // Validate against Mongoose enum
        const validSeverities = ['normal', 'mild', 'moderate', 'severe', 'critical'];
        if (!validSeverities.includes(severity)) {
          severity = 'normal'; // Default fallback if model hallucinates or copies the prompt exactly
        }

        let description = line.replace(/-\s*[^:]+:/, '').replace(/\(Severity:[^)]+\)/i, '').trim();

        result.findings.push({ region, description, severity });
      });
    }

    const recMatch = rawText.match(/RECOMMENDATIONS:\s*([\s\S]*?)(?=DIFFERENTIAL DIAGNOSIS:|$)/i);
    if (recMatch) {
      result.recommendations = recMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/-\s*/, '').trim());
    }

    const diffMatch = rawText.match(/DIFFERENTIAL DIAGNOSIS:\s*([\s\S]*?)(?=$)/i);
    if (diffMatch) {
      result.differentialDiagnosis = diffMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/-\s*/, '').trim());
    }
  } catch (e) {
    console.warn('Failed to strictly parse MedGemma response', e);
  }

  return result;
}
