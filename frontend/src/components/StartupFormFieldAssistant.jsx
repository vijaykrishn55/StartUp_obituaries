import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { generateContent } from '../lib/gemini';
import {
  SparklesIcon,
  ArrowPathIcon,
  LightBulbIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Helper function to improve a specific field with Gemini
const improveField = async (field, value, context) => {
  try {
    const prompt = `
      You are an expert business analyst specializing in startup failure analysis.
      I'm writing a startup obituary and need help improving the content for the "${field}" section.
      
      Current content: "${value}"
      
      Additional context about the startup: ${context}
      
      Please enhance this content to make it more detailed, specific, insightful, and engaging.
      Provide concrete examples, numbers, and specific details where appropriate.
      Keep the same overall message but make it much more compelling and professionally written.
      Your response should be just the improved text, nothing else - no comments, no markup.
    `;

    const response = await generateContent(prompt);
    return response.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error(`Error improving ${field}:`, error);
    throw error;
  }
};

export default function StartupFormFieldAssistant({ 
  fieldName,
  fieldValue = '',
  startupContext = '',
  onUpdateField,
  disabled = false
}) {
  const [isImproving, setIsImproving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImprove = async () => {
    if (disabled || !fieldValue || isImproving) return;

    try {
      setIsImproving(true);
      const improvedContent = await improveField(
        fieldName, 
        fieldValue,
        startupContext
      );
      
      // Update the field with the improved content
      onUpdateField(improvedContent);
      
      // Show success message briefly
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error improving content:', err);
      // You could add error handling UI here
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={handleImprove}
        disabled={disabled || !fieldValue || isImproving}
        className={`px-2 py-1 rounded-md text-xs flex items-center 
          ${disabled || !fieldValue 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
      >
        {isImproving ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700 mr-1"></div>
        ) : showSuccess ? (
          <CheckCircleIcon className="h-3 w-3 mr-1 text-green-600" />
        ) : (
          <SparklesIcon className="h-3 w-3 mr-1" />
        )}
        {showSuccess ? 'Improved!' : isImproving ? 'Improving...' : 'Improve with AI'}
      </button>
    </div>
  );
}