import { Grid } from '@mui/material'
import { CodexPage } from '../common/CodexPage'
import { Orbit } from '../../model/system/orbits/types'
import { ORBIT } from '../../model/system/orbits'
import { TEXT } from '../../model/utilities/text'
import { Fragment } from 'react'
import { MATH } from '../../model/utilities/math'

function describeEccentricity(eccentricity: number): string {
  if (eccentricity === 0) {
    return 'Circular orbit'
  } else if (eccentricity > 0 && eccentricity < 0.2) {
    return 'Low, nearly circular orbit'
  } else if (eccentricity >= 0.2 && eccentricity < 0.4) {
    return 'Moderate, slightly elliptical orbit'
  } else if (eccentricity >= 0.4 && eccentricity < 0.7) {
    return 'High, distinctly elliptical orbit'
  } else if (eccentricity >= 0.7 && eccentricity < 1) {
    return 'Very high, highly elliptical orbit'
  }
  return 'Parabolic orbit'
}

function describeAxialTilt(axialTilt: number): string {
  if (axialTilt === 0) {
    return 'None, very stable climate'
  } else if (axialTilt > 0 && axialTilt <= 5) {
    return 'Minimal, very stable climate'
  } else if (axialTilt > 5 && axialTilt <= 15) {
    return 'Low, mild seasons'
  } else if (axialTilt > 15 && axialTilt <= 35) {
    return 'Moderate, noticeable seasons'
  } else if (axialTilt > 35 && axialTilt <= 70) {
    return 'High, extreme seasonal variations'
  } else if (axialTilt > 70 && axialTilt <= 90) {
    return 'Very high, polar conditions dominate'
  } else if (axialTilt > 90 && axialTilt < 135) {
    return 'Retrograde rotation, extreme climate patterns'
  } else if (axialTilt >= 135 && axialTilt < 180) {
    return 'Extreme retrograde rotation, very unstable climate'
  }
  return 'Fully retrograde rotation (inverted orientation)'
}

function describeRotation(rotationHours: number): string {
  if (rotationHours >= 1 && rotationHours <= 6) {
    return 'Very fast'
  } else if (rotationHours > 6 && rotationHours <= 12) {
    return 'Fast'
  } else if (rotationHours > 12 && rotationHours <= 24) {
    return 'Moderate'
  } else if (rotationHours > 24 && rotationHours <= 48) {
    return 'Slow'
  } else if (rotationHours > 48 && rotationHours <= 100) {
    return 'Very slow'
  } else if (rotationHours > 100 && rotationHours <= 1000) {
    return 'Extremely slow'
  } else {
    return 'Tidally locked'
  }
}

const OrbitView = (props: { orbit: Orbit }) => {
  const orbit = props.orbit
  const parent = ORBIT.parent(orbit)
  const moon = parent.tag !== 'star' && parent.group !== 'asteroid belt'
  const asteroid = orbit.type === 'asteroid'
  const { atmosphere } = orbit
  const hydro = ORBIT.hydrospheres[orbit.hydrosphere.code]
  return (
    <CodexPage
      title={ORBIT.name(orbit)}
      subtitle={`${orbit.type}${asteroid ? '' : moon ? ' moon' : ' planet'}${
        orbit.subtype
          ? ` (${orbit.subtype}${orbit.chemistry ? `, ${orbit.chemistry}` : ''}${
              orbit.rings ? `, ${orbit.rings} rings` : ''
            })`
          : ''
      }`}
      content={
        <Grid container>
          <Grid item xs={12} pb={2}>
            <i>{ORBIT.describe(orbit)}</i>
          </Grid>
          <Grid item xs={12}>
            <b>Distance: </b> {MATH.orbits.fromAU(orbit.au).toFixed(2)} ({orbit.au.toFixed(2)} AU)
          </Grid>
          <Grid item xs={12}>
            <b>Eccentricity: </b> {orbit.eccentricity.toFixed(2)} (
            {describeEccentricity(orbit.eccentricity)})
          </Grid>
          <Grid item xs={12}>
            <b>Period: </b> {MATH.time.convertYears(orbit.period)}
          </Grid>
          <Grid item xs={12}>
            <b>Axial Tilt: </b> {orbit.axialTilt.toFixed(2)}° ({describeAxialTilt(orbit.axialTilt)})
          </Grid>
          <Grid item xs={12}>
            <b>Rotation: </b> {`${orbit.rotation} hours`} ({describeRotation(orbit.rotation)})
          </Grid>
          <Grid item xs={12}>
            <b>Size: </b>({orbit.size}) {orbit.diameter.toFixed(2)}⊕ (D), {orbit.mass.toFixed(3)}⊕
            (M), {orbit.gravity.toFixed(2)} (G)
          </Grid>
          <Grid item xs={12}>
            <b>Atmosphere: </b> ({orbit.atmosphere.code}) {TEXT.capitalize(atmosphere.type)}{' '}
            {atmosphere.subtype
              ? `(${atmosphere.subtype}${
                  atmosphere.tainted ? `, ${atmosphere.code === 10 ? 'irritant' : 'tainted'}` : ''
                }${atmosphere.hazard ? `, ${atmosphere.hazard}` : ''}${
                  atmosphere.unusual ? `, ${atmosphere.unusual}` : ''
                })`
              : ''}
          </Grid>
          <Grid item xs={12}>
            <b>Temperature: </b> {MATH.temperature.celsius(orbit.temperature.kelvin).toFixed(2)}°C (
            {TEXT.capitalize(orbit.temperature.desc)})
          </Grid>
          <Grid item xs={12}>
            <b>Hydrosphere: </b> ({orbit.hydrosphere.code}){' '}
            {hydro.range ? `${hydro.range} (${hydro.description})` : hydro.description}
          </Grid>
          <Grid item xs={12}>
            <b>Biosphere: </b> ({orbit.biosphere.complexity}){' '}
            {ORBIT.biospheres[orbit.biosphere.complexity]}
          </Grid>
          <Grid item xs={12}>
            <b>Habitability: </b> {orbit.habitability.toFixed(2)}
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
