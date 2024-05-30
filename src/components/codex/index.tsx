import { VIEW } from '../../context'
import NationView from './Nation'
import SatelliteView from './Satellite'
import SolarSystemView from './SolarSystem'
import StarView from './Star'

export default function Codex() {
  const { state } = VIEW.context()
  return (
    <div>
      {state.selected.type === 'system' && <SolarSystemView />}
      {state.selected.type === 'nation' && <NationView />}
      {state.selected.type === 'star' && <StarView />}
      {state.selected.type === 'satellite' && <SatelliteView />}
    </div>
  )
}
