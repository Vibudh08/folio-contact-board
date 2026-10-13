import {
  BookUser,
  ChevronRight,
  Columns3,
  Search,
  Table2,
  X,
} from 'lucide-react'
import type { View } from '../types/contact'

export function Header() {
  return (
    <>
      <header className="app-header flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a className="brand flex items-center gap-2.5" href="#main">
            <span className="brand-symbol">f</span>folio
            <span className="sr-only"> workspace</span>
          </a>
          <span className="header-divider" />
          <div className="breadcrumb flex items-center gap-2.5">
            <span>Workspace</span>
            <ChevronRight size={13} />
            <span className="breadcrumb-current">Contacts</span>
          </div>
        </div>
        <span className="demo-badge">
          <span />
          Demo workspace
        </span>
      </header>
      <div className="page-heading">
        <div className="eyebrow">
          <BookUser size={15} /> YOUR RELATIONSHIP SPACE
        </div>
        <h1>
          Contacts<span className="title-dot">.</span>
        </h1>
        <p>
          Good relationships start with a little context. Keep yours in one
          place.
        </p>
      </div>
    </>
  )
}

interface ToolbarProps {
  view: View
  onViewChange: (view: View) => void
  search: string
  onSearchChange: (value: string) => void
  count: number
}

export function Toolbar({
  view,
  onViewChange,
  search,
  onSearchChange,
  count,
}: ToolbarProps) {
  return (
    <div className="toolbar flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="view-switch" role="group" aria-label="Contact view">
          <button
            type="button"
            aria-pressed={view === 'table'}
            onClick={() => onViewChange('table')}
          >
            <Table2 size={15} />
            Table
          </button>
          <button
            type="button"
            aria-pressed={view === 'board'}
            onClick={() => onViewChange('board')}
          >
            <Columns3 size={15} />
            Board
          </button>
        </div>
        <span className="contact-count">
          {count} {count === 1 ? 'contact' : 'contacts'}
        </span>
      </div>
      <div className="search-field">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          aria-label="Search contacts"
          placeholder="Search contacts…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange('')}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
