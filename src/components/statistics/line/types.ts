export type LineChartProps = {
  data: { id: string; color: string; data: { x: number | string; y: number }[] }[]
  axis: { x: string }
  colors: string[]
}
