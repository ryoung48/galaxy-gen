type PieData = {
  id: string
  label: string
  value: number
  color: string
}

export type PieChartProps = {
  total: number
  data: PieData[]
}
