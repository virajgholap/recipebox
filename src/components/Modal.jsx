import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal
 *
 * A dialog primitive: portalled to the body, scroll-locked, Escape to close,
 * click the backdrop to close, focus trapped inside while open and returned to
 * whatever opened it on close.
 *
 * On narrow screens it becomes a bottom sheet — see Modal.css.
 */
export default function Modal({ open, onClose, labelledBy, children }) {
  const panelRef = useRef(null)
  const returnFocusRef = useRef(null)

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll(FOCUSABLE)
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return undefined

    returnFocusRef.current = document.activeElement

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    // Focus the panel itself rather than the first control, so the reader
    // starts at the title instead of halfway down the dialog.
    panelRef.current?.focus()

    return () => {
      document.body.style.overflow = overflow
      returnFocusRef.current?.focus?.()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="modal" onKeyDown={handleKeyDown}>
      <div className="modal__backdrop" onClick={onClose} />
      <div
        ref={panelRef}
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
