import axios from 'axios';

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyCe1-DBsjAS-yq42ml7JmTkKKYwzaJL03k';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate content using Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<Object>} - The response from Gemini
 */
export const generateContent = async (prompt) => {
  try {
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
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error making Gemini API request:', error);
    throw error;
  }
};

/**
 * Generate startup details based on startup name
 * @param {string} startupName - Name of the startup
 * @returns {Promise<Object>} - Structured startup details
 */
export const generateStartupDetails = async (startupName) => {
  try {
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
      
      Format your response as a JSON object with these fields: description, industry, vision, founded_year, died_year, primary_failure_reason, stage_at_death, funding_amount_usd, key_investors (array), peak_metrics, autopsy_report, lessons_learned, advice_for_founders.
      
      Make the story realistic, specific, and insightful. Include concrete details, numbers, and specific events that led to failure. Make the autopsy report especially detailed and thoughtful.
    `;

    const response = await generateContent(prompt);
    const generatedText = response.candidates[0].content.parts[0].text;
    
    // Extract the JSON object from the response
    const jsonStart = generatedText.indexOf('{');
    const jsonEnd = generatedText.lastIndexOf('}') + 1;
    const jsonStr = generatedText.substring(jsonStart, jsonEnd);
    
    return JSON.parse(jsonStr);
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
    `;

    const response = await generateContent(prompt);
    const generatedText = response.candidates[0].content.parts[0].text;
    
    // Extract the JSON object from the response
    const jsonStart = generatedText.indexOf('{');
    const jsonEnd = generatedText.lastIndexOf('}') + 1;
    const jsonStr = generatedText.substring(jsonStart, jsonEnd);
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error improving startup details:', error);
    throw error;
  }
};