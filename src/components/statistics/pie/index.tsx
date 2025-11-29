import { useState, useMemo } from 'react'
import { ResponsivePie } from '@nivo/pie'
import { PieChartProps } from './types'
import { FONT } from '../../../theme/fonts'
import { TEXT } from '../../../model/utilities/text'

export const CustomPieChart = ({ data, total }: PieChartProps) => {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())

  const visibleData = useMemo(() => {
    return data.filter(item => !hiddenIds.has(item.id))
  }, [data, hiddenIds])

  const handleLegendClick = (datum: { id: string | number }) => {
    const id = String(datum.id)
    setHiddenIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div style={{ height: 800, width: '100%' }}>
      <ResponsivePie
        data={visibleData}
        theme={{
          text: {
            fontFamily: FONT.content
          }
        }}
        colors={{ datum: 'data.color' }}
        valueFormat={value => TEXT.formatters.percent(value / total, 2)}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.2]]
        }}
        arcLinkLabelsSkipAngle={8}
        arcLinkLabelsTextColor='#333333'
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 2]]
        }}
        legends={[
          {
            anchor: 'bottom-left',
            direction: 'column',
            justify: false,
            translateX: 0,
            translateY: 5,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: '#000000',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 12,
            symbolShape: 'circle',
            data: data.map(item => ({
              id: item.id,
              label: item.label,
              color: item.color,
              hidden: hiddenIds.has(item.id)
            })),
            onClick: handleLegendClick
          }
        ]}
      />
    </div>
  )
}
