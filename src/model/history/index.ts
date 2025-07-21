import { NATION } from '../nations'
import { Nation } from '../nations/types'
import { SolarSystem } from '../system/types'
import { ConstructionEvent, SurveyEvent, TravelEvent } from './types'
import { SOLAR_SYSTEM } from '../system'
import { LANGUAGE } from '../languages'

export const HISTORY = {
  tick: () => {
    const event = window.galaxy.futures.dequeue()
    if (event) {
      window.galaxy.time = event.time
      window.galaxy.past.push(event)
      switch (event.tag) {
        case 'construction':
          HISTORY.events.construction.tick(event)
          break
        case 'survey':
          HISTORY.events.survey.tick(event)
          break
        case 'travel':
          HISTORY.events.travel.tick(event)
          break
      }
    }
  },
  events: {
    construction: {
      spawn: (params: { nation: Nation; system: SolarSystem }) => {
        const { nation, system } = params
        window.galaxy.futures.queue({
          tag: 'construction',
          time: window.galaxy.time + 100,
          system: system.idx,
          nation: nation.idx
        })
      },
      tick: (event: ConstructionEvent) => {
        const nation = window.galaxy.nations[event.nation]
        const system = window.galaxy.systems[event.system]
        // Only process if system is unclaimed
        if (system.nation === -1) {
          system.nation = nation.idx
          system.name = LANGUAGE.word.unique({ lang: nation.language, key: 'solar system' })
          // Add system to nation's systems array if not already present
          if (!nation.systems.includes(system.idx)) {
            nation.systems.push(system.idx)
          }
        }

        HISTORY.events.travel.spawn(nation)
      }
    },
    survey: {
      spawn: (params: { nation: Nation; system: SolarSystem }) => {
        const { nation, system } = params
        const orbits = SOLAR_SYSTEM.orbits(system)
        window.galaxy.futures.queue({
          tag: 'survey',
          time: window.galaxy.time + orbits.length * 20,
          system: system.idx,
          nation: nation.idx
        })
      },
      tick: (event: SurveyEvent) => {
        const nation = window.galaxy.nations[event.nation]
        const system = window.galaxy.systems[event.system]
        // Only process if system is unclaimed
        if (system.nation !== -1) HISTORY.events.travel.spawn(nation)
        else HISTORY.events.construction.spawn({ nation, system })
      }
    },
    travel: {
      spawn: (nation: Nation) => {
        const spread = NATION.borders(nation)
        if (spread.length > 0) {
          window.galaxy.futures.queue({
            tag: 'travel',
            time: window.galaxy.time + 60,
            to: window.dice.choice(spread).idx,
            nation: nation.idx
          })
        }
      },
      tick: (event: TravelEvent) => {
        const nation = window.galaxy.nations[event.nation]
        const system = window.galaxy.systems[event.to]
        HISTORY.events.survey.spawn({ nation, system })
      }
    }
  }
}
