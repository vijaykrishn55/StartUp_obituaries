import axios from 'axios';

// Gemini API configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Check if API key is configured
if (!GEMINI_API_KEY) {
  console.error('VITE_GEMINI_API_KEY is not configured. Please check your .env file.');
}

/**
 * Generate content using Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<Object>} - The response from Gemini
 */
export const generateContent = async (prompt) => {
  try {
    // Basic validation
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt provided');
    }

    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        },
        timeout: 30000 // 30 second timeout to avoid hanging requests
      }
    );

    // Validate response format
    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
      console.error('Unexpected Gemini API response format:', response.data);
      throw new Error('Received unexpected response format from Gemini API');
    }

    return response.data;
  } catch (error) {
    console.error('Error making Gemini API request:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Gemini API error data:', error.response.data);
      console.error('Gemini API error status:', error.response.status);
      throw new Error(`Gemini API error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from Gemini API. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};

/**
 * Generate startup details based on startup name
 * @param {string} startupName - Name of the startup
 * @returns {Promise<Object>} - Structured startup details
 */
export const generateStartupDetails = async (startupName) => {
  try {
    if (!startupName || typeof startupName !== 'string') {
      throw new Error('Invalid startup name provided');
    }
    
    const prompt = `
      You are an expert business analyst specializing in startup failure analysis. 
      I want you to generate comprehensive details about a fictional failed startup named "${startupName}".
      
      Create a detailed and realistic profile including:
      
      1. Brief description (2-3 sentences)
      2. Industry (be specific)
      3. Vision (1 sentence describing ambitious goal)
      4. Founded year (between 2010-2020)
      5. Died year (between founded year and 2025)
      6. Primary failure reason (choose from: "Ran out of funding", "No Product-Market Fit", "Poor Unit Economics", "Co-founder Conflict", "Technical Debt", "Got outcompeted", "Bad Timing", "Legal/Regulatory Issues", "Pivot Fatigue")
      7. Stage at death (choose from: "Idea", "Pre-seed", "Seed", "Series A", "Series B+")
      8. Funding amount in USD (realistic for the stage)
      9. Key investors (3-5 realistic investor names)
      10. Peak metrics (3-4 realistic KPIs the startup achieved)
      11. Autopsy report (5-7 detailed paragraphs analyzing the failure)
      12. Lessons learned (4-5 bullet points of valuable lessons)
      13. Advice for founders (2-3 paragraphs of specific advice)
      
      Format your response as a JSON object with these fields: description, industry, vision, founded_year, died_year, primary_failure_reason, stage_at_death, funding_amount_usd, key_investors (array), peak_metrics (formatted string like "100K monthly users, $2M ARR, 25% MoM growth"), autopsy_report, lessons_learned, advice_for_founders.
      
      Make the story realistic, specific, and insightful. Include concrete details, numbers, and specific events that led to failure. Make the autopsy report especially detailed and thoughtful.
      
      IMPORTANT: Return only the JSON object, without any markdown formatting, code blocks, or additional text.
    `;

    const response = await generateContent(prompt);
    const generatedText = response.candidates[0].content.parts[0].text;
    
    try {
      // Extract and clean the JSON from the response
      let jsonStr = generatedText.trim();
      
      // Handle case where response is wrapped in markdown code blocks
      if (jsonStr.includes('```json')) {
        const jsonStart = jsonStr.indexOf('```json') + 7;
        const jsonEnd = jsonStr.indexOf('```', jsonStart);
        if (jsonStart > 6 && jsonEnd > jsonStart) {
          jsonStr = jsonStr.substring(jsonStart, jsonEnd).trim();
        }
      } else if (jsonStr.includes('```')) {
        // Handle generic code blocks
        const jsonStart = jsonStr.indexOf('```') + 3;
        const jsonEnd = jsonStr.indexOf('```', jsonStart);
        if (jsonStart > 2 && jsonEnd > jsonStart) {
          jsonStr = jsonStr.substring(jsonStart, jsonEnd).trim();
        }
      }
      
      // If it doesn't start with {, try to find the JSON object
      if (!jsonStr.startsWith('{')) {
        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          jsonStr = jsonStr.substring(jsonStart, jsonEnd);
        }
      }
      
      // Clean up common JSON issues
      // Remove trailing commas before closing braces/brackets
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse JSON from Gemini response:', parseError);
      console.error('Cleaned JSON string:', jsonStr);
      console.error('Raw response:', generatedText);
      throw new Error('Failed to parse startup details from Gemini response');
    }
  } catch (error) {
    console.error('Error generating startup details:', error);
    throw error;
  }
};

/**
 * Generate improved version of startup content
 * @param {Object} currentDetails - Current startup details
 * @returns {Promise<Object>} - Improved startup details
 */
export const improveStartupDetails = async (currentDetails) => {
  try {
    if (!currentDetails || typeof currentDetails !== 'object') {
      throw new Error('Invalid startup details provided');
    }
    
    const prompt = `
      You are an expert business analyst specializing in startup failure analysis.
      I have a startup obituary that I'd like you to improve and enhance with more detailed, insightful content.
      
      Here is the current content:
      ${JSON.stringify(currentDetails, null, 2)}
      
      Please enhance this content to make it:
      1. More detailed and specific (add concrete examples, numbers, timeline details)
      2. More insightful (deeper analysis of causes and effects)
      3. More educational (clear lessons that others can apply)
      4. More engaging (compelling narrative structure)
      
      Keep the same basic facts and structure, but expand and enhance the content significantly.
      Format your response as a JSON object with the same fields as the input.
      
      IMPORTANT: Return only the JSON object, without any markdown formatting, code blocks, or additional text.
    `;

    const response = await generateContent(prompt);
    const generatedText = response.candidates[0].content.parts[0].text;
    
    try {
      // Extract and clean the JSON from the response
      let jsonStr = generatedText.trim();
      
      // Handle case where response is wrapped in markdown code blocks
      if (jsonStr.includes('```json')) {
        const jsonStart = jsonStr.indexOf('```json') + 7;
        const jsonEnd = jsonStr.indexOf('```', jsonStart);
        if (jsonStart > 6 && jsonEnd > jsonStart) {
          jsonStr = jsonStr.substring(jsonStart, jsonEnd).trim();
        }
      } else if (jsonStr.includes('```')) {
        // Handle generic code blocks
        const jsonStart = jsonStr.indexOf('```') + 3;
        const jsonEnd = jsonStr.indexOf('```', jsonStart);
        if (jsonStart > 2 && jsonEnd > jsonStart) {
          jsonStr = jsonStr.substring(jsonStart, jsonEnd).trim();
        }
      }
      
      // If it doesn't start with {, try to find the JSON object
      if (!jsonStr.startsWith('{')) {
        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          jsonStr = jsonStr.substring(jsonStart, jsonEnd);
        }
      }
      
      // Clean up common JSON issues
      // Remove trailing commas before closing braces/brackets
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse JSON from Gemini response:', parseError);
      console.error('Cleaned JSON string:', jsonStr);
      console.error('Raw response:', generatedText);
      throw new Error('Failed to improve startup details: Invalid response format');
    }
  } catch (error) {
    console.error('Error improving startup details:', error);
    throw error;
  }
};