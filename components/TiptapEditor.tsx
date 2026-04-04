'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { ResizableImage } from './ResizableImage'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Youtube } from '@tiptap/extension-youtube'
import { VideoNode } from './VideoNode'
import { useRef, useCallback, useState } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Code2,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  Link2, Link2Off,
  ImageIcon, Video, Tv2,
  Undo2, Redo2,
  Check, X,
} from 'lucide-react'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  if (!res.ok) throw new Error('Upload failed')
  const { url } = await res.json()
  return url
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarBtn({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
        active
          ? 'bg-white text-black'
          : 'text-white/50 hover:bg-white/10 hover:text-white/80'
      } disabled:cursor-not-allowed disabled:opacity-20`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-4 w-px shrink-0 bg-white/10" />
}

function wordCount(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const linkInputRef = useRef<HTMLInputElement>(null)
  const ytInputRef = useRef<HTMLInputElement>(null)

  const [linkPanel, setLinkPanel] = useState(false)
  const [linkValue, setLinkValue] = useState('')
  const [ytPanel, setYtPanel] = useState(false)
  const [ytValue, setYtValue] = useState('')
  const [words, setWords] = useState(0)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      ResizableImage,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your documentation, add images, embed videos…' }),
      Youtube.configure({ width: 840, height: 472, nocookie: true }),
      VideoNode,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'doc-content focus:outline-none min-h-[420px] px-0',
      },
      handleDrop(view, event, _slice, moved) {
        if (moved || !event.dataTransfer?.files?.length) return false
        const file = event.dataTransfer.files[0]
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')
        if (!isImage && !isVideo) return false
        event.preventDefault()
        uploadFile(file).then((url) => {
          if (isImage) {
            view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: url })))
          } else {
            view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.video.create({ src: url })))
          }
        })
        return true
      },
      handlePaste(view, event) {
        const files = event.clipboardData?.files
        if (!files?.length) return false
        const file = files[0]
        if (!file.type.startsWith('image/')) return false
        event.preventDefault()
        uploadFile(file).then((url) => {
          view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: url })))
        })
        return true
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
      setWords(wordCount(editor.getText()))
    },
    onCreate({ editor }) {
      setWords(wordCount(editor.getText()))
    },
  })

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    try {
      const url = await uploadFile(file)
      editor.chain().focus().insertContent({ type: 'image', attrs: { src: url } }).run()
    } catch { /* noop */ }
    e.target.value = ''
  }, [editor])

  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    try {
      const url = await uploadFile(file)
      editor.chain().focus().insertContent({ type: 'video', attrs: { src: url } }).run()
    } catch { /* noop */ }
    e.target.value = ''
  }, [editor])

  const openLinkPanel = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string ?? ''
    setLinkValue(prev)
    setLinkPanel(true)
    setYtPanel(false)
    setTimeout(() => linkInputRef.current?.focus(), 50)
  }, [editor])

  const applyLink = useCallback(() => {
    if (!editor) return
    if (linkValue === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkValue }).run()
    }
    setLinkPanel(false)
    setLinkValue('')
  }, [editor, linkValue])

  const openYtPanel = useCallback(() => {
    setYtPanel(true)
    setLinkPanel(false)
    setYtValue('')
    setTimeout(() => ytInputRef.current?.focus(), 50)
  }, [])

  const applyYt = useCallback(() => {
    if (!editor || !ytValue) return
    editor.chain().focus().setYoutubeVideo({ src: ytValue }).run()
    setYtPanel(false)
    setYtValue('')
  }, [editor, ytValue])

  if (!editor) return null

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/3">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 px-2.5 py-2">

        {/* History */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (⌘Z)">
          <Undo2 size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (⌘⇧Z)">
          <Redo2 size={14} />
        </ToolbarBtn>

        <Divider />

        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={14} />
        </ToolbarBtn>

        <Divider />

        {/* Inline formatting */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (⌘B)">
          <Bold size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (⌘I)">
          <Italic size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (⌘U)">
          <UnderlineIcon size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
          <Code size={14} />
        </ToolbarBtn>

        <Divider />

        {/* Blocks */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
          <ListOrdered size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <Quote size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
          <Code2 size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus size={14} />
        </ToolbarBtn>

        <Divider />

        {/* Link */}
        <ToolbarBtn onClick={openLinkPanel} active={editor.isActive('link') || linkPanel} title="Insert link (⌘K)">
          <Link2 size={14} />
        </ToolbarBtn>
        {editor.isActive('link') && (
          <ToolbarBtn onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()} title="Remove link">
            <Link2Off size={14} />
          </ToolbarBtn>
        )}

        <Divider />

        {/* Media */}
        <ToolbarBtn onClick={() => imageInputRef.current?.click()} title="Upload image">
          <ImageIcon size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => videoInputRef.current?.click()} title="Upload video">
          <Video size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={openYtPanel} active={ytPanel} title="Embed YouTube">
          <Tv2 size={14} />
        </ToolbarBtn>
      </div>

      {/* ── Link panel ── */}
      {linkPanel && (
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/4 px-3 py-2">
          <Link2 size={13} className="shrink-0 text-white/40" />
          <input
            ref={linkInputRef}
            type="url"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyLink()
              if (e.key === 'Escape') setLinkPanel(false)
            }}
            placeholder="https://…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
          />
          <button
            type="button"
            onClick={applyLink}
            className="flex h-6 w-6 items-center justify-center rounded bg-white text-black transition-opacity hover:opacity-80"
            aria-label="Apply link"
          >
            <Check size={12} />
          </button>
          <button
            type="button"
            onClick={() => setLinkPanel(false)}
            className="flex h-6 w-6 items-center justify-center rounded text-white/40 hover:text-white/70"
            aria-label="Cancel"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── YouTube panel ── */}
      {ytPanel && (
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/4 px-3 py-2">
          <Tv2 size={13} className="shrink-0 text-white/40" />
          <input
            ref={ytInputRef}
            type="url"
            value={ytValue}
            onChange={(e) => setYtValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyYt()
              if (e.key === 'Escape') setYtPanel(false)
            }}
            placeholder="YouTube URL…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
          />
          <button
            type="button"
            onClick={applyYt}
            className="flex h-6 w-6 items-center justify-center rounded bg-white text-black transition-opacity hover:opacity-80"
            aria-label="Embed video"
          >
            <Check size={12} />
          </button>
          <button
            type="button"
            onClick={() => setYtPanel(false)}
            className="flex h-6 w-6 items-center justify-center rounded text-white/40 hover:text-white/70"
            aria-label="Cancel"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── Bubble menu (text selection) ── */}
      <BubbleMenu
        editor={editor}
        options={{ placement: 'top' }}
        className="flex items-center gap-0.5 rounded-lg border border-white/15 bg-[#111] px-1.5 py-1 shadow-2xl shadow-black/60 backdrop-blur"
      >
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <UnderlineIcon size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strike">
          <Strikethrough size={13} />
        </ToolbarBtn>
        <Divider />
        <ToolbarBtn onClick={openLinkPanel} active={editor.isActive('link')} title="Link">
          <Link2 size={13} />
        </ToolbarBtn>
      </BubbleMenu>

      {/* ── Editor ── */}
      <div className="p-5">
        <EditorContent editor={editor} />
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between border-t border-white/6 px-4 py-2">
        <span className="font-mono text-[11px] text-white/20">
          {words} {words === 1 ? 'word' : 'words'}
        </span>
      </div>

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
    </div>
  )
}
