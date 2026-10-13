import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, FileText, Mail, X } from 'lucide-react'
import {
  STAGES,
  type Contact,
  type ContactEdits,
  type Stage,
} from '../types/contact'
import { Avatar, Labels, Owner } from './ContactPrimitives'

interface Props {
  contact: Contact
  onClose: () => void
  onSave: (edits: ContactEdits) => void
}

export function ContactDetailsPanel({ contact, onClose, onSave }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const stageRef = useRef<HTMLSelectElement>(null)
  const [stage, setStage] = useState(contact.stage)
  const [notes, setNotes] = useState(contact.notes ?? '')
  const dirty = stage !== contact.stage || notes !== (contact.notes ?? '')

  useEffect(() => {
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog?.showModal()
    stageRef.current?.focus()
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="details-panel"
      aria-labelledby="contact-title"
      aria-describedby="panel-instructions"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = event.currentTarget.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], select, textarea',
        )
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose()
        }
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (dirty) onSave({ stage, notes })
        }}
      >
        <header className="panel-top">
          <span>Contact details</span>
          <button
            type="button"
            className="icon-button"
            aria-label="Close contact details"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </header>
        <div className="panel-scroll">
          <div className="panel-identity">
            <Avatar name={contact.name} large />
            <h2 id="contact-title">{contact.name}</h2>
            <p>
              {[contact.role, contact.company].filter(Boolean).join(' at ') ||
                'Contact information not added'}
            </p>
            {contact.email ? (
              <a className="panel-email" href={`mailto:${contact.email}`}>
                <Mail size={14} />
                {contact.email}
                <ArrowUpRight size={12} />
              </a>
            ) : (
              <span className="panel-email missing">
                <Mail size={14} />
                No email added
              </span>
            )}
          </div>
          <section className="properties" aria-label="Contact information">
            <h3>ABOUT THIS CONTACT</h3>
            <dl>
              <div>
                <dt>Company</dt>
                <dd>
                  {contact.company ?? (
                    <span className="missing">Not added</span>
                  )}
                </dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>
                  {contact.role ?? <span className="missing">Not added</span>}
                </dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>
                  <Owner name={contact.owner} />
                </dd>
              </div>
              <div>
                <dt>Labels</dt>
                <dd>
                  <Labels labels={contact.labels} expanded />
                </dd>
              </div>
            </dl>
          </section>
          <section className="edit-section" aria-label="Edit contact">
            <div className="field-heading">
              <label htmlFor="contact-stage">Relationship stage</label>
              <span className={`stage-dot stage-${stage.toLowerCase()}`} />
            </div>
            <select
              ref={stageRef}
              id="contact-stage"
              value={stage}
              onChange={(event) => setStage(event.target.value as Stage)}
            >
              {STAGES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <div className="notes-heading">
              <label htmlFor="contact-notes">
                <FileText size={15} />
                Notes
              </label>
            </div>
            <textarea
              id="contact-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add a little context: conversations, next steps, or things to remember…"
              rows={6}
            />
            <p id="panel-instructions" className="draft-hint">
              {dirty
                ? 'Unsaved changes. Save to update both views.'
                : 'Stage and notes are editable. Changes apply when you save.'}
            </p>
          </section>
        </div>
        <footer className="panel-footer">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button-primary" disabled={!dirty}>
            <Check size={15} />
            Save changes
          </button>
        </footer>
      </form>
    </dialog>
  )
}
