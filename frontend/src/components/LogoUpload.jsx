import React, { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { startupsAPI } from '../lib/api';

const LogoUpload = ({ startupId, currentLogo, onLogoUpdate, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file || !startupId) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await startupsAPI.uploadLogo(startupId, formData);
      onLogoUpdate(response.data.logo_url);
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert(error.response?.data?.error || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm('Are you sure you want to delete the logo?')) return;

    setUploading(true);
    try {
      await startupsAPI.deleteLogo(startupId);
      onLogoUpdate(null);
    } catch (error) {
      console.error('Failed to delete logo:', error);
      alert(error.response?.data?.error || 'Failed to delete logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Startup Logo
      </label>

      {currentLogo ? (
        <div className="relative inline-block">
          <img
            src={`http://localhost:3000${currentLogo}`}
            alt="Startup logo"
            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleDeleteLogo}
              disabled={uploading}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled || uploading}
          />

          <div className="space-y-2">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            {uploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </div>
        </div>
      )}

      {currentLogo && !disabled && (
        <button
          type="button"
          onClick={openFileDialog}
          disabled={uploading}
          className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
        >
          Change Logo
        </button>
      )}
    </div>
  );
};

export default LogoUpload;
