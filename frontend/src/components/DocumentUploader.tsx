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
  FaTrash,
  FaDatabase,
  FaExclamationTriangle,
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

interface StoredDocument {
  filename: string;
  chunks_count: number;
}

interface DeleteModalState {
  isOpen: boolean;
  type: 'single' | 'all';
  filename?: string;
  chunksCount?: number;
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

  const [storedDocs, setStoredDocs] = useState<StoredDocument[]>([]);
  const [loadingStored, setLoadingStored] = useState<boolean>(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: 'single',
  });

  const accept = acceptedFormats.map((format) => `.${format}`).join(',');
  const hasUploadingFiles = files.some((file) => file.status === 'uploading');

  const fetchStoredDocuments = async () => {
    setLoadingStored(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/documents`);
      if (res.ok) {
        const data = await res.json();
        setStoredDocs(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to fetch stored documents:", err);
    } finally {
      setLoadingStored(false);
    }
  };

  useEffect(() => {
    fetchStoredDocuments();
  }, []);

  const openDeleteSingleModal = (filename: string, chunksCount?: number) => {
    setDeleteModal({
      isOpen: true,
      type: 'single',
      filename,
      chunksCount,
    });
  };

  const openClearAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: 'all',
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: 'single' });
  };

  const confirmDeleteAction = async () => {
    if (deleteModal.type === 'single' && deleteModal.filename) {
      const filename = deleteModal.filename;
      setDeletingFile(filename);
      closeDeleteModal();
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/documents/${encodeURIComponent(filename)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          await fetchStoredDocuments();
        }
      } catch (err) {
        console.error("Failed to delete document:", err);
      } finally {
        setDeletingFile(null);
      }
    } else if (deleteModal.type === 'all') {
      setLoadingStored(true);
      closeDeleteModal();
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/documents`, {
          method: 'DELETE',
        });
        if (res.ok) {
          await fetchStoredDocuments();
        }
      } catch (err) {
        console.error("Failed to clear memory:", err);
      } finally {
        setLoadingStored(false);
      }
    }
  };

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

      // Refresh stored vector documents list upon upload completion
      fetchStoredDocuments();
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
    <div className="w-full bg-[#0d0b0f] border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative">
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
      </div>

      {/* Active Vector Memory Management Section */}
      <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaDatabase className="text-emerald-400 h-4 w-4" />
            <h3 className="text-sm font-semibold text-white">Active Vector Memory (Supabase)</h3>
            <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
              {storedDocs.length} PDF{storedDocs.length !== 1 ? 's' : ''} stored
            </span>
          </div>
          {storedDocs.length > 0 && (
            <button
              type="button"
              onClick={openClearAllModal}
              disabled={loadingStored}
              className="text-xs text-red-400 hover:text-red-300 font-mono flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              <FaTrash className="h-3 w-3" />
              <span>Clear All Memory</span>
            </button>
          )}
        </div>

        {storedDocs.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {storedDocs.map((doc) => (
              <div
                key={doc.filename}
                className="p-3.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between gap-3 group hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-white/5 text-emerald-400 shrink-0">
                    <FaFileAlt className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate max-w-[200px]" title={doc.filename}>
                      {doc.filename}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {doc.chunks_count} vector chunk{doc.chunks_count !== 1 ? 's' : ''} stored
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openDeleteSingleModal(doc.filename, doc.chunks_count)}
                  disabled={deletingFile === doc.filename}
                  title={`Delete ${doc.filename} from memory`}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 disabled:opacity-50"
                >
                  {deletingFile === doc.filename ? (
                    <FaSpinner className="h-3.5 w-3.5 animate-spin text-red-400" />
                  ) : (
                    <FaTrash className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center text-xs text-slate-400 font-mono">
            {loadingStored ? 'Loading vector memory status...' : 'No PDF documents currently stored in vector memory.'}
          </div>
        )}
      </div>

      {/* Custom Styled Deletion Warning Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#14121a] border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                <FaExclamationTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white tracking-tight">
                  {deleteModal.type === 'all'
                    ? 'Clear All Vector Memory?'
                    : 'Remove Document from Memory?'}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Supabase pgvector deletion warning
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-light">
              {deleteModal.type === 'all' ? (
                <>
                  Are you sure you want to delete <strong className="text-white font-semibold">ALL stored document embeddings</strong>? This action cannot be undone, and the AI chat will lose all document context.
                </>
              ) : (
                <>
                  Are you sure you want to delete <strong className="text-white font-semibold font-mono">{deleteModal.filename}</strong>? All associated vector chunks will be permanently removed from Supabase memory.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
              >
                <FaTrash className="h-3 w-3" />
                <span>{deleteModal.type === 'all' ? 'Yes, Clear All' : 'Yes, Delete PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


