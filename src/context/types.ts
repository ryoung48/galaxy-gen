export type ViewState = {
  id: string
  selected: {
    type: 'system' | 'nation' | 'star' | 'satellite'
    id: number
  }
}

export type ViewActions = { type: 'transition'; payload: ViewState['selected'] }
