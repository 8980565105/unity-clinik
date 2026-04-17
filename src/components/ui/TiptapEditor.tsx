import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Link2,
  Undo,
  Redo,
  Image as ImageIcon,
  Highlighter,
  Palette,
  Eraser,
  Table as TableIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export function TiptapEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const [headingDropdownOpen, setHeadingDropdownOpen] = useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [tableDropdownOpen, setTableDropdownOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState("#3b82f6");
  const [highlightDropdownOpen, setHighlightDropdownOpen] = useState(false);
  const [currentHighlightColor, setCurrentHighlightColor] = useState("#f59e0b");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: "list-disc list-outside pl-5" } },
        orderedList: { HTMLAttributes: { class: "list-decimal list-outside pl-5" } },
        listItem: { HTMLAttributes: { class: "leading-relaxed" } },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto" },
      }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "border-collapse border border-gray-400 w-full" },
      }),
      TableRow.configure({ HTMLAttributes: { class: "border border-gray-300" } }),
      TableCell.configure({ HTMLAttributes: { class: "border border-gray-300 px-4 py-2" } }),
      TableHeader.configure({
        HTMLAttributes: { class: "border border-gray-300 px-4 py-2 bg-gray-100 font-bold" },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] px-3 py-2",
      },
    },
    autofocus: false,
    immediatelyRender: false,
  });

  const buttonBase = "p-2 rounded hover:bg-gray-100 transition-colors duration-200";
  const activeStyle = "bg-gray-200 text-blue-600";

  const headingLevels: Level[] = [1, 2, 3, 4, 5, 6];
  const headingSizeMap: Record<number, string> = {
    1: "text-4xl",
    2: "text-3xl",
    3: "text-2xl",
    4: "text-xl",
    5: "text-lg",
    6: "text-base",
  };

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      editor?.chain().focus().setImage({ src: result }).run();
    };
    reader.readAsDataURL(file);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    editor?.chain().focus().setColor(color).run();
  };

  const insertTable = (rows: number, cols: number) => {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setTableDropdownOpen(false);
  };

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[150px] px-3 py-2 text-gray-500 flex items-center justify-center border border-gray-300 rounded-md">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-md bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-300 p-2 bg-gray-50 sticky top-0 z-50">

        {/* Heading dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setHeadingDropdownOpen((open) => !open)}
            className="p-2 border border-gray-300 rounded text-sm bg-white flex items-center gap-1"
          >
            {headingLevels.find((level) => editor.isActive("heading", { level }))
              ? `Heading ${headingLevels.find((l) => editor.isActive("heading", { level: l }))}`
              : "Paragraph"}
          </button>
          {headingDropdownOpen && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-300 rounded shadow z-10 w-48 max-h-64 overflow-auto">
              <div
                onClick={() => {
                  editor.chain().focus().setParagraph().run();
                  setHeadingDropdownOpen(false);
                }}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <span className="text-sm">Paragraph</span>
              </div>
              {headingLevels.map((level) => (
                <div
                  key={level}
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level }).run();
                    setHeadingDropdownOpen(false);
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <span className={`${headingSizeMap[level]} font-bold`}>
                    Heading {level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${buttonBase} ${editor.isActive("bold") ? activeStyle : ""}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${buttonBase} ${editor.isActive("italic") ? activeStyle : ""}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${buttonBase} ${editor.isActive("underline") ? activeStyle : ""}`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setColorDropdownOpen((open) => !open)}
            className={`${buttonBase} flex items-center gap-1`}
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </button>
          {colorDropdownOpen && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-300 rounded shadow z-10 p-3 w-48">
              <div className="flex flex-col gap-2">
                <input
                  type="color"
                  ref={colorInputRef}
                  value={currentColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full h-8 cursor-pointer"
                  title="Pick text color"
                  aria-label="Pick text color"
                />
                <div className="flex flex-wrap gap-1">
                  {["#D68029", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().unsetColor().run()}
                  className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded"
                >
                  <Eraser className="w-4 h-4" />
                  Reset Color
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setHighlightDropdownOpen((open) => !open)}
            className={`${buttonBase} ${editor.isActive("highlight") ? activeStyle : ""}`}
            title="Background Color"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          {highlightDropdownOpen && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-300 rounded shadow z-10 p-3 w-48">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-600">Custom Color</label>
                <input
                  type="color"
                  value={currentHighlightColor}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setCurrentHighlightColor(newColor);
                    editor.chain().focus().setHighlight({ color: newColor }).run();
                  }}
                  className="w-full h-8 cursor-pointer"
                  title="Pick highlight color"
                  aria-label="Pick highlight color"
                />
                <label className="text-xs text-gray-600 mt-2">Swatches</label>
                <div className="flex flex-wrap gap-1">
                  {["#fed7aa", "#fecaca", "#bfdbfe", "#a7f3d0", "#fde68a", "#ddd6fe"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setCurrentHighlightColor(color);
                        editor.chain().focus().setHighlight({ color }).run();
                      }}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().unsetHighlight().run()}
                  className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded mt-2"
                >
                  <Eraser className="w-4 h-4" />
                  Remove Highlight
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${buttonBase} ${editor.isActive("bulletList") ? activeStyle : ""}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${buttonBase} ${editor.isActive("orderedList") ? activeStyle : ""}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        {/* Table */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setTableDropdownOpen((open) => !open)}
            className={`${buttonBase} ${editor.isActive("table") ? activeStyle : ""}`}
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          {tableDropdownOpen && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-300 rounded shadow z-10 p-3 w-48">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 5 }, (_, row) =>
                  Array.from({ length: 5 }, (_, col) => (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      onClick={() => insertTable(row + 1, col + 1)}
                      className="w-7 h-7 border border-gray-300 rounded hover:bg-blue-100 flex items-center justify-center text-xs"
                      title={`${row + 1}×${col + 1}`}
                    >
                      {row + 1}×{col + 1}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Table Controls */}
        {editor.isActive("table") && (
          <>
            <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className={buttonBase} title="Add Column Before">+Col←</button>
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className={buttonBase} title="Add Column After">+Col→</button>
            <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className={buttonBase} title="Add Row Before">+Row↑</button>
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className={buttonBase} title="Add Row After">+Row↓</button>
            <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className={buttonBase} title="Delete Column">-Col</button>
            <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className={buttonBase} title="Delete Row">-Row</button>
            <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className={buttonBase} title="Delete Table">×Table</button>
          </>
        )}

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${buttonBase} ${editor.isActive("blockquote") ? activeStyle : ""}`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>

        {/* Code Block */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`${buttonBase} ${editor.isActive("codeBlock") ? activeStyle : ""}`}
          title="Code Block"
        >
          <Code2 className="w-4 h-4" />
        </button>

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={buttonBase}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL");
            if (url) {
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            }
          }}
          className={buttonBase}
          title="Insert Link"
        >
          <Link2 className="w-4 h-4" />
        </button>

        {/* Undo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className={buttonBase}
          title="Undo"
          disabled={!editor.can().undo()}
        >
          <Undo className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className={buttonBase}
          title="Redo"
          disabled={!editor.can().redo()}
        >
          <Redo className="w-4 h-4" />
        </button>

        {/* Image Upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={buttonBase}
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="p-3 prose max-w-none
        [&_pre]:bg-gray-200 [&_pre]:text-gray-600 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:font-mono
        [&_table]:border-collapse [&_table]:border [&_table]:border-gray-400 [&_table]:w-full
        [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-2 [&_th]:bg-gray-100 [&_th]:font-bold
        [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-2"
      />
    </div>
  );
}

// React/Vite ma dynamic import nathi hotu - direct export karo
export const TiptapEditorNoSSR = TiptapEditor;