'use client';

import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface Props {
  id: string;
  value: string;
  onChange: (html: string) => void;
  dir: 'ltr' | 'rtl';
  lang: string;
  invalid?: boolean;
}

/**
 * Article text: paragraphs, intertitles, bold, italic, lists, quotes and links — the only formats
 * the site displays (the server removes anything else). Right-to-left for Arabic.
 */
export function RichTextEditor({ id, value, onChange, dir, lang, invalid }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, protocols: ['https', 'http', 'mailto'], defaultProtocol: 'https' },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        id,
        class: 'article-body min-h-[22rem] px-4 py-4 text-[17px] leading-relaxed text-fg outline-none sm:px-6',
        'aria-label': 'Texte de l’article',
        'aria-multiline': 'true',
        role: 'textbox',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
  });

  // Content replaced from outside (restored backup, duplicate)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !(editor.isEmpty && !value)) editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e && {
        h2: e.isActive('heading', { level: 2 }),
        h3: e.isActive('heading', { level: 3 }),
        bold: e.isActive('bold'),
        italic: e.isActive('italic'),
        bullet: e.isActive('bulletList'),
        ordered: e.isActive('orderedList'),
        quote: e.isActive('blockquote'),
        link: e.isActive('link'),
        undo: e.can().undo(),
        redo: e.can().redo(),
      },
  });

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Adresse du lien (https://…). Laissez vide pour retirer le lien.', previous ?? 'https://');
    if (url === null) return;
    if (!url.trim() || url.trim() === 'https://') editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else if (/^(https?:\/\/|mailto:)/.test(url.trim())) editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    else window.alert('L’adresse doit commencer par https:// (ou mailto: pour un e-mail).');
  };

  const Btn = ({ on, active, label, title, disabled }: { on: () => void; active?: boolean; label: React.ReactNode; title: string; disabled?: boolean }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={on}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-semibold transition-colors disabled:opacity-35 ${active ? 'bg-wydad-logo text-white' : 'text-fg hover:bg-surface-secondary'}`}
    >
      {label}
    </button>
  );

  return (
    <div className={`overflow-hidden rounded-xl border bg-white ${invalid ? 'border-wydad-red' : 'border-border focus-within:border-wydad-logo'}`}>
      <div role="toolbar" aria-label="Mise en forme" className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-white/95 p-1.5 backdrop-blur">
        <Btn on={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={state?.h2} label="Intertitre" title="Intertitre (grand)" />
        <Btn on={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={state?.h3} label="Sous-titre" title="Sous-intertitre (petit)" />
        <span className="mx-1 h-6 w-px bg-border" aria-hidden />
        <Btn on={() => editor?.chain().focus().toggleBold().run()} active={state?.bold} label={<b>G</b>} title="Gras" />
        <Btn on={() => editor?.chain().focus().toggleItalic().run()} active={state?.italic} label={<i>I</i>} title="Italique" />
        <Btn on={setLink} active={state?.link} label="Lien" title="Ajouter ou retirer un lien" />
        <span className="mx-1 h-6 w-px bg-border" aria-hidden />
        <Btn on={() => editor?.chain().focus().toggleBulletList().run()} active={state?.bullet} label="• Liste" title="Liste à puces" />
        <Btn on={() => editor?.chain().focus().toggleOrderedList().run()} active={state?.ordered} label="1. Liste" title="Liste numérotée" />
        <Btn on={() => editor?.chain().focus().toggleBlockquote().run()} active={state?.quote} label="« Citation »" title="Citation" />
        <span className="ms-auto flex gap-0.5">
          <Btn on={() => editor?.chain().focus().undo().run()} disabled={!state?.undo} label="↶" title="Annuler" />
          <Btn on={() => editor?.chain().focus().redo().run()} disabled={!state?.redo} label="↷" title="Rétablir" />
        </span>
      </div>
      <div dir={dir} lang={lang} className={dir === 'rtl' ? 'text-right' : ''}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
