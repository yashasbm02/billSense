import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, X, AlertCircle } from 'lucide-react';
import { BillScanResult } from '../types/bill.types';
import { ocrAPI } from '../services/api';
import { cn } from '../utils';
import toast from 'react-hot-toast';

interface BillScannerProps {
  onScanComplete: (result: BillScanResult) => void;
  onError: (error: string) => void;
}

const BillScanner: React.FC<BillScannerProps> = ({ onScanComplete, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    setIsScanning(true);
    
    try {
      const response = await ocrAPI.scanReceipt(file);
      
      if (response.success) {
        onScanComplete(response.data);
        toast.success('Receipt scanned successfully!');
      } else {
        throw new Error('Scan failed');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      const errorMessage = error.message || 'Failed to scan receipt';
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsScanning(false);
    }
  }, [onScanComplete, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-gray-400",
          isScanning && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {isScanning ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="loading-spinner h-8 w-8"></div>
              <p className="text-sm text-gray-600">Scanning receipt...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-primary-100 p-3">
                  <Camera className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop your receipt here' : 'Upload a receipt'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag and drop or click to select an image file
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                <span>Supports: JPG, PNG, GIF, BMP, TIFF, WebP</span>
                <span>•</span>
                <span>Max size: 10MB</span>
              </div>
            </>
          )}
        </div>
      </div>

      {preview && (
        <div className="relative">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Preview</h3>
              <button
                onClick={clearPreview}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative">
              <img
                src={preview}
                alt="Receipt preview"
                className="max-h-64 w-full object-contain rounded-lg bg-gray-100"
              />
              
              {isScanning && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center">
                    <div className="loading-spinner h-8 w-8 mx-auto mb-2"></div>
                    <p className="text-sm">Processing...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Tips for better scanning:</p>
            <ul className="space-y-1 text-xs">
              <li>• Ensure the receipt is well-lit and clearly visible</li>
              <li>• Avoid shadows and glare on the receipt</li>
              <li>• Make sure all text is readable in the image</li>
              <li>• Keep the receipt flat and straight</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillScanner;
