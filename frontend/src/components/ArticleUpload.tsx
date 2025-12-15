import { useState, useRef, DragEvent } from 'react';
import { useArticles } from '@/hooks/useArticles';

type UploadMode = 'file' | 'url';

export default function ArticleUpload() {
  const { uploadPDF, uploadByURL, isUploading } = useArticles();
  const [mode, setMode] = useState<UploadMode>('file');
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are allowed';
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 50MB';
    }

    return null;
  };

  const validateURL = (urlString: string): string | null => {
    if (!urlString.trim()) {
      return 'URL is required';
    }

    try {
      const url = new URL(urlString);
      if (!url.protocol.startsWith('http')) {
        return 'URL must start with http:// or https://';
      }
    } catch {
      return 'Invalid URL format';
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    resetState();

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Simulate progress
      setUploadProgress(10);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      uploadPDF(file, {
        onSuccess: () => {
          clearInterval(progressInterval);
          setUploadProgress(100);
          setSuccess(`Successfully uploaded: ${file.name}`);
          setTimeout(() => {
            setSuccess(null);
            setUploadProgress(0);
          }, 3000);
        },
        onError: (err: Error) => {
          clearInterval(progressInterval);
          setUploadProgress(0);
          setError(err.message || 'Failed to upload file');
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const handleURLUpload = async () => {
    resetState();

    const validationError = validateURL(url);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploadProgress(10);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      uploadByURL(url, {
        onSuccess: () => {
          clearInterval(progressInterval);
          setUploadProgress(100);
          setSuccess(`Successfully uploaded from URL`);
          setUrl('');
          setTimeout(() => {
            setSuccess(null);
            setUploadProgress(0);
          }, 3000);
        },
        onError: (err: Error) => {
          clearInterval(progressInterval);
          setUploadProgress(0);
          setError(err.message || 'Failed to upload from URL');
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Article</h2>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('file')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'file'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upload PDF
        </button>
        <button
          onClick={() => setMode('url')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'url'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          From URL
        </button>
      </div>

      {/* File Upload Mode */}
      {mode === 'file' && (
        <div>
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragging ? 'Drop your PDF here' : 'Drag and drop your PDF here'}
            </p>
            <p className="text-sm text-gray-600 mb-4">or</p>
            <button
              onClick={handleBrowseClick}
              disabled={isUploading}
              className="btn btn-primary"
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-500 mt-4">
              PDF files only, max 50MB
            </p>
          </div>
        </div>
      )}

      {/* URL Upload Mode */}
      {mode === 'url' && (
        <div>
          <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
            Article URL
          </label>
          <div className="flex gap-2">
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article.pdf"
              disabled={isUploading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isUploading) {
                  handleURLUpload();
                }
              }}
            />
            <button
              onClick={handleURLUpload}
              disabled={isUploading || !url.trim()}
              className="btn btn-primary"
            >
              Upload
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter a direct link to a PDF file
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-600 mt-0.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800">Success!</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
