'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../components/layout/AppShell';
import { FileText } from 'lucide-react';

export default function DocumentsPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const lastDocId = localStorage.getItem('docflow_last_document_id');
      if (lastDocId) {
        router.push(`/documents/${lastDocId}`);
      }
    } catch (e) {
      console.error('LocalStorage read error:', e);
    }
  }, [router]);

  return (
    <AppShell>
      <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gray-50/20 text-center select-none animate-in fade-in duration-300">
        <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-4 shadow-inner">
          <FileText className="h-10 w-10 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome to DocFlow</h2>
        <p className="text-gray-500 max-w-sm mt-2 text-sm leading-relaxed">
          Create a new document, import a file (.txt or .md), or select an existing one from the sidebar to begin.
        </p>
      </div>
    </AppShell>
  );
}
