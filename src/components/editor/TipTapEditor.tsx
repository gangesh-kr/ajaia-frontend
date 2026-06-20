'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorToolbar } from './EditorToolbar';

interface TipTapEditorProps {
  content: string;
  editable: boolean;
  onChange: (json: string) => void;
  onEditorCreated?: (editor: any) => void;
}

export function TipTapEditor({ content, editable, onChange, onEditorCreated }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing…',
        emptyNodeClass: 'is-editor-empty',
      })
    ],
    content: content ? JSON.parse(content) : '',
    editable,
    autofocus: 'end',
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[400px] px-12 py-10 text-[17px] leading-relaxed text-gray-800'
      }
    }
  });

  useEffect(() => {
    if (editor && onEditorCreated) {
      onEditorCreated(editor);
    }
  }, [editor, onEditorCreated]);

  useEffect(() => {
    if (editor) {
      if (content) {
        try {
          const currentJson = JSON.stringify(editor.getJSON());
          if (currentJson !== content) {
            editor.commands.setContent(JSON.parse(content));
          }
        } catch (e) {
          console.error('Error parsing document content:', e);
        }
      } else {
        // If content is empty, set empty document
        const currentJson = editor.getJSON();
        if (currentJson.content && currentJson.content.length > 0) {
          editor.commands.setContent('');
        }
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden border border-gray-150 rounded-xl bg-white shadow-sm">
      {editable && <EditorToolbar editor={editor} />}
      <div className="flex-1 overflow-y-auto bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
