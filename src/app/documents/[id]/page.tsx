'use client';

import React from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { EditorPage } from '../../../components/editor/EditorPage';

export default function DocumentDetailPage() {
  return (
    <AppShell>
      <EditorPage />
    </AppShell>
  );
}
