import { Icon } from '../Icon/Icon'
import styles from './PinButton.module.css'

interface PinButtonProps {
  pinned: boolean
  /** Accessible name, e.g. "Pin USD to GBP". */
  label: string
  onClick: () => void
  /** Show "Favorite"/"Favorited" text next to the star (converter variant). */
  withText?: boolean
}

/** Star toggle used by the converter, Compare rows and Favorites rows. */
export function PinButton({ pinned, label, onClick, withText = false }: PinButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.pin} ${withText ? styles.withText : styles.iconOnly} ${pinned ? styles.pinned : ''}`}
      aria-pressed={pinned}
      aria-label={withText ? undefined : label}
      onClick={onClick}
    >
      <Icon name={pinned ? 'star-filled' : 'star'} size={16} className={styles.icon} />
      {withText && <span className={styles.text}>{pinned ? 'Favorited' : 'Favorite'}</span>}
    </button>
  )
}
