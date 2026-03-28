"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TiptapImage from "@tiptap/extension-image";
import MediaPickerModal from "./MediaPickerModal";
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, Link as LinkIcon, 
  Undo, Redo, Heading1, Heading2, Heading3,
  Quote, Code, Image as ImageIcon
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuButton = ({ 
  onClick, 
  active, 
  disabled, 
  children, 
  title 
}: { 
  onClick: () => void; 
  active?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-md transition-colors ${
      active 
        ? "bg-brand-primary/10 dark:bg-brand-primary/10 text-brand-primary dark:text-brand-primary" 
        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
    } disabled:opacity-30`}
  >
    {children}
  </button>
);

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-zinc-900 dark:text-zinc-50",
      },
    },
  });

  // Sync initial content or external changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("URL girin:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    } else if (url === "") {
      editor.chain().focus().unsetLink().run();
    }
  };

  const addImages = (urls: string[]) => {
    urls.forEach(url => {
      editor.chain().focus().setImage({ src: url }).run();
    });
  };

  return (
    <div className="rich-text-editor w-full border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 group focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary transition-all">
      {/* Media Picker Modal */}
      <MediaPickerModal 
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={addImages}
        multiple={true}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          active={editor.isActive("heading", { level: 1 })}
          title="Başlık 1"
        >
          <Heading1 className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          active={editor.isActive("heading", { level: 2 })}
          title="Başlık 2"
        >
          <Heading2 className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
          active={editor.isActive("heading", { level: 3 })}
          title="Başlık 3"
        >
          <Heading3 className="h-4 w-4" />
        </MenuButton>

        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          active={editor.isActive("bold")}
          title="Kalın"
        >
          <Bold className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          active={editor.isActive("italic")}
          title="İtalik"
        >
          <Italic className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          active={editor.isActive("underline")}
          title="Altı Çizili"
        >
          <UnderlineIcon className="h-4 w-4" />
        </MenuButton>

        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign("left").run()} 
          active={editor.isActive({ textAlign: "left" })}
          title="Sola Hizala"
        >
          <AlignLeft className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign("center").run()} 
          active={editor.isActive({ textAlign: "center" })}
          title="Ortala"
        >
          <AlignCenter className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign("right").run()} 
          active={editor.isActive({ textAlign: "right" })}
          title="Sağa Hizala"
        >
          <AlignRight className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign("justify").run()} 
          active={editor.isActive({ textAlign: "justify" })}
          title="İki Yana Yasla"
        >
          <AlignJustify className="h-4 w-4" />
        </MenuButton>

        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <MenuButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          active={editor.isActive("bulletList")}
          title="Madde İşaretli Liste"
        >
          <List className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          active={editor.isActive("orderedList")}
          title="Numaralı Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </MenuButton>

        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <MenuButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          active={editor.isActive("blockquote")}
          title="Alıntı"
        >
          <Quote className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleCode().run()} 
          active={editor.isActive("code")}
          title="Kod"
        >
          <Code className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={setLink} 
          active={editor.isActive("link")}
          title="Bağlantı Ekle"
        >
          <LinkIcon className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => setShowMediaPicker(true)} 
          title="Medyadan Resim Ekle"
        >
          <ImageIcon className="h-4 w-4" />
        </MenuButton>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5">
          <MenuButton 
            onClick={() => editor.chain().focus().undo().run()} 
            disabled={!editor.can().undo()}
            title="Geri Al"
          >
            <Undo className="h-4 w-4" />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().redo().run()} 
            disabled={!editor.can().redo()}
            title="İleri Al"
          >
            <Redo className="h-4 w-4" />
          </MenuButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />
        {!editor.getHTML() || editor.getHTML() === "<p></p>" && placeholder && (
          <div className="absolute top-4 left-4 text-zinc-400 text-sm pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
          tab-size: 4;
        }
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1rem;
          font-style: italic;
          color: #6b7280;
          margin: 1rem 0;
        }
        .dark .ProseMirror blockquote {
          border-left-color: #374151;
          color: #9ca3af;
        }
        .ProseMirror h1 { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.5rem; }
        .ProseMirror h2 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; }
        .ProseMirror h3 { font-size: 1.125rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .ProseMirror a { color: #6366f1; text-decoration: underline; cursor: pointer; }
        .dark .ProseMirror a { color: #818cf8; }
        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }
        .dark .ProseMirror code {
          background-color: #1f2937;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
