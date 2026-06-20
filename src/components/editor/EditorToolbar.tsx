'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const buttons = [
    {
      icon: <Bold className="h-4 w-4" />,
      label: 'Bold',
      isActive: () => editor.isActive('bold'),
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: <Italic className="h-4 w-4" />,
      label: 'Italic',
      isActive: () => editor.isActive('italic'),
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: <UnderlineIcon className="h-4 w-4" />,
      label: 'Underline',
      isActive: () => editor.isActive('underline'),
      action: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      icon: <Heading1 className="h-4 w-4" />,
      label: 'Heading 1',
      isActive: () => editor.isActive('heading', { level: 1 }),
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      label: 'Heading 2',
      isActive: () => editor.isActive('heading', { level: 2 }),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: <List className="h-4 w-4" />,
      label: 'Bullet List',
      isActive: () => editor.isActive('bulletList'),
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      label: 'Numbered List',
      isActive: () => editor.isActive('orderedList'),
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-150 sticky top-0 z-10 select-none">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.action}
          type="button"
          title={btn.label}
          className={cn(
            'p-2 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500',
            btn.isActive()
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          )}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}
