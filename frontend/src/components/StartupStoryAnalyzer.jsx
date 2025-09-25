import { useState } from 'react';
import { generateContent } from '../lib/gemini';
import {
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  LightBulbIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function StartupStoryAnalyzer({ startup, onClose }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const analyzeStartup = async () => {
    if (!startup || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      setError(null);

      const prompt = `
        You are an expert business analyst and storytelling consultant specializing in startup failure analysis.
        
        I have a startup obituary that I want you to analyze and provide specific recommendations to improve 
        the story and make it more insightful and valuable to readers.
        
        Here's the startup obituary data:
        
        Name: ${startup.name}
        Description: ${startup.description || 'Not provided'}
        Industry: ${startup.industry || 'Not provided'}
        Vision: ${startup.vision || 'Not provided'}
        Founded-Died: ${startup.founded_year || '?'} - ${startup.died_year || '?'}
        Primary Failure Reason: ${startup.primary_failure_reason || 'Not provided'}
        Stage at Death: ${startup.stage_at_death || 'Not provided'}
        Funding: ${startup.funding_amount_usd ? '$' + startup.funding_amount_usd.toLocaleString() : 'Not provided'}
        Autopsy Report: ${startup.autopsy_report || 'Not provided'}
        Lessons Learned: ${startup.lessons_learned || 'Not provided'}
        Advice for Founders: ${startup.advice_for_founders || 'Not provided'}
        
        Please analyze this obituary and provide:
        
        1. Overall assessment (1-2 paragraphs): How compelling is this startup story? Is it insightful? Does it provide useful lessons?
        
        2. Specific improvement recommendations for each section:
          - Description (be specific about how to make it more compelling)
          - Vision (how to make it more inspiring)
          - Autopsy Report (areas that need more detail, specific examples, or clearer analysis)
          - Lessons Learned (are they actionable and insightful?)
          - Advice for Founders (how to make it more valuable)
        
        3. Missing elements: What important details or perspectives are missing from this obituary?
        
        4. Reader engagement: How could this story be made more engaging and memorable?
        
        Make your feedback specific, actionable, and constructive. Include examples where possible.
        
        Format your response as a JSON object with these sections:
        {
          "overallAssessment": "string",
          "sectionFeedback": {
            "description": "string",
            "vision": "string",
            "autopsyReport": "string",
            "lessonsLearned": "string",
            "adviceForFounders": "string"
          },
          "missingElements": ["string", "string"],
          "engagementTips": ["string", "string"]
        }
      `;

      const response = await generateContent(prompt);
      const generatedText = response.candidates[0].content.parts[0].text;
      
      // Extract and clean the JSON from the response
      let jsonStr = generatedText.trim();
      
      // Handle markdown code blocks
      if (jsonStr.includes('```json')) {
        const jsonStart = jsonStr.indexOf('```json') + 7;
        const jsonEnd = jsonStr.indexOf('```', jsonStart);
        if (jsonStart > 6 && jsonEnd > jsonStart) {
          jsonStr = jsonStr.substring(jsonStart, jsonEnd).trim();
        }
      } else if (!jsonStr.startsWith('{')) {
        // Find the JSON object if not at the start
        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          jsonStr = jsonStr.substring(jsonStart, jsonEnd);
        }
      }
      
      // Clean up trailing commas
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      
      setAnalysis(JSON.parse(jsonStr));
    } catch (err) {
      console.error('Error analyzing startup story:', err);
      setError('Failed to analyze story. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <LightBulbIcon className="h-6 w-6 mr-2 text-amber-500" />
          AI Story Analysis: {startup?.name}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {!analysis && !isAnalyzing && (
        <div className="text-center py-8">
          <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-primary-500" />
          <h3 className="text-lg font-medium mb-4">Ready to analyze your startup story</h3>
          <p className="text-gray-600 mb-6">
            Our AI will analyze your startup obituary and provide specific recommendations 
            to make it more compelling, insightful, and valuable to readers.
          </p>
          <button
            onClick={analyzeStartup}
            className="btn-primary flex items-center mx-auto"
          >
            <SparklesIcon className="h-5 w-5 mr-2" />
            Analyze Story
          </button>
        </div>
      )}

      {isAnalyzing && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Analyzing your startup story...</p>
          <p className="text-gray-500 mt-2">This will take a few moments</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {analysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex justify-between items-start">
              <h3 className="text-md font-medium text-blue-900 mb-2">Overall Assessment</h3>
              <button
                onClick={() => handleCopy(analysis.overallAssessment)}
                className="text-blue-700 hover:text-blue-900 text-xs flex items-center"
              >
                {copied ? (
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-blue-800 text-sm whitespace-pre-line">{analysis.overallAssessment}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Section Feedback</h3>
            <div className="space-y-4">
              {Object.entries(analysis.sectionFeedback).map(([section, feedback]) => (
                <div key={section} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <h4 className="text-md font-medium text-gray-900 mb-1 capitalize">
                      {section === 'autopsyReport' ? 'Autopsy Report' : 
                       section === 'lessonsLearned' ? 'Lessons Learned' :
                       section === 'adviceForFounders' ? 'Advice for Founders' : section}
                    </h4>
                    <button
                      onClick={() => handleCopy(feedback)}
                      className="text-gray-500 hover:text-gray-700 text-xs flex items-center"
                    >
                      {copied ? (
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm">{feedback}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Missing Elements</h3>
            <ul className="list-disc pl-5 space-y-2">
              {analysis.missingElements.map((element, index) => (
                <li key={index} className="text-gray-700">{element}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Engagement Tips</h3>
            <ul className="list-disc pl-5 space-y-2">
              {analysis.engagementTips.map((tip, index) => (
                <li key={index} className="text-gray-700">{tip}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={analyzeStartup}
              className="btn-outline flex items-center"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Re-analyze Story
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}