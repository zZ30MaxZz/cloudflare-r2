"use client"

import { uploadFile } from "@/helpers/uploadFile";
import { useState } from "react";

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>();
  const [fileName, setFileName] = useState(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      setUploadStatus('File size exceeds 5MB limit');
      return;
    }

    setCurrentFileName(file.name);
    setIsUploading(true);
    setUploadStatus('Uploading...');
    setFileName(null)

    try {
      const response = await uploadFile(file);
      console.log('Upload response:', response);

      setUploadStatus(response.success ? 'Upload successful!' : 'Upload failed');
      setFileName(response.fileName)

    } catch (error) {
      console.error('Error in upload process:', error);
      setUploadStatus('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">File Upload</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select a file to upload
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
        />
      </div>

      {uploadStatus && (
        <div className={`mt-4 p-2 rounded ${uploadStatus === 'Upload successful!'
          ? 'bg-green-100 text-green-700'
          : uploadStatus === 'Uploading...'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-red-100 text-red-700'
          }`}>
          {uploadStatus}
          <div>
            {fileName &&
              <a href={`your_public_domain/${fileName}`} target="_blank">{currentFileName}</a>
            }
          </div>
        </div>
      )}
    </div>
  );
}