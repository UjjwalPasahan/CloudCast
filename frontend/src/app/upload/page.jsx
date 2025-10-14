"use client";


import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Upload, X, File, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

const UploadForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const { data: sessionData } = useSession();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!sessionData) {
      router.push("/");
    } else {
      setAuthor(sessionData.user.name);
    }
  }, [sessionData, router]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadComplete(false);
      setError("");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
    setError("");
  };

  const handleUpload = async () => {
    if (!title || !author) {
      setError("Title and Author are required fields.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("filename", selectedFile.name);

      const initializeRes = await axios.post(
        "http://localhost:8080/upload/initialize",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const { uploadId } = initializeRes.data;
      console.log("Upload id is ", uploadId);

      const chunkSize = 5 * 1024 * 1024; // 5 MB chunks
      const totalChunks = Math.ceil(selectedFile.size / chunkSize);

      let start = 0;
      const uploadPromises = [];

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const chunk = selectedFile.slice(start, start + chunkSize);
        start += chunkSize;

        const chunkFormData = new FormData();
        chunkFormData.append("filename", selectedFile.name);
        chunkFormData.append("chunk", chunk);
        chunkFormData.append("totalChunks", totalChunks);
        chunkFormData.append("chunkIndex", chunkIndex);
        chunkFormData.append("uploadId", uploadId);

        const uploadPromise = axios.post(
          "http://localhost:8080/upload",
          chunkFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        ).then(() => {
          const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
          setUploadProgress(progress);
        });

        uploadPromises.push(uploadPromise);
      }

      await Promise.all(uploadPromises);

      const completeRes = await axios.post(
        "http://localhost:8080/upload/complete",
        {
          filename: selectedFile.name,
          totalChunks: totalChunks,
          uploadId: uploadId,
          title: title,
          description: description,
          author: author,
        }
      );

      console.log("Upload complete:", completeRes.data);
      setUploadComplete(true);
      setLoading(false);

      // Reset form after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(error.response?.data?.message || "Upload failed. Please try again.");
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const goBack = () => {
    router.push("/");
  };

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={goBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl">
              <Upload className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Upload Video</h1>
          <p className="text-gray-400">Share your content with the world</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          {uploadComplete ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">Upload Complete!</h3>
              <p className="text-gray-400 mb-4">Your video has been uploaded successfully.</p>
              <p className="text-sm text-gray-500">Redirecting to home...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="flex items-start space-x-3 bg-red-950/50 border border-red-900/50 rounded-lg p-4 backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter an engaging title for your video"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition placeholder-gray-500 backdrop-blur-sm"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell viewers about your video (optional)"
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none placeholder-gray-500 backdrop-blur-sm"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Author
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sessionData?.user.name}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700 text-gray-400 rounded-lg cursor-not-allowed backdrop-blur-sm"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">
                      Verified
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video File <span className="text-red-500">*</span>
                </label>

                {!selectedFile ? (
                  <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-purple-500 transition-all duration-300 bg-gray-800/30 hover:bg-gray-800/50 backdrop-blur-sm group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="p-3 bg-gray-800 rounded-full mb-4 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-500 transition-all duration-300">
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">MP4, AVI, MOV, MKV (MAX. 500MB)</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="video/*"
                      disabled={loading}
                    />
                  </label>
                ) : (
                  <div className="border border-gray-700 bg-gray-800/50 rounded-xl p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <File className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{selectedFile.name}</p>
                          <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                      {!loading && (
                        <button
                          onClick={handleRemoveFile}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors ml-2 flex-shrink-0"
                          disabled={loading}
                        >
                          <X className="w-5 h-5 text-gray-400 hover:text-white" />
                        </button>
                      )}
                    </div>

                    {loading && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading...</span>
                          </span>
                          <span className="font-medium text-purple-400">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-300 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-3 bg-blue-950/30 border border-blue-900/50 rounded-lg p-4 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Processing Information</p>
                  <p className="text-blue-400/80">Your video will be processed after upload. Processing time depends on the file size and may take several minutes.</p>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading || !title || !author || !selectedFile}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/50 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading {uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload Video</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadForm;