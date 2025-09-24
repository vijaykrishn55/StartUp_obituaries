import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { generateContent } from '../lib/gemini';
import { startupsAPI } from '../lib/api';
import LoadingSpinner from './LoadingSpinner';

import {
  DocumentTextIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  SearchIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function StartupNameSearch({ onClose }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [generatedDetails, setGeneratedDetails] = useState(null);
  const [step, setStep] = useState(1);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query || query.length < 2) {
      setError("Please enter at least 2 characters for search");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Simulate API search
      // In a real app, you would call an actual API endpoint
      const simulatedResults = await simulateStartupSearch(query);
      setSearchResults(simulatedResults);
    } catch (err) {
      setError("Failed to search for startups. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const simulateStartupSearch = async (searchQuery) => {
    // This is a simulation of a search API call
    // In a real app, replace with an actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate some fake results based on the search query
        const results = [
          {
            id: 'sim1',
            name: `${searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)}Tech`,
            description: `A tech startup that focused on ${searchQuery}-related solutions.`,
            industry: 'Technology'
          },
          {
            id: 'sim2',
            name: `${searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)} Solutions`,
            description: `Business solutions provider in the ${searchQuery} space.`,
            industry: 'B2B Software'
          },
          {
            id: 'sim3',
            name: `${searchQuery}Now`,
            description: `On-demand services for ${searchQuery} needs.`,
            industry: 'Consumer Services'
          }
        ];
        resolve(results);
      }, 800);
    });
  };

  const handleSelectStartup = (startup) => {
    setSelectedStartup(startup);
    setStep(2);
  };

  const handleGenerateContent = async () => {
    if (!selectedStartup) return;

    try {
      setIsGenerating(true);
      setError(null);
      
      const prompt = `
        You are an expert business analyst specializing in startup failure analysis. 
        I want you to generate comprehensive details about a fictional failed startup named "${selectedStartup.name}".
        
        Here's what I know about the startup:
        - Name: ${selectedStartup.name}
        - Description: ${selectedStartup.description || 'Not provided'}
        - Industry: ${selectedStartup.industry || 'Technology'}
        
        Create a detailed and realistic failure story including:
        
        1. Brief description (2-3 sentences, use what's provided as inspiration)
        2. Industry (use what's provided or specify further)
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
      
      const parsedDetails = JSON.parse(jsonStr);
      setGeneratedDetails(parsedDetails);
      setStep(3);
      
    } catch (err) {
      console.error('Error generating startup details:', err);
      setError('Failed to generate startup details. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStartup || !generatedDetails) return;

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
        name: selectedStartup.name,
        description: generatedDetails.description,
        industry: generatedDetails.industry,
        vision: generatedDetails.vision,
        founded_year: parseInt(generatedDetails.founded_year),
        died_year: parseInt(generatedDetails.died_year),
        primary_failure_reason: generatedDetails.primary_failure_reason,
        stage_at_death: generatedDetails.stage_at_death,
        autopsy_report: generatedDetails.autopsy_report,
        funding_amount_usd: parseFloat(generatedDetails.funding_amount_usd.toString().replace(/[^0-9.-]+/g,"")),
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

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setSelectedStartup(null);
      setStep(1);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <p className="text-gray-600">
              Search for an existing startup by name to generate a detailed failure story.
              We'll find real startup information and create a compelling obituary.
            </p>
            
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input pl-10"
                placeholder="Enter startup name..."
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || query.length < 2}
                className="absolute inset-y-0 right-0 flex items-center px-3 bg-primary-600 text-white rounded-r-md"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">Search Results</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {searchResults.map((startup) => (
                    <div
                      key={startup.id}
                      onClick={() => handleSelectStartup(startup)}
                      className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    >
                      <h4 className="font-medium text-gray-900">{startup.name}</h4>
                      <p className="text-sm text-gray-600">{startup.industry}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">{startup.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selected Startup</h3>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">{selectedStartup.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedStartup.industry}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedStartup.description}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2" />
                What happens next?
              </h3>
              <p className="text-sm text-blue-700">
                Our AI will generate a detailed and realistic failure story for {selectedStartup.name}.
                This will include a comprehensive analysis of what went wrong, lessons learned, and advice for other founders.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="btn-outline flex items-center"
              >
                Back
              </button>
              
              <button
                onClick={handleGenerateContent}
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
                    Generate Failure Story
                  </>
                )}
              </button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generated Failure Story</h3>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Name</h4>
                    <p className="text-gray-900">{selectedStartup.name}</p>
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
                  
                  <div className="pt-2">
                    <h4 className="text-sm font-medium text-gray-700">Autopsy Report Preview</h4>
                    <p className="text-gray-900 line-clamp-3">{generatedDetails.autopsy_report}</p>
                    <button className="text-xs text-primary-600 mt-1">Show full report...</button>
                  </div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="btn-outline flex items-center"
              >
                Back
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
        );
        
      default:
        return null;
    }
  };

  if (successMessage) {
    return (
      <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
            <CheckIcon className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <p className="text-lg font-medium">{successMessage}</p>
            <p className="text-sm text-green-700 mt-2">Redirecting you to your new startup page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <SparklesIcon className="h-6 w-6 mr-2 text-primary-600" />
          Create from Existing Startup
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center">
          <div className="flex items-center relative">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-primary-600' : 'bg-gray-200'} text-white`}>
              1
            </div>
            <div className={`absolute top-0 h-10 w-20 left-10 flex items-center ${step > 1 ? '' : 'opacity-30'}`}>
              <div className="h-1 bg-gray-300 w-full"></div>
            </div>
          </div>
          
          <div className="flex items-center relative">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'} text-white`}>
              2
            </div>
            <div className={`absolute top-0 h-10 w-20 left-10 flex items-center ${step > 2 ? '' : 'opacity-30'}`}>
              <div className="h-1 bg-gray-300 w-full"></div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'} text-white`}>
              3
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-600">Search</span>
          <span className="text-gray-600">Generate</span>
          <span className="text-gray-600">Review</span>
        </div>
      </div>
      
      {renderStep()}
    </div>
  );
}