'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDocument } from '../../hooks/useDocument';
import { useUpdateDocument } from '../../hooks/useUpdateDocument';
import { useUser } from '../../context/UserContext';
import { TipTapEditor } from './TipTapEditor';
import { ShareModal } from '../sharing/ShareModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';
import { useToast } from '../ui/Toast';
import { debounce } from '../../utils/debounce';
import { exportTipTapToMarkdown } from '../../utils/exportMarkdown';
import { Share2, Save, ArrowLeft, ShieldAlert, Check, Download } from 'lucide-react';
import Link from 'next/link';

export function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params?.id as string;
  const { showToast } = useToast();
  const { currentUser } = useUser();

  const { data: document, isLoading: loadingDoc, error: docError } = useDocument(docId);
  const { mutate: updateDoc, isPending: updatingDoc } = useUpdateDocument();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  // State machine: 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'
  const [savingStatus, setSavingStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [relativeSaveMessage, setRelativeSaveMessage] = useState('Saved just now');

  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);

  const clearSaveTimers = () => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
  };

  const role = document?.role;
  const isEditable = role === 'owner' || role === 'editor';

  // Initialize local states when document loads
  useEffect(() => {
    if (document) {
      const isNew = !document.content_json && (document.title === 'Untitled Document' || !document.title);
      if (isNew) {
        setTitle('');
      } else {
        setTitle(document.title || '');
      }
      setContent(document.content_json || '');
      setSavingStatus('idle');
      setLastSavedTime(new Date(document.updated_at));
      clearSaveTimers();
      retryCountRef.current = 0;

      // Track last document ID in localStorage
      try {
        localStorage.setItem('docflow_last_document_id', document.id);
      } catch (e) {
        console.error('LocalStorage write error:', e);
      }

      // Focus title if new and editable
      if (isNew && isEditable) {
        setTimeout(() => {
          titleInputRef.current?.focus();
        }, 100);
      }
    }
  }, [document, isEditable]);

  // Periodic relative save time updater
  useEffect(() => {
    if (!lastSavedTime) return;

    const updateMessage = () => {
      const diffMs = new Date().getTime() - lastSavedTime.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);

      if (diffSec < 10) {
        setRelativeSaveMessage('Saved just now');
      } else if (diffSec < 60) {
        setRelativeSaveMessage(`Saved ${diffSec}s ago`);
      } else {
        setRelativeSaveMessage(`Saved ${diffMin}m ago`);
      }
    };

    updateMessage();
    const interval = setInterval(updateMessage, 10000);
    return () => clearInterval(interval);
  }, [lastSavedTime]);

  // Debounced autosave ref
  const debouncedSave = useRef(
    debounce((id: string, currentTitle: string, currentContent: string) => {
      const targetTitle = currentTitle.trim() || 'Untitled Document';
      
      // Abort previous autosave request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setSavingStatus('saving');
      updateDoc(
        { id, updates: { title: targetTitle, content_json: currentContent }, signal: controller.signal },
        {
          onSuccess: () => {
            if (controller.signal.aborted) return;
            clearSaveTimers();
            retryCountRef.current = 0;
            setLastSavedTime(new Date());
            setSavingStatus('saved');
            fadeTimerRef.current = setTimeout(() => {
              setSavingStatus('idle');
            }, 3000);
          },
          onError: (err: any) => {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || err.message === 'canceled') {
              return;
            }
            if (controller.signal.aborted) return;

            // Retry logic on 500 error
            const is500 = err.response?.status === 500;
            if (is500 && retryCountRef.current < 3) {
              retryCountRef.current++;
              setSavingStatus('saving');
              showToast(`Save failed (500). Retrying... (Attempt ${retryCountRef.current}/3)`, 'error');
              retryTimerRef.current = setTimeout(() => {
                debouncedSave(id, currentTitle, currentContent);
              }, 3000);
              return;
            }

            setSavingStatus('error');
            const errMsg = err.response?.data?.error?.message || 'Autosave failed';
            showToast(errMsg, 'error');
          }
        }
      );
    }, 2000)
  ).current;

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
      clearSaveTimers();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSave]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    if (isEditable && document) {
      retryCountRef.current = 0;
      clearSaveTimers();
      setSavingStatus('unsaved');
      debouncedSave(document.id, newTitle, content);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    if (isEditable && document) {
      retryCountRef.current = 0;
      clearSaveTimers();
      setSavingStatus('unsaved');
      debouncedSave(document.id, title, newContent);
    }
  };

  const handleManualSave = () => {
    if (!document) return;
    const targetTitle = title.trim() || 'Untitled Document';

    debouncedSave.cancel();
    clearSaveTimers();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSavingStatus('saving');
    updateDoc(
      { id: document.id, updates: { title: targetTitle, content_json: content }, signal: controller.signal },
      {
        onSuccess: () => {
          if (controller.signal.aborted) return;
          retryCountRef.current = 0;
          setLastSavedTime(new Date());
          setSavingStatus('saved');
          showToast('Document saved successfully!', 'success');
          fadeTimerRef.current = setTimeout(() => {
            setSavingStatus('idle');
          }, 3000);
        },
        onError: (err: any) => {
          if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || err.message === 'canceled') {
            return;
          }
          if (controller.signal.aborted) return;

          // Retry logic on 500 error
          const is500 = err.response?.status === 500;
          if (is500 && retryCountRef.current < 3) {
            retryCountRef.current++;
            setSavingStatus('saving');
            showToast(`Save failed (500). Retrying... (Attempt ${retryCountRef.current}/3)`, 'error');
            retryTimerRef.current = setTimeout(() => {
              handleManualSave();
            }, 3000);
            return;
          }

          setSavingStatus('error');
          const errMsg = err.response?.data?.error?.message || 'Failed to save document';
          showToast(errMsg, 'error');
        }
      }
    );
  };

  const handleManualSaveRef = useRef(handleManualSave);
  useEffect(() => {
    handleManualSaveRef.current = handleManualSave;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (isEditable) {
          handleManualSaveRef.current();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditable]);

  const handleExportMarkdown = () => {
    if (!document) return;
    try {
      const markdown = exportTipTapToMarkdown(content);
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      
      const cleanTitle = title.trim() ? title.trim().replace(/\s+/g, '_') : 'Untitled_Document';
      link.setAttribute('download', `${cleanTitle}.md`);
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Document exported to Markdown!', 'success');
    } catch (err: any) {
      showToast('Export failed', 'error');
    }
  };

  const handleEditorCreated = (editor: any) => {
    editorRef.current = editor;
  };

  if (loadingDoc) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (docError || !document) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Document Unavailable</h3>
        <p className="text-gray-500 max-w-sm mt-2">
          {docError ? 'You do not have permission to view this document or it does not exist.' : 'The requested document could not be loaded.'}
        </p>
        <Link href="/documents" className="mt-6">
          <Button variant="secondary" className="flex items-center gap-1.5 font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-12 py-4 border-b border-gray-150 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          {isEditable ? (
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled Document"
              className="text-3xl font-extrabold text-gray-900 border-b-2 border-transparent hover:border-gray-250 focus:border-blue-400 focus:outline-none px-1 py-0.5 w-full max-w-md truncate bg-transparent"
            />
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <h2 className="text-3xl font-extrabold text-gray-900 truncate max-w-md">
                {title || 'Untitled Document'}
              </h2>
              {role === 'viewer' && (
                <Badge variant="gray" className="shrink-0 flex items-center gap-1">
                  Read Only
                </Badge>
              )}
            </div>
          )}
          
          {/* Fixed-width autosave status indicator state machine container */}
          <div className="w-[160px] h-8 flex items-center shrink-0 select-none text-xs font-semibold ml-4">
            {savingStatus === 'unsaved' && (
              <div className="flex items-center gap-1.5 text-amber-600 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500 block shrink-0" />
                <span>Unsaved changes</span>
              </div>
            )}
            {savingStatus === 'saving' && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <svg className="animate-spin h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving…</span>
              </div>
            )}
            {savingStatus === 'saved' && (
              <div className="flex items-center gap-1.5 text-emerald-600">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>Saved just now</span>
              </div>
            )}
            {savingStatus === 'idle' && lastSavedTime && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-gray-300 block shrink-0" />
                <span>{relativeSaveMessage}</span>
              </div>
            )}
            {savingStatus === 'error' && (
              <div className="flex items-center gap-1.5 text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500 block shrink-0" />
                <span>Save failed</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {role === 'owner' && (
            <Button
              variant="secondary"
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1.5 font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}

          {/* Export is enabled for owners and editors, and viewers at all times */}
          {(role === 'owner' || role === 'editor' || role === 'viewer') && (
            <Button
              variant="secondary"
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
            >
              <Download className="h-4 w-4" />
              Export Markdown
            </Button>
          )}
          
          {isEditable && (
            <Button
              onClick={handleManualSave}
              isLoading={updatingDoc}
              className="flex items-center gap-1.5 font-semibold"
            >
              <Save className="h-4 w-4" />
              Save Now
            </Button>
          )}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col p-8 bg-gray-50/50">
        <TipTapEditor
          content={document.content_json || ''}
          editable={isEditable}
          onChange={handleContentChange}
          onEditorCreated={handleEditorCreated}
        />
      </div>

      {/* Share settings Modal */}
      {role === 'owner' && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          document={document}
        />
      )}
    </div>
  );
}
