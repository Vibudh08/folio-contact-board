import { ArrowUpRight, Building2, Mail, Tag, UserRound } from 'lucide-react'
import type { Contact } from '../types/contact'
import { Avatar, Labels, Owner, StageBadge } from './ContactPrimitives'

interface Props {
  contacts: Contact[]
  onOpen: (id: string, opener: HTMLElement) => void
}

export function ContactTable({ contacts, onOpen }: Props) {
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Contact table. Scroll horizontally to see all fields."
    >
      <table>
        <caption className="sr-only">
          Business contacts. Open a contact to edit their stage and notes.
        </caption>
        <colgroup>
          <col className="col-name" />
          <col className="col-company" />
          <col className="col-role" />
          <col className="col-email" />
          <col className="col-owner" />
          <col className="col-stage" />
          <col className="col-labels" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">
              <span>
                <UserRound size={13} />
                Name
              </span>
            </th>
            <th scope="col">
              <span>
                <Building2 size={13} />
                Company
              </span>
            </th>
            <th scope="col">Role</th>
            <th scope="col">
              <span>
                <Mail size={13} />
                Email
              </span>
            </th>
            <th scope="col">Owner</th>
            <th scope="col">Stage</th>
            <th scope="col">
              <span>
                <Tag size={13} />
                Labels
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              onClick={(event) => {
                const opener = event.currentTarget.querySelector('button')
                if (opener) onOpen(contact.id, opener)
              }}
            >
              <td>
                <button
                  className="contact-name"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onOpen(contact.id, event.currentTarget)
                  }}
                  aria-label={`Open ${contact.name}`}
                  data-contact-id={contact.id}
                >
                  <Avatar name={contact.name} />
                  <span>{contact.name}</span>
                  <ArrowUpRight className="row-open-icon" size={13} />
                </button>
              </td>
              <td>{contact.company ?? <span className="missing">—</span>}</td>
              <td>{contact.role ?? <span className="missing">—</span>}</td>
              <td className="email-cell">
                {contact.email ?? <span className="missing">—</span>}
              </td>
              <td>
                <Owner name={contact.owner} />
              </td>
              <td>
                <StageBadge stage={contact.stage} />
              </td>
              <td>
                <Labels labels={contact.labels} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
