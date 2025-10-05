import { VIEW } from '../../context'
import NationView from './Nation'
import OrbitView from './orbit'
import SolarSystemView from './SolarSystem'
import StarView from './Star'

export default function Codex() {
  const { state } = VIEW.context()
  return (
    <div>
      {state.selected?.tag === 'system' && <SolarSystemView system={state.selected} />}
      {state.selected?.tag === 'nation' && <NationView nation={state.selected} />}
      {state.selected?.tag === 'star' && <StarView star={state.selected} />}
      {state.selected?.tag === 'orbit' && <OrbitView orbit={state.selected} />}
    </div>
  )
}
