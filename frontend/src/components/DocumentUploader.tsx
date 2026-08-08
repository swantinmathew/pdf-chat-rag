'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FaCloudUploadAlt,
  FaFileAlt,
  FaFileImage,
  FaFileWord,
  FaSpinner,
  FaTimes,
  FaCheckCircle,
} from 'react-icons/fa';

type UploadStatus = 'uploading' | 'completed' | 'error';

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: string;
  extension: string;
  progress: number;
  status: UploadStatus;
  chunksCount?: number;
  insertedCount?: number;
  errorMessage?: string;
}

export interface DocumentUploaderProps {
  title?: string;
  acceptedFormats?: string[];
  maxFileSizeMb?: number;
  onUploadComplete?: (files: File[]) => void;
}

const defaultAcceptedFormats = ['pdf', 'docx', 'jpg', 'png', 'svg'];

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} gb`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} mb`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} kb`;
}

function getExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function getFileIcon(extension: string) {
  if (['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'].includes(extension)) {
    return <FaFileImage className="text-slate-400 h-6 w-6" />;
  }
  if (['doc', 'docx'].includes(extension)) {
    return <FaFileWord className="text-slate-400 h-6 w-6" />;
  }
  return <FaFileAlt className="text-white h-6 w-6" />;
}

export default function DocumentUploader({
  title = 'Upload Files',
  acceptedFormats = defaultAcceptedFormats,
  maxFileSizeMb = 25,
  onUploadComplete,
}: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const accept = acceptedFormats.map((format) => `.${format}`).join(',');
  const hasUploadingFiles = files.some((file) => file.status === 'uploading');

  const uploadFileToBackend = async (fileObj: UploadFile) => {
    const formData = new FormData();
    formData.append('file', fileObj.file);

    try {
      // Stream simulated progress up to 90% while waiting for backend
      const interval = setInterval(() => {
        setFiles((current) =>
          current.map((f) =>
            f.id === fileObj.id && f.status === 'uploading'
              ? { ...f, progress: Math.min(f.progress + 15, 90) }
              : f
          )
        );
      }, 200);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/ingest`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ingestion failed');
      }

      setFiles((current) =>
        current.map((f) =>
          f.id === fileObj.id
            ? {
                ...f,
                progress: 100,
                status: 'completed',
                chunksCount: data.chunks_count,
                insertedCount: data.inserted_records_count,
              }
            : f
        )
      );
    } catch (err: any) {
      setFiles((current) =>
        current.map((f) =>
          f.id === fileObj.id
            ? {
                ...f,
                progress: 100,
                status: 'error',
                errorMessage: err.message || 'Upload failed',
              }
            : f
        )
      );
    }
  };

  const addFiles = (selectedFiles: FileList | File[]) => {
    const maxBytes = maxFileSizeMb * 1024 * 1024;
    const acceptedSet = new Set(
      acceptedFormats.map((format) => format.toLowerCase())
    );

    const newUploadFiles: UploadFile[] = Array.from(selectedFiles).map((file) => {
      const extension = getExtension(file.name);
      const isAccepted = !acceptedSet.size || acceptedSet.has(extension);
      const isTooLarge = file.size > maxBytes;
      const status: UploadStatus = isAccepted && !isTooLarge ? 'uploading' : 'error';

      const uploadObj: UploadFile = {
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        extension,
        progress: status === 'uploading' ? 10 : 100,
        status,
        errorMessage: !isAccepted
          ? 'Format not allowed'
          : isTooLarge
          ? 'File size exceeds limit'
          : undefined,
      };

      if (status === 'uploading') {
        uploadFileToBackend(uploadObj);
      }

      return uploadObj;
    });

    setFiles((currentFiles) => [...currentFiles, ...newUploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((currentFiles) => currentFiles.filter((file) => file.id !== id));
  };

  return (
    <div className="w-full bg-[#0d0b0f] border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between pb-4 border-b border-white/10">
        <h2 className="text-xl font-light text-white tracking-tight">{title}</h2>
        <span className="text-xs font-mono text-slate-400">FastAPI + LangGraph Ingestion</span>
      </div>

      <div className="grid gap-6 sm:grid-cols-[1.1fr_1fr]">
        {/* Left Upload Dropzone */}
        <div className="space-y-3">
          <div
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              addFiles(event.dataTransfer.files);
            }}
            className={`cursor-pointer bg-white/5 border border-dashed rounded-xl p-8 flex aspect-[1.15] w-full flex-col items-center justify-center text-center transition-all ${
              isDragging
                ? 'border-white bg-white/10 scale-[1.01]'
                : 'border-white/20 hover:border-white/50 hover:bg-white/10'
            }`}
          >
            <FaCloudUploadAlt className="text-slate-400 mb-4 h-12 w-12" />
            <span className="text-white text-base font-normal">
              Drag files to upload
            </span>
            <span className="text-slate-500 my-3 flex items-center gap-3 text-xs italic">
              or select a file
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                inputRef.current?.click();
              }}
              className="px-6 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-slate-200 transition-all shadow-md"
            >
              Choose File
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept}
            className="hidden"
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = '';
            }}
          />

          <div className="text-slate-500 text-[11px] leading-relaxed font-mono">
            <p>Acceptable formats: {acceptedFormats.join(', ')}</p>
            <p>Max file size is {maxFileSizeMb}MB</p>
          </div>
        </div>

        {/* Right Files Progress & Results List */}
        <div className="min-w-0 flex flex-col justify-between">
          <div>
            <div className="text-white mb-3 flex items-center justify-between text-sm font-medium border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                {hasUploadingFiles ? (
                  <FaSpinner className="text-indigo-400 h-3.5 w-3.5 animate-spin" />
                ) : null}
                <span>{hasUploadingFiles ? 'Uploading & Vectorizing...' : 'Uploaded Files'}</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">{files.length} items</span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {files.length ? (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getFileIcon(file.extension)}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate max-w-[180px]">
                            {file.name}
                          </p>
                          <span className="text-slate-500 text-[10px] font-mono">
                            {file.size}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        aria-label={`Remove ${file.name}`}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          file.status === 'completed'
                            ? 'bg-emerald-400'
                            : file.status === 'error'
                            ? 'bg-red-500'
                            : 'bg-white'
                        }`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>

                    {/* Status Metadata */}
                    {file.status === 'completed' && (
                      <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 pt-0.5">
                        <FaCheckCircle className="w-3 h-3" />
                        <span>Vectorized: {file.chunksCount} chunks ({file.insertedCount} rows)</span>
                      </div>
                    )}
                    {file.status === 'error' && (
                      <div className="text-[10px] text-red-400 font-mono">
                        ❌ {file.errorMessage || 'Ingestion failed'}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white/5 flex h-48 flex-col items-center justify-center border border-dashed border-white/10 rounded-xl text-center">
                  <p className="text-white text-sm font-medium">No files selected</p>
                  <p className="text-slate-500 mt-1 text-xs font-mono">
                    Uploaded PDF chunks will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div >
    </div >
  );
}
