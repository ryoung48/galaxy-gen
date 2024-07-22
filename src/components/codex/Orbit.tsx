import { Grid } from '@mui/material'
import { CodexPage } from '../common/CodexPage'
import { Orbit } from '../../model/system/orbits/types'
import { ORBIT } from '../../model/system/orbits'
import { TEXT } from '../../model/utilities/text'

const OrbitView = (props: { orbit: Orbit }) => {
  const orbit = props.orbit
  const parent = ORBIT.parent(orbit)
  const moon = parent.tag !== 'star' && parent.group !== 'asteroid belt'
  return (
    <CodexPage
      title={ORBIT.name(orbit)}
      subtitle={`${orbit.type} ${moon ? 'moon' : 'planet'}${
        orbit.subtype ? ` (${orbit.subtype}, ${orbit.chemistry})` : ''
      }`}
      content={
        <Grid container>
          <Grid item xs={12} pb={2}>
            <i>{ORBIT.describe(orbit)}</i>
          </Grid>
          <Grid item xs={12}>
            <b>Size: </b> <i>{TEXT.capitalize(orbit.group)}.</i> {ORBIT.sizes[orbit.size]} [
            {orbit.size}]
          </Grid>
          <Grid item xs={12}>
            <b>Atmosphere: </b> {ORBIT.atmospheres[orbit.atmosphere]} [{orbit.atmosphere}]
          </Grid>
          <Grid item xs={12}>
            <b>Hydrosphere: </b> {ORBIT.hydrospheres[orbit.hydrosphere]} [{orbit.hydrosphere}]
          </Grid>
          <Grid item xs={12}>
            <b>Biosphere: </b> {ORBIT.biospheres[orbit.biosphere]} [{orbit.biosphere}]
          </Grid>
        </Grid>
      }
    ></CodexPage>
  )
}

export default OrbitView
