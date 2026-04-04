'use client'

import { Node, mergeAttributes, ReactNodeViewRenderer, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import { useRef, useState, useCallback } from 'react'

type ImageAttrs = { src: string; alt?: string; title?: string; width?: number | null }

function ResizableImageView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const attrs = node.attrs as ImageAttrs
  const containerRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [liveWidth, setLiveWidth] = useState<number | null>(null)
  const isDragging = useRef(false)
  const drag = useRef({ startX: 0, startW: 0 })

  const currentWidth = attrs.width ?? null
  const displayWidth = liveWidth ?? currentWidth
  const widthStyle = displayWidth ? `${displayWidth}px` : '100%'
  const showHandle = selected || hovered || liveWidth !== null

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startW = containerRef.current?.offsetWidth ?? currentWidth ?? 600
    drag.current = { startX: e.clientX, startW }
    isDragging.current = true
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'

    const onMove = (ev: MouseEvent) => {
      const w = Math.max(80, Math.round(drag.current.startW + ev.clientX - drag.current.startX))
      setLiveWidth(w)
    }

    const onUp = (ev: MouseEvent) => {
      const w = Math.max(80, Math.round(drag.current.startW + ev.clientX - drag.current.startX))
      updateAttributes({ width: w })
      setLiveWidth(null)
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [currentWidth, updateAttributes])

  return (
    <NodeViewWrapper>
      <div
        ref={containerRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { if (!isDragging.current) setHovered(false) }}
        style={{ position: 'relative', display: 'block', width: widthStyle, maxWidth: '100%' }}
      >
        <img
          src={attrs.src}
          alt={attrs.alt ?? ''}
          title={attrs.title ?? undefined}
          draggable={false}
          style={{ display: 'block', width: '100%', borderRadius: 10 }}
        />

        {/* Selection ring */}
        {selected && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 10,
            border: '2px solid rgba(255,255,255,0.4)', pointerEvents: 'none',
          }} />
        )}

        {/* Resize handle */}
        {showHandle && (
          <div
            onMouseDown={onMouseDown}
            style={{
              position: 'absolute', right: -6, top: '50%',
              transform: 'translateY(-50%)',
              width: 12, height: 36, borderRadius: 6,
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
              cursor: 'ew-resize', userSelect: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <div style={{ width: 2, height: 14, borderRadius: 2, background: 'rgba(0,0,0,0.3)' }} />
          </div>
        )}

        {/* Live width tooltip */}
        {liveWidth !== null && (
          <div style={{
            position: 'absolute', top: 10, right: 20,
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(6px)',
            color: '#fff', fontSize: 11, fontFamily: 'monospace',
            padding: '3px 8px', borderRadius: 5,
            pointerEvents: 'none', letterSpacing: '0.06em',
          }}>
            {liveWidth}px
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export const ResizableImage = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: {
        default: null,
        parseHTML: (el) => {
          // Prefer the width attribute (new format)
          const w = el.getAttribute('width')
          if (w) return parseFloat(w)
          // Fall back to inline style (old format, backward compat)
          const style = el.getAttribute('style') ?? ''
          const m = style.match(/width:\s*([\d.]+)px/)
          if (m) return parseFloat(m[1])
          return null
        },
        renderHTML: (attrs) => {
          if (!attrs.width) return {}
          // Use the width attribute — inline styles are stripped by DOMPurify
          return { width: `${Math.round(attrs.width)}` }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  },
})
