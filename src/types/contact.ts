export const STAGES = ['Lead', 'Prospect', 'Qualified', 'Customer'] as const
export type Stage = (typeof STAGES)[number]
export type View = 'table' | 'board'

export interface Contact {
  id: string
  name: string
  email?: string
  company?: string
  role?: string
  owner?: string
  labels?: string[]
  stage: Stage
  notes?: string
}

export type ContactEdits = Pick<Contact, 'stage' | 'notes'>
