import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, FlagIcon } from '@heroicons/react/24/outline';
import { reportsAPI } from '../lib/api';

const reportTypes = [
  { value: 'spam', label: 'Spam', description: 'Unwanted or repetitive content' },
  { value: 'inappropriate', label: 'Inappropriate Content', description: 'Offensive or inappropriate material' },
  { value: 'fake', label: 'Fake Information', description: 'False or misleading information' },
  { value: 'harassment', label: 'Harassment', description: 'Bullying or harassment' },
  { value: 'copyright', label: 'Copyright Violation', description: 'Unauthorized use of copyrighted content' },
  { value: 'other', label: 'Other', description: 'Other reason not listed above' }
];

const ReportModal = ({ 
  isOpen, 
  onClose, 
  targetType, // 'startup', 'comment', 'user'
  targetId,
  targetName 
}) => {
  const [selectedType, setSelectedType] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedType) {
      alert('Please select a report type');
      return;
    }

    setIsSubmitting(true);
    try {
      const reportData = {
        report_type: selectedType,
        reason: reason.trim() || null
      };

      // Set the appropriate target field
      if (targetType === 'startup') {
        reportData.reported_startup_id = targetId;
      } else if (targetType === 'comment') {
        reportData.reported_comment_id = targetId;
      } else if (targetType === 'user') {
        reportData.reported_user_id = targetId;
      }

      await reportsAPI.createReport(reportData);
      
      alert('Report submitted successfully. Our team will review it shortly.');
      onClose();
      
      // Reset form
      setSelectedType('');
      setReason('');
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert(error.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedType('');
      setReason('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <FlagIcon className="h-6 w-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Report {targetType === 'startup' ? 'Startup' : targetType === 'comment' ? 'Comment' : 'User'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  You are reporting: <span className="font-medium">{targetName}</span>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Please select the reason for reporting this content. Our moderation team will review your report.
                </p>
              </div>

              {/* Report Type Selection */}
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Report Reason *
                </label>
                {reportTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedType === type.value
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type.value}
                      checked={selectedType === type.value}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="mt-1 text-red-600 focus:ring-red-500"
                      disabled={isSubmitting}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Additional Details */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Provide any additional context or details..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedType}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
