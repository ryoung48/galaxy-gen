type Event = {
  time: number
}

export type TravelEvent = Event & {
  tag: 'travel'
  to: number
  nation: number
}

export type SurveyEvent = Event & {
  tag: 'survey'
  system: number
  nation: number
}

export type ConstructionEvent = Event & {
  tag: 'construction'
  system: number
  nation: number
}

export type HistoryEvent = TravelEvent | SurveyEvent | ConstructionEvent
