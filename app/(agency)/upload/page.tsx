'use client';

import { useState, useRef, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdType } from '@prisma/client';
import { getAdTypeName } from '@/lib/utils';

export default function UploadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [adType, setAdType] = useState<AdType>(AdType.SOCIAL_MEDIA);
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Check session and fetch clients
  useEffect(() => {
    if (session && session.user?.role !== 'AGENCY') {
      router.push('/');
      return;
    }

    // Fetch clients
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        setClients(data);
        if (data.length > 0) {
          setClientId(data[0].id);
        }
      })
      .catch((err) => {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients');
      });
  }, [session, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    if (!clientId) {
      setError('Please select a client');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('clientId', clientId);
      formData.append('adType', adType);
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(`Successfully uploaded ${data.count} creative${data.count === 1 ? '' : 's'}`);
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Ad Creatives</h1>
          <p className="mt-2 text-gray-600">Upload your ad creatives for client review and approval</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-xl">Add New Creatives</CardTitle>
            <CardDescription className="text-blue-100">
              Upload images or videos to be reviewed by the client
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Client</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a client
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ad Type selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Ad Type</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {Object.values(AdType).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`py-3 px-4 rounded-lg shadow-sm border ${
                        adType === type 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      } transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      onClick={() => setAdType(type)}
                    >
                      {getAdTypeName(type)}
                    </button>
                  ))}
                </div>
              </div>

              {/* File upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Creatives</label>
                <div 
                  className={`mt-1 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ease-in-out ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                  <div className="space-y-3">
                    <svg
                      className="mx-auto h-14 w-14 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="text-gray-600">
                      <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                    </div>
                    <p className="text-sm text-gray-500">
                      Images or videos up to 10MB
                    </p>
                  </div>
                </div>

                {/* Selected files preview */}
                {files.length > 0 && (
                  <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700">Selected files ({files.length})</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {files.map((file, index) => (
                        <li key={index} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                              {file.type.startsWith('image/') ? (
                                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              ) : (
                                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="ml-3 overflow-hidden">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="ml-4 flex-shrink-0 text-red-500 hover:text-red-700 focus:outline-none"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Error/success messages */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{success}</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="bg-gray-50 px-6 py-4 border-t border-gray-100 rounded-b-lg">
            <Button 
              onClick={handleSubmit} 
              disabled={isUploading || files.length === 0}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-lg shadow-md transition-all duration-200 ease-in-out"
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              ) : (
                'Upload Creatives'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 