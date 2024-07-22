import { ResponsiveChord } from '@nivo/chord'
import { ChordChartProps } from './types'

export const CustomChordChart = ({ data, keys, colors }: ChordChartProps) => {
  return (
    <div style={{ height: 800, width: '100%' }}>
      <ResponsiveChord
        data={data}
        keys={keys}
        margin={{ top: 60, right: 60, bottom: 90, left: 60 }}
        valueFormat='.2f'
        padAngle={0.02}
        innerRadiusRatio={0.96}
        innerRadiusOffset={0.02}
        inactiveArcOpacity={0.25}
        arcBorderColor={{
          from: 'color',
          modifiers: [['darker', 0.6]]
        }}
        activeRibbonOpacity={0.75}
        inactiveRibbonOpacity={0.25}
        ribbonBorderColor={{
          from: 'color',
          modifiers: [['darker', 0.6]]
        }}
        labelRotation={-90}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1]]
        }}
        colors={d => colors[d.index]}
        motionConfig='stiff'
      />
    </div>
  )
}
