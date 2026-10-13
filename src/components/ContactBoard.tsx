import { ArrowUpRight, CircleDashed } from 'lucide-react'
import { STAGES, type Contact, type Stage } from '../types/contact'
import { Avatar, Labels, Owner } from './ContactPrimitives'

interface Props {
  contacts: Contact[]
  onOpen: (id: string, opener: HTMLElement) => void
  isSearching: boolean
}

function ContactCard({
  contact,
  onOpen,
}: {
  contact: Contact
  onOpen: Props['onOpen']
}) {
  return (
    <button
      type="button"
      className="contact-card"
      aria-label={`Open ${contact.name}`}
      data-contact-id={contact.id}
      onClick={(event) => onOpen(contact.id, event.currentTarget)}
    >
      <span className="card-heading">
        <Avatar name={contact.name} />
        <ArrowUpRight size={14} className="card-open-icon" />
      </span>
      <span className="card-name">{contact.name}</span>
      <span className="card-role">{contact.role ?? 'Role not added'}</span>
      <span className={`card-company ${contact.company ? '' : 'missing'}`}>
        {contact.company ?? 'No company'}
      </span>
      <span className="card-bottom">
        <Owner name={contact.owner} />
        <Labels labels={contact.labels} />
      </span>
    </button>
  )
}

function BoardColumn({
  stage,
  contacts,
  onOpen,
  isSearching,
}: Props & { stage: Stage }) {
  return (
    <section
      className={`board-column stage-${stage.toLowerCase()}`}
      aria-label={`${stage} contacts`}
    >
      <h2 className="column-heading">
        <span className="column-title">
          <span className="stage-dot" />
          {stage}
          <span className="column-count">{contacts.length}</span>
        </span>
        <span className="column-line" />
      </h2>
      <div className="column-cards">
        {contacts.length ? (
          contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} onOpen={onOpen} />
          ))
        ) : (
          <div className="empty-column">
            <CircleDashed size={24} />
            <p>
              {isSearching ? 'No matching contacts' : 'A little room to grow'}
            </p>
            <span>
              {isSearching
                ? 'Try a different search.'
                : 'No contacts in this stage yet.'}
            </span>
            {!isSearching && (
              <span className="empty-hint">
                Open a contact and update their stage
                <br />
                to move them here.
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export function ContactBoard({ contacts, onOpen, isSearching }: Props) {
  return (
    <div
      className="board-scroll"
      role="region"
      aria-label="Contact board. Scroll horizontally to see all stages."
      tabIndex={0}
    >
      <div className="board-grid">
        {STAGES.map((stage) => (
          <BoardColumn
            key={stage}
            stage={stage}
            contacts={contacts.filter((contact) => contact.stage === stage)}
            onOpen={onOpen}
            isSearching={isSearching}
          />
        ))}
      </div>
    </div>
  )
}
