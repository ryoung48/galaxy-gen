import { createContext, Dispatch, useContext } from 'react'

import { ViewActions, ViewState } from './types'
import { STAR } from '../model/system/stars'
import { SATELLITE } from '../model/system/satellites'

const init: ViewState = {
  id: '',
  selected: { type: 'system', id: 0 }
}

export const ViewContext = createContext(
  {} as {
    state: ViewState
    dispatch: Dispatch<ViewActions>
  }
)

export const VIEW = {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  context: () => useContext(ViewContext),
  init,
  reducer: (state: ViewState, action: ViewActions): ViewState => {
    switch (action.type) {
      case 'transition': {
        const updated = { ...state, selected: action.payload }
        return updated
      }
    }
  },
  system: ({ selected }: ViewState) => {
    if (selected.type === 'system') return window.galaxy.systems[selected.id]
    else if (selected.type === 'star') {
      const star = window.galaxy.stars[selected.id]
      return STAR.system(star)
    } else if (selected.type === 'satellite') {
      const satellite = window.galaxy.satellites[selected.id]
      return SATELLITE.system(satellite)
    }
  }
}
