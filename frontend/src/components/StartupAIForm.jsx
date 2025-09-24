import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { generateStartupDetails, improveStartupDetails } from '../lib/gemini';
import { startupsAPI } from '../lib/api';

import {
  DocumentTextIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  LightBulbIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function StartupAIForm({ onClose }) {
  const [startupName, setStartupName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedDetails, setGeneratedDetails] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!startupName.trim()) {
      setError('Please enter a startup name');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      const details = await generateStartupDetails(startupName);
      setGeneratedDetails(details);
      
    } catch (err) {
      console.error('Error generating startup details:', err);
      setError('Failed to generate startup details. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprove = async () => {
    if (!generatedDetails) return;

    try {
      setIsGenerating(true);
      setError(null);
      
      const improvedDetails = await improveStartupDetails(generatedDetails);
      setGeneratedDetails(improvedDetails);
      
    } catch (err) {
      console.error('Error improving startup details:', err);
      setError('Failed to improve startup details. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!generatedDetails) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Convert string array to actual array if needed
      let keyInvestors = generatedDetails.key_investors;
      if (typeof keyInvestors === 'string') {
        keyInvestors = keyInvestors.split(',').map(inv => inv.trim());
      }
      
      // Format data for API
      const formattedData = {
        name: startupName,
        description: generatedDetails.description,
        industry: generatedDetails.industry,
        vision: generatedDetails.vision,
        founded_year: parseInt(generatedDetails.founded_year),
        died_year: parseInt(generatedDetails.died_year),
        primary_failure_reason: generatedDetails.primary_failure_reason,
        stage_at_death: generatedDetails.stage_at_death,
        autopsy_report: generatedDetails.autopsy_report,
        funding_amount_usd: parseFloat(generatedDetails.funding_amount_usd.replace(/[^0-9.-]+/g,"")),
        key_investors: keyInvestors,
        peak_metrics: generatedDetails.peak_metrics,
        lessons_learned: generatedDetails.lessons_learned,
        advice_for_founders: generatedDetails.advice_for_founders,
      };
      
      const response = await startupsAPI.createStartup(formattedData);
      
      setSuccessMessage('Startup obituary created successfully!');
      
      // Navigate to the new startup page after 2 seconds
      setTimeout(() => {
        navigate(`/startup/${response.data.id}`);
      }, 2000);
      
    } catch (err) {
      console.error('Error creating startup:', err);
      setError('Failed to create startup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <SparklesIcon className="h-6 w-6 mr-2 text-primary-600" />
          AI-Powered Startup Obituary Generator
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      {successMessage ? (
        <div className="text-center py-8">
          <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
            <CheckIcon className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <p className="text-lg font-medium">{successMessage}</p>
            <p className="text-sm text-green-700 mt-2">Redirecting you to your new startup page...</p>
          </div>
        </div>
      ) : (
        <>
          {!generatedDetails ? (
            <div className="space-y-6">
              <p className="text-gray-600">
                Enter your startup name and our AI will generate a detailed startup obituary for you.
                You'll be able to review and edit the content before publishing.
              </p>
              
              <div className="space-y-2">
                <label htmlFor="startupName" className="block text-sm font-medium text-gray-700">
                  Startup Name *
                </label>
                <input
                  id="startupName"
                  type="text"
                  value={startupName}
                  onChange={(e) => setStartupName(e.target.value)}
                  className="input"
                  placeholder="e.g., NexusPay, TechVista, MetaLearn"
                  disabled={isGenerating}
                />
                <p className="text-xs text-gray-500">
                  Enter the name of your startup to generate a complete obituary
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-primary flex items-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5 mr-2" />
                      Generate Startup Obituary
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Generated Startup Obituary</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleImprove}
                    disabled={isGenerating}
                    className="btn-outline flex items-center text-sm"
                  >
                    {isGenerating ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600 mr-1"></div>
                    ) : (
                      <LightBulbIcon className="h-4 w-4 mr-1" />
                    )}
                    Improve Content
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Name</h4>
                    <p className="text-gray-900">{startupName}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Description</h4>
                    <p className="text-gray-900">{generatedDetails.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Industry</h4>
                      <p className="text-gray-900">{generatedDetails.industry}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Vision</h4>
                      <p className="text-gray-900">"{generatedDetails.vision}"</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Founded - Died</h4>
                      <p className="text-gray-900">{generatedDetails.founded_year} - {generatedDetails.died_year}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Funding</h4>
                      <p className="text-gray-900">{generatedDetails.funding_amount_usd}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Primary Failure Reason</h4>
                      <p className="text-gray-900">{generatedDetails.primary_failure_reason}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Stage at Death</h4>
                      <p className="text-gray-900">{generatedDetails.stage_at_death}</p>
                    </div>
                  </div>
                  
                  {/* More sections can be shown in a collapsible format */}
                  <div className="pt-2">
                    <h4 className="text-sm font-medium text-gray-700">Autopsy Report Preview</h4>
                    <p className="text-gray-900 line-clamp-3">{generatedDetails.autopsy_report}</p>
                    <button className="text-xs text-primary-600 mt-1">Show full report...</button>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setGeneratedDetails(null);
                    setStartupName('');
                  }}
                  className="btn-outline flex items-center"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Generate Again
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish Story
                      <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}