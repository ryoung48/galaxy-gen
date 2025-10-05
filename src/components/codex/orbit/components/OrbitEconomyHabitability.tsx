import { Grid, Tooltip } from '@mui/material'
import Icon from '@mdi/react'
import { mdiHeart } from '@mdi/js'
import type { Orbit } from '../../../../model/system/orbits/types'
import { METRICS } from '../../../maps/legend/metrics'
import { describeHabitability } from './OrbitUtils'
import { HabitabilityTooltip } from './OrbitTooltips'

export default function OrbitEconomyHabitability({ orbit }: { orbit: Orbit }) {
  return (
    <>
      {/* <Grid item xs={12}>
        <Icon
          path={mdiRing}
          size={0.7}
          color={getResourceColor(orbit.resources)}
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Resources: </b> ({TEXT.toHex(orbit.resources)}) {getResourceDescription(orbit.resources)}
      </Grid> */}
      <Grid item xs={12}>
        <Icon
          path={mdiHeart}
          size={0.7}
          color={METRICS.habitability.color(orbit.habitability.score)}
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Habitability: </b> (
        <Tooltip
          title={
            <HabitabilityTooltip
              trace={orbit.habitability.trace}
              finalValue={orbit.habitability.score}
            />
          }
          placement='right'
          arrow
        >
          <span style={{ cursor: 'pointer', borderBottom: '1px dotted black' }}>
            {orbit.habitability.score}
          </span>
        </Tooltip>
        ) {describeHabitability(orbit.habitability.score)}
      </Grid>
    </>
  )
}
