'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocuments } from '../../hooks/useDocuments';
import { useSharedDocuments } from '../../hooks/useSharedDocuments';
import { useCreateDocument } from '../../hooks/useCreateDocument';
import { useUpload } from '../../hooks/useUpload';
import { useToast } from '../ui/Toast';
import { SidebarSection } from './SidebarSection';
import { DocumentListItem } from './DocumentListItem';
import { Button } from '../ui/Button';
import { Plus, Upload } from 'lucide-react';
import { Spinner } from '../ui/Spinner';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const { data: ownedDocs, isLoading: loadingOwned } = useDocuments();
  const { data: sharedDocs, isLoading: loadingShared } = useSharedDocuments();

  const { mutate: createDoc, isPending: creatingDoc } = useCreateDocument();
  const { mutate: uploadFile, isPending: uploadingFile } = useUpload();

  const handleCreate = () => {
    createDoc(undefined, {
      onSuccess: (newDoc) => {
        showToast('Document created successfully!', 'success');
        router.push(`/documents/${newDoc.id}`);
        onClose?.();
      },
      onError: (err: any) => {
        const errMsg = err.response?.data?.error?.message || 'Failed to create document';
        showToast(errMsg, 'error');
      }
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      showToast('File is too large. Max size is 2MB.', 'error');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'txt' && ext !== 'md') {
      showToast('Invalid file type. Only .txt and .md files are supported.', 'error');
      return;
    }

    uploadFile(file, {
      onSuccess: (newDoc) => {
        showToast('File imported successfully!', 'success');
        router.push(`/documents/${newDoc.id}`);
        onClose?.();
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      onError: (err: any) => {
        const errMsg = err.response?.data?.error?.message || 'Failed to import file';
        showToast(errMsg, 'error');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-full bg-white relative select-none"
    >
      {/* Top Actions */}
      <div className="flex flex-col gap-2.5 p-4 border-b border-gray-150">
        <Button
          onClick={handleCreate}
          isLoading={creatingDoc}
          className="w-full flex items-center justify-center gap-1.5 shadow-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          New Document
        </Button>
        
        <Button
          variant="secondary"
          onClick={handleImportClick}
          isLoading={uploadingFile}
          className="w-full flex items-center justify-center gap-1.5 font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
        >
          <Upload className="h-4 w-4" />
          Import File
        </Button>
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt,.md"
          className="hidden"
        />
        <span className="text-[10px] text-gray-400 text-center block">
          Supports .txt and .md &middot; Max 2MB
        </span>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
        {/* Section 1: My Documents */}
        <SidebarSection title="My Documents" count={ownedDocs?.length}>
          {loadingOwned ? (
            <div className="py-4 flex justify-center"><Spinner size="sm" /></div>
          ) : ownedDocs && ownedDocs.length > 0 ? (
            ownedDocs.map((doc) => (
              <DocumentListItem key={doc.id} document={doc} onClick={onClose} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4 bg-gray-50/50 rounded-xl border border-gray-100 mx-2">
              <svg className="w-16 h-16 text-gray-350 mb-3" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="14" y="8" width="36" height="48" rx="4" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 20H42" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
                <path d="M22 28H42" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
                <path d="M22 36H34" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
                <circle cx="44" cy="44" r="8" className="fill-blue-50 stroke-blue-500" strokeWidth="2" />
                <path d="M44 41V47" className="stroke-blue-500" strokeWidth="2" strokeLinecap="round" />
                <path d="M41 44H47" className="stroke-blue-500" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-bold text-gray-700">No documents yet</span>
              <p className="text-[10px] text-gray-400 mt-1 mb-3 max-w-[160px]">Create or drag & drop a file here to get started</p>
              <button
                onClick={handleCreate}
                disabled={creatingDoc}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all duration-150"
              >
                Create Document
              </button>
            </div>
          )}
        </SidebarSection>

        {/* Visual Divider */}
        <div className="h-px bg-gray-150 mx-4" />

        {/* Section 2: Shared With Me */}
        <SidebarSection title="Shared With Me" count={sharedDocs?.length}>
          {loadingShared ? (
            <div className="py-4 flex justify-center"><Spinner size="sm" /></div>
          ) : sharedDocs && sharedDocs.length > 0 ? (
            sharedDocs.map((doc) => (
              <DocumentListItem key={doc.id} document={doc} isShared onClick={onClose} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4 bg-gray-50/50 rounded-xl border border-gray-100 mx-2">
              <svg className="w-16 h-16 text-gray-350 mb-3" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="16" width="44" height="32" rx="4" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 20L32 34L54 20" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="48" cy="16" r="6" className="fill-emerald-50 stroke-emerald-500" strokeWidth="2" />
              </svg>
              <span className="text-xs font-bold text-gray-700">Nothing shared</span>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[160px]">Documents shared by others will automatically appear here</p>
            </div>
          )}
        </SidebarSection>
      </div>

      {/* Drag Overlay indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-50/90 border-2 border-dashed border-blue-500 rounded-lg m-2 flex flex-col items-center justify-center z-50 pointer-events-none animate-in fade-in duration-150">
          <Upload className="h-8 w-8 text-blue-600 mb-2 animate-bounce" />
          <span className="text-sm font-semibold text-blue-800">Drop to Import Document</span>
          <span className="text-[10px] text-blue-500">Supports .txt & .md (Max 2MB)</span>
        </div>
      )}
    </div>
  );
}
