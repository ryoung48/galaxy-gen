// install (please try to align the version of installed @nivo packages)
// yarn add @nivo/line
import { ResponsiveLine } from '@nivo/line'
import { LineChartProps } from './types'

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const CustomLineChart = ({ data, axis, colors }: LineChartProps) => (
  <div style={{ height: 800, width: '100%' }}>
    <ResponsiveLine
      data={data}
      colors={colors}
      margin={{ top: 50, right: 110, bottom: 100, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: true,
        reverse: false
      }}
      yFormat=' >-.2f'
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: axis.x,
        legendOffset: 36,
        legendPosition: 'middle',
        truncateTickAt: 0
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'count',
        legendOffset: -40,
        legendPosition: 'middle',
        truncateTickAt: 0
      }}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabel='data.yFormatted'
      pointLabelYOffset={-12}
      enableTouchCrosshair={true}
      useMesh={true}
    />
  </div>
)

export default CustomLineChart
