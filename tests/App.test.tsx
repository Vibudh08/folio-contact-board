import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../src/App'

describe('contact workspace', () => {
  it('gives each successive save its own full confirmation timeout', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { unmount } = render(<App />)
    try {
      fireEvent.click(
        screen.getByRole('button', { name: 'Open Emma Richardson' }),
      )
      fireEvent.change(screen.getByLabelText('Relationship stage'), {
        target: { value: 'Prospect' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
      act(() => {
        vi.advanceTimersByTime(4000)
      })
      fireEvent.click(
        screen.getByRole('button', { name: 'Open Emma Richardson' }),
      )
      fireEvent.change(screen.getByLabelText('Relationship stage'), {
        target: { value: 'Customer' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
      act(() => {
        vi.advanceTimersByTime(1500)
      })
      expect(screen.getByRole('status')).toHaveTextContent(
        'Emma Richardson updated.',
      )
      act(() => {
        vi.advanceTimersByTime(3500)
      })
      expect(screen.getByRole('status')).toBeEmptyDOMElement()
    } finally {
      unmount()
      vi.useRealTimers()
    }
  })

  it('handles successive saves, a cancelled note, long notes, and clearing notes without duplicates', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Board' }))
    for (const stage of ['Prospect', 'Qualified', 'Customer']) {
      await user.click(
        screen.getByRole('button', { name: 'Open Emma Richardson' }),
      )
      await user.selectOptions(
        screen.getByLabelText('Relationship stage'),
        stage,
      )
      await user.click(screen.getByRole('button', { name: 'Save changes' }))
      expect(
        within(
          screen.getByRole('region', { name: `${stage} contacts` }),
        ).getByRole('button', { name: 'Open Emma Richardson' }),
      ).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: /^Open / })).toHaveLength(10)
    }
    expect(
      within(
        screen.getByRole('region', { name: 'Qualified contacts' }),
      ).getByText('0'),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Open Emma Richardson' }),
    )
    await user.clear(screen.getByLabelText('Notes'))
    await user.type(screen.getByLabelText('Notes'), 'Do not save this note')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(
      screen.getByRole('button', { name: 'Open Emma Richardson' }),
    )
    expect(screen.getByLabelText('Notes')).toHaveValue(
      'Follow up next week. Interested in a walkthrough with the product team.',
    )
    const longNotes =
      'Review follow-up. '.repeat(120) + '\nNext step: onboarding.'
    await user.clear(screen.getByLabelText('Notes'))
    await user.paste(longNotes)
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    await user.click(screen.getByRole('button', { name: 'Table' }))
    await user.click(
      screen.getByRole('button', { name: 'Open Emma Richardson' }),
    )
    expect(screen.getByLabelText('Notes')).toHaveValue(longNotes)
    await user.clear(screen.getByLabelText('Notes'))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    await user.click(screen.getByRole('button', { name: 'Board' }))
    await user.click(
      screen.getByRole('button', { name: 'Open Emma Richardson' }),
    )
    expect(screen.getByLabelText('Notes')).toHaveValue('')
    expect(screen.getByLabelText('Relationship stage')).toHaveValue('Customer')
  })

  it('discards draft edits when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Open Noah Williams' }))
    await user.selectOptions(
      screen.getByLabelText('Relationship stage'),
      'Customer',
    )
    await user.clear(screen.getByLabelText('Notes'))
    await user.type(screen.getByLabelText('Notes'), 'Discard from backdrop')
    fireEvent.click(screen.getByRole('dialog'), { clientX: -1, clientY: -1 })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open Noah Williams' }))
    expect(screen.getByLabelText('Relationship stage')).toHaveValue('Lead')
    expect(screen.getByLabelText('Notes')).toHaveValue(
      'Met at the design meetup. Send a short overview of the team plan.',
    )
  })

  it('wraps keyboard focus inside the drawer and skips disabled Save', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(
      screen.getByRole('button', { name: 'Open Emma Richardson' }),
    )
    const close = screen.getByRole('button', { name: 'Close contact details' })
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    close.focus()
    await user.tab({ shift: true })
    expect(cancel).toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()
    await user.selectOptions(
      screen.getByLabelText('Relationship stage'),
      'Qualified',
    )
    const save = screen.getByRole('button', { name: 'Save changes' })
    save.focus()
    await user.tab()
    expect(close).toHaveFocus()
    await user.tab({ shift: true })
    expect(save).toHaveFocus()
  })

  it('saves stage and notes in one dataset, moves the card, and survives repeated view switches', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(
      screen.getByRole('button', { name: 'Open Emma Richardson' }),
    )
    await user.selectOptions(
      screen.getByLabelText('Relationship stage'),
      'Customer',
    )
    await user.clear(screen.getByLabelText('Notes'))
    await user.type(
      screen.getByLabelText('Notes'),
      'Deal closed. Onboard next week.',
    )
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const row = screen
      .getByRole('button', { name: 'Open Emma Richardson' })
      .closest('tr')!
    expect(within(row).getByText('Customer')).toBeInTheDocument()
    for (const view of ['Board', 'Table', 'Board'])
      await user.click(screen.getByRole('button', { name: view }))
    expect(
      within(
        screen.getByRole('region', { name: 'Customer contacts' }),
      ).getByRole('button', { name: 'Open Emma Richardson' }),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'Lead contacts' })).queryByRole(
        'button',
        { name: 'Open Emma Richardson' },
      ),
    ).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'Open Emma Richardson' }),
    ).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /^Open / })).toHaveLength(10)
    await user.click(
      screen.getByRole('button', { name: 'Open Emma Richardson' }),
    )
    expect(screen.getByLabelText('Notes')).toHaveValue(
      'Deal closed. Onboard next week.',
    )
    expect(screen.getByLabelText('Relationship stage')).toHaveValue('Customer')
  })

  it.each(['Cancel', 'Close contact details', 'Escape'])(
    'discards both drafts with %s and keeps the board context',
    async (method) => {
      const user = userEvent.setup()
      render(<App />)
      await user.click(screen.getByRole('button', { name: 'Board' }))
      await user.click(
        screen.getByRole('button', { name: 'Open Emma Richardson' }),
      )
      await user.selectOptions(
        screen.getByLabelText('Relationship stage'),
        'Customer',
      )
      await user.clear(screen.getByLabelText('Notes'))
      await user.type(screen.getByLabelText('Notes'), 'Deal closed')
      if (method === 'Escape')
        fireEvent(
          screen.getByRole('dialog'),
          new Event('cancel', { cancelable: true, bubbles: false }),
        )
      else await user.click(screen.getByRole('button', { name: method }))
      expect(screen.getByRole('button', { name: 'Board' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(
        within(screen.getByRole('region', { name: 'Lead contacts' })).getByRole(
          'button',
          { name: 'Open Emma Richardson' },
        ),
      ).toBeInTheDocument()
      await user.click(
        screen.getByRole('button', { name: 'Open Emma Richardson' }),
      )
      expect(screen.getByLabelText('Relationship stage')).toHaveValue('Lead')
      expect(screen.getByLabelText('Notes')).toHaveValue(
        'Follow up next week. Interested in a walkthrough with the product team.',
      )
    },
  )

  it('shows all four board columns including the initially empty stage and supports missing data', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.queryByText(/undefined|null/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Board' }))
    for (const stage of ['Lead', 'Prospect', 'Qualified', 'Customer'])
      expect(
        screen.getByRole('region', { name: `${stage} contacts` }),
      ).toBeInTheDocument()
    expect(
      within(
        screen.getByRole('region', { name: 'Qualified contacts' }),
      ).getByText('0'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('No contacts in this stage yet.'),
    ).toBeInTheDocument()
    expect(screen.getByText('No company')).toBeInTheDocument()
    expect(screen.getByText('Role not added')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open Sophia Chen' }))
    expect(screen.getByText('No email added')).toBeInTheDocument()
    expect(screen.getByLabelText('Notes')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  })

  it('returns focus to the moved board card after saving and initializes fresh drafts on reopening', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Board' }))
    await user.click(screen.getByRole('button', { name: 'Open Noah Williams' }))
    expect(screen.getByLabelText('Relationship stage')).toHaveFocus()
    await user.selectOptions(
      screen.getByLabelText('Relationship stage'),
      'Qualified',
    )
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Open Noah Williams' }),
      ).toHaveFocus(),
    )
    expect(screen.getByRole('button', { name: 'Board' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('Relationship stage')).toHaveValue('Qualified')
    await user.selectOptions(
      screen.getByLabelText('Relationship stage'),
      'Customer',
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(screen.getByRole('button', { name: 'Open Sophia Chen' }))
    expect(screen.getByLabelText('Relationship stage')).toHaveValue('Lead')
    expect(screen.getByLabelText('Notes')).toHaveValue('')
  })

  it('searches name, company, and email, keeps the query across views, and recovers from no results', async () => {
    const user = userEvent.setup()
    render(<App />)
    const search = screen.getByRole('searchbox', { name: 'Search contacts' })
    for (const query of ['Emma', 'northstar', 'emma@']) {
      await user.clear(search)
      await user.type(search, query)
      expect(screen.getAllByRole('button', { name: /^Open / })).toHaveLength(1)
    }
    await user.click(screen.getByRole('button', { name: 'Board' }))
    expect(search).toHaveValue('emma@')
    expect(screen.getAllByRole('button', { name: /^Open / })).toHaveLength(1)
    await user.clear(search)
    await user.type(search, 'not-in-this-dataset')
    expect(screen.getAllByText('No matching contacts')).toHaveLength(4)
    await user.click(screen.getByRole('button', { name: 'Table' }))
    expect(screen.getByText('No contacts found')).toBeInTheDocument()
    await user.click(
      within(screen.getByRole('main'))
        .getAllByRole('button', { name: 'Clear search' })
        .at(-1)!,
    )
    expect(screen.getAllByRole('button', { name: /^Open / })).toHaveLength(10)
  })
})
