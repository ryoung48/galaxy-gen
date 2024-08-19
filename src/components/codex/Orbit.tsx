import { Grid } from '@mui/material'
import { CodexPage } from '../common/CodexPage'
import { Orbit } from '../../model/system/orbits/types'
import { ORBIT } from '../../model/system/orbits'
import { TEXT } from '../../model/utilities/text'
import { Fragment } from 'react'

const OrbitView = (props: { orbit: Orbit }) => {
  const orbit = props.orbit
  const parent = ORBIT.parent(orbit)
  const moon = parent.tag !== 'star' && parent.group !== 'asteroid belt'
  const asteroid = orbit.type === 'asteroid'
  return (
    <CodexPage
      title={ORBIT.name(orbit)}
      subtitle={`${orbit.type}${asteroid ? '' : moon ? ' moon' : ' planet'}${
        orbit.subtype ? ` (${orbit.subtype}, ${orbit.chemistry})` : ''
      }${orbit.rings ? ` (${orbit.rings} rings)` : ''}`}
      content={
        <Grid container>
          <Grid item xs={12} pb={2}>
            <i>{ORBIT.describe(orbit)}</i>
          </Grid>
          <Grid item xs={12}>
            <b>Size: </b> {ORBIT.sizes[orbit.size]}
          </Grid>
          <Grid item xs={12}>
            <b>Atmosphere: </b> {ORBIT.atmospheres[orbit.atmosphere]}
          </Grid>
          <Grid item xs={12}>
            <b>Temperature: </b> {TEXT.capitalize(orbit.temperature)}
          </Grid>
          <Grid item xs={12}>
            <b>Hydrosphere: </b> {ORBIT.hydrospheres[orbit.hydrosphere]}
          </Grid>
          <Grid item xs={12}>
            <b>Biosphere: </b> {TEXT.capitalize(orbit.biosphere.type)}
          </Grid>
          {orbit.population > 0 && (
            <Fragment>
              <Grid item xs={12}>
                <b>Population: </b> {TEXT.capitalize(orbit.habitation)} (
                {ORBIT.populations[orbit.population]})
              </Grid>
              <Grid item xs={12}>
                <b>Government: </b> {ORBIT.governments[orbit.government]}
              </Grid>
              <Grid item xs={12}>
                <b>Law: </b> {ORBIT.lawLevel(orbit.law)}
              </Grid>
            </Fragment>
          )}
        </Grid>
      }
    ></CodexPage>
  )
}

export default OrbitView
