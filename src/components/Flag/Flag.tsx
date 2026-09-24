import { useState } from 'react'
import { flagSrc } from '../../data/currencyCatalog'
import styles from './Flag.module.css'

/** Round flag; decorative because the currency code is always shown next to it. */
export function Flag({ code, size = 20 }: { code: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  const style = { width: size, height: size }
  if (failed) {
    return (
      <span className={styles.placeholder} style={style} aria-hidden="true">
        {code.slice(0, 2)}
      </span>
    )
  }
  return (
    <img
      className={styles.flag}
      style={style}
      src={flagSrc(code)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
