import { css } from '@emotion/css'
import { VIEW } from '../../context'
import { ViewState } from '../../context/types'
import { CSSProperties } from 'react'
import { LazyTippy } from './LazyTippy'
import { STYLES } from '../styles'

const linkStyles = css`
  a {
    color: black;
    border-bottom: 1px solid black;
    &:hover {
      color: ${STYLES.accent} !important;
      border-bottom: 1px dotted ${STYLES.accent} !important;
    }
  }
`

const tags = ['system', 'nation', 'star', 'satellite'] as const

export function StyledText(props: { text: string; color?: string }) {
  const { dispatch } = VIEW.context()
  const { text } = props
  const baseColor = props.color ?? 'black'
  return (
    <span className={linkStyles}>
      {text.split(/@(.+?)@/g).map((text, j) => {
        if (text.match(/.+|.+|.+/)) {
          const [label, i, cat, tooltip, color, italics, bold, underline] = text.split('##')
          const tag = cat as ViewState['selected']['type']
          const idx = parseInt(i)
          const onClick = tags.includes(tag)
            ? () => dispatch({ type: 'transition', payload: { type: tag, id: idx } })
            : false
          const textColor = color !== '' ? color : baseColor
          const underlineColor = underline || textColor
          const style: CSSProperties = {
            cursor: onClick || tooltip ? 'pointer' : undefined,
            color: textColor,
            fontStyle: italics === 'true' ? 'italic' : undefined,
            fontWeight: bold === 'true' ? 'bold' : undefined,
            borderBottom: onClick
              ? `1px solid ${underlineColor}`
              : tooltip
              ? `1px dotted ${underlineColor}`
              : undefined
          }
          const link = onClick ? (
            <a style={style} onClick={onClick}>
              {label}
            </a>
          ) : (
            <span style={style}>{label}</span>
          )
          return (
            <span key={j}>
              {tooltip ? (
                <LazyTippy arrow={false} animation='scale' content={tooltip}>
                  {link}
                </LazyTippy>
              ) : (
                link
              )}
            </span>
          )
        }
        return (
          <span key={j} style={{ color: baseColor }}>
            {text}
          </span>
        )
      })}
    </span>
  )
}
