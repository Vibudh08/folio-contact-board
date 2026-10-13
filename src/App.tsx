import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, SearchX, X } from 'lucide-react'
import { initialContacts } from './data/contacts'
import type { Contact, ContactEdits, View } from './types/contact'
import { Header, Toolbar } from './components/Header'
import { ContactTable } from './components/ContactTable'
import { ContactBoard } from './components/ContactBoard'
import { ContactDetailsPanel } from './components/ContactDetailsPanel'

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [view, setView] = useState<View>('table')
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  )
  const [search, setSearch] = useState('')
  const [notification, setNotification] = useState<{
    id: number
    message: string
  } | null>(null)
  const notificationId = useRef(0)
  const openerRef = useRef<HTMLElement | null>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const selectedContact = contacts.find(
    (contact) => contact.id === selectedContactId,
  )
  const query = search.trim().toLowerCase()
  const visibleContacts = contacts.filter((contact) =>
    [contact.name, contact.email, contact.company].some((value) =>
      value?.toLowerCase().includes(query),
    ),
  )

  useEffect(() => {
    if (!notification) return
    const timer = window.setTimeout(() => setNotification(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notification])

  function openContact(id: string, opener: HTMLElement) {
    openerRef.current = opener
    setSelectedContactId(id)
  }

  function closeContact() {
    setSelectedContactId(null)
    // A moved card has a new DOM node. Restore focus by ID and reveal it if needed.
    window.requestAnimationFrame(() => {
      const trigger = openerRef.current
      const replacement = [
        ...(workspaceRef.current?.querySelectorAll<HTMLButtonElement>(
          'button[data-contact-id]',
        ) ?? []),
      ].find((button) => button.dataset.contactId === selectedContactId)
      if (trigger?.isConnected) trigger.focus({ preventScroll: true })
      else if (replacement) {
        replacement.focus({ preventScroll: true })
        replacement.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      } else
        workspaceRef.current
          ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
          ?.focus({ preventScroll: true })
    })
  }

  function saveContact(edits: ContactEdits) {
    if (!selectedContact) return
    setContacts((current) =>
      current.map((contact) =>
        contact.id === selectedContact.id ? { ...contact, ...edits } : contact,
      ),
    )
    setNotification({
      id: ++notificationId.current,
      message: `${selectedContact.name} updated. Changes are saved in both views.`,
    })
    closeContact()
  }

  return (
    <>
      <Header />
      <main id="main" className="workspace" ref={workspaceRef}>
        <Toolbar
          view={view}
          onViewChange={setView}
          search={search}
          onSearchChange={setSearch}
          count={visibleContacts.length}
        />
        <div className="view-description">
          <span>{view === 'table' ? 'All contacts' : 'Contacts by stage'}</span>
          <span>
            {view === 'table'
              ? 'Every relationship, at a glance.'
              : 'A clearer picture of your pipeline.'}
          </span>
        </div>
        {view === 'table' ? (
          visibleContacts.length ? (
            <ContactTable contacts={visibleContacts} onOpen={openContact} />
          ) : (
            <div className="empty-search">
              <SearchX size={28} />
              <h2>No contacts found</h2>
              <p>Try a name, company, or email address.</p>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setSearch('')}
              >
                Clear search
              </button>
            </div>
          )
        ) : (
          <ContactBoard
            contacts={visibleContacts}
            onOpen={openContact}
            isSearching={Boolean(query)}
          />
        )}
        <footer className="workspace-footer">
          <span>
            <span className="footer-dot" />
            One shared list. Two ways to see it.
          </span>
          <span>
            Open any contact to edit stage & notes<kbd>↵</kbd>
          </span>
        </footer>
      </main>
      <footer className="page-footer">
        <span>Built for the connections that matter.</span>
        <span>Fictional contacts · Changes stay for this session</span>
      </footer>
      {selectedContact && (
        <ContactDetailsPanel
          key={selectedContact.id}
          contact={selectedContact}
          onClose={closeContact}
          onSave={saveContact}
        />
      )}
      <div
        className="toast-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notification && (
          <div className="toast" key={notification.id}>
            <CheckCircle2 size={18} />
            <span>{notification.message}</span>
            <button
              className="icon-button"
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotification(null)}
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
