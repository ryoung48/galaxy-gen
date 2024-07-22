import { createContext, Dispatch, useContext } from 'react'

import { ViewActions, ViewState } from './types'
import { GALAXY } from '../model/galaxy'
import { DICE } from '../model/utilities/dice'

const init: ViewState = {
  id: '',
  selected: null
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
      case 'init': {
        const start = DICE.swap(window.galaxy.seed, () => window.dice.choice(GALAXY.worlds()))
        return { id: action.payload.id, selected: start }
      }
      case 'transition': {
        const updated = { ...state, selected: action.payload }
        return updated
      }
    }
  },
  system: ({ selected }: ViewState) => {
    if (selected?.tag === 'system') return selected
    if (selected?.tag === 'star') return window.galaxy.systems[selected.system]
    if (selected?.tag === 'orbit') return window.galaxy.systems[selected.system]
  }
}
