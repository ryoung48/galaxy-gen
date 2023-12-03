import * as jdenticon from 'jdenticon'
import React, { useEffect, useRef } from 'react'
import { HERALDRY } from './common'

interface IdenticonProps {
  value: string
  size: number
  config?: jdenticon.JdenticonConfig
}

export const Heraldry: React.FC<IdenticonProps> = ({ value, size, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shieldSize = size * 1.5
  const backColor = config?.backColor ?? '#ffffff'
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    HERALDRY.draw({
      ctx,
      x: size * 0.05,
      y: size * 0.05,
      h: shieldSize,
      w: shieldSize * 0.8,
      borderWidth: 2,
      backColor
    })
    ctx.save()
    ctx.translate(size * 0.16, size * 0.18)
    jdenticon.drawIcon(ctx, value, size, { backColor: '#ffffff', ...config })
    ctx.restore()
  }, [value, size, shieldSize, backColor, config])

  return (
    <canvas
      ref={canvasRef}
      data-jdenticon-value={value}
      width={size * 1.5}
      height={size * 1.5}
      style={{
        backgroundColor: 'transparent'
      }}
    ></canvas>
  )
}
