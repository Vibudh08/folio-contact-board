import type { Stage } from '../types/contact'

export function Avatar({
  name,
  large = false,
}: {
  name: string
  large?: boolean
}) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
  const color = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5
  return (
    <span
      aria-hidden="true"
      className={`avatar avatar-${color}${large ? ' avatar-large' : ''}`}
    >
      {initials}
    </span>
  )
}

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`stage-badge stage-${stage.toLowerCase()}`}>
      <span className="stage-dot" />
      {stage}
    </span>
  )
}

export function Labels({
  labels,
  expanded = false,
}: {
  labels?: string[]
  expanded?: boolean
}) {
  if (!labels?.length)
    return (
      <span className="missing" aria-label="No labels">
        —
      </span>
    )
  const visible = expanded ? labels : labels.slice(0, 1)
  return (
    <span className="labels">
      {visible.map((label) => (
        <span className="label-pill" key={label}>
          {label}
        </span>
      ))}
      {!expanded && labels.length > 1 && (
        <span
          className="label-overflow"
          title={labels.slice(1).join(', ')}
          aria-label={`Other labels: ${labels.slice(1).join(', ')}`}
        >
          +{labels.length - 1}
        </span>
      )}
    </span>
  )
}

export function Owner({ name }: { name?: string }) {
  return name ? (
    <span className="owner">
      <span
        aria-hidden="true"
        className={`owner-avatar ${name.startsWith('Alex') ? 'owner-alex' : 'owner-jamie'}`}
      >
        {name
          .split(' ')
          .map((part) => part[0])
          .join('')}
      </span>
      <span>{name}</span>
    </span>
  ) : (
    <span className="missing">Unassigned</span>
  )
}
