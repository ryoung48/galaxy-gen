import { Grid } from '@mui/material'
import { CodexPage } from '../common/CodexPage'
import { Orbit } from '../../model/system/orbits/types'
import { ORBIT } from '../../model/system/orbits'
import { TEXT } from '../../model/utilities/text'
import { Fragment } from 'react'
import { MATH } from '../../model/utilities/math'
import { COLORS } from '../../theme/colors'
import { StyledText } from '../common/StyledText'

function describeEccentricity(eccentricity: number): string {
  if (eccentricity === 0) {
    return 'circular orbit'
  } else if (eccentricity > 0 && eccentricity < 0.2) {
    return 'nearly circular orbit'
  } else if (eccentricity >= 0.2 && eccentricity < 0.4) {
    return 'slightly elliptical orbit'
  } else if (eccentricity >= 0.4 && eccentricity < 0.7) {
    return 'distinctly elliptical orbit'
  } else if (eccentricity >= 0.7 && eccentricity < 1) {
    return 'highly elliptical orbit'
  }
  return 'parabolic orbit'
}

function describeAxialTilt(axialTilt: number): string {
  const retrograde = axialTilt > 90
  const tilt = retrograde ? 180 - axialTilt : axialTilt
  let desc = ''
  if (tilt === 0) {
    desc = 'no seasons'
  } else if (tilt > 0 && tilt <= 5) {
    desc = 'minimal seasons'
  } else if (tilt > 5 && tilt <= 15) {
    desc = 'mild seasons'
  } else if (tilt > 15 && tilt <= 35) {
    desc = 'moderate seasons'
  } else {
    desc = 'extreme seasons'
  }
  return `${desc}${retrograde ? ', retrograde' : ''}`
}

function describeRotation(rotationHours: number): string {
  if (rotationHours >= 1 && rotationHours <= 6) {
    return 'very fast'
  } else if (rotationHours > 6 && rotationHours <= 12) {
    return 'fast'
  } else if (rotationHours > 12 && rotationHours <= 24) {
    return 'moderate'
  } else if (rotationHours > 24 && rotationHours <= 48) {
    return 'slow'
  } else if (rotationHours > 48 && rotationHours <= 100) {
    return 'very slow'
  } else if (rotationHours > 100 && rotationHours <= 1000) {
    return 'extremely slow'
  } else {
    return 'tidally locked'
  }
}

function describeHabitability(rating: number): string {
  if (rating <= 0) {
    return 'Actively hostile world: not survivable without specialized equipment'
  } else if (rating >= 1 && rating <= 2) {
    return 'Barely habitable world: full protective equipment often needed'
  } else if (rating >= 3 && rating <= 5) {
    return 'Marginally survivable world with proper equipment'
  } else if (rating >= 6 && rating <= 7) {
    return 'Regionally habitable world: may require acclimation'
  } else if (rating >= 8 && rating <= 9) {
    return 'Suitable for human habitation with minimal equipment or acclimation'
  } else {
    return 'Terra-equivalent garden world'
  }
}

const formatters = {
  population: new Intl.NumberFormat('en-US', { notation: 'compact' })
}

const OrbitView = (props: { orbit: Orbit }) => {
  const orbit = props.orbit
  const parent = ORBIT.parent(orbit)
  const moon = parent.tag !== 'star' && parent.group !== 'asteroid belt'
  const asteroid = orbit.group === 'asteroid belt'
  const { atmosphere } = orbit
  const hydro = ORBIT.hydrospheres.find(h => h.code === orbit.hydrosphere.code)
  return (
    <CodexPage
      title={ORBIT.name(orbit)}
      subtitle={
        <StyledText
          text={`${orbit.type}${asteroid ? '' : moon ? ' moon' : ' planet'}${
            orbit.subtype
              ? ` (${orbit.subtype}${orbit.chemistry ? `, ${orbit.chemistry}` : ''}${
                  orbit.rings ? `, ${orbit.rings} rings` : ''
                })`
              : ''
          }, ${TEXT.decorate({
            link: window.galaxy.systems[orbit.system],
            color: COLORS.subtitle
          })}`}
        ></StyledText>
      }
      content={
        <Grid container>
          <Grid item xs={12} pb={2}>
            <i>{ORBIT.describe(orbit)}</i>
          </Grid>
          <Grid item xs={12}>
            <b>Distance: </b> {MATH.orbits.fromAU(orbit.au).toFixed(2)} ({orbit.au.toFixed(2)} AU)
          </Grid>
          <Grid item xs={12}>
            <b>Period: </b> {MATH.time.convertYears(orbit.period)}
          </Grid>
          <Grid item xs={12}>
            <b>Rotation: </b> {isFinite(orbit.rotation) ? `${orbit.rotation} hours` : 'Infinite'} (
            {describeRotation(orbit.rotation)})
          </Grid>
          <Grid item xs={12}>
            <b>Eccentricity: </b> {orbit.eccentricity.toFixed(2)} (
            {describeEccentricity(orbit.eccentricity)})
          </Grid>
          <Grid item xs={12}>
            <b>Axial Tilt: </b> {orbit.axialTilt.toFixed(2)}° ({describeAxialTilt(orbit.axialTilt)})
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
            {orbit.temperature.desc})
          </Grid>
          <Grid item xs={12}>
            <b>Hydrosphere: </b> ({orbit.hydrosphere.code}){' '}
            {hydro?.range ? `${hydro.range} (${hydro.description})` : hydro?.description}
          </Grid>
          <Grid item xs={12}>
            <b>Biosphere: </b> ({orbit.biosphere}) {ORBIT.biospheres[orbit.biosphere]}
          </Grid>
          <Grid item xs={12}>
            <b>Habitability: </b> ({orbit.habitability}) {describeHabitability(orbit.habitability)}
          </Grid>
          {orbit.population && (
            <Fragment>
              <Grid item xs={12}>
                <b>Population: </b> {formatters.population.format(orbit.population.size)} (
                {orbit.settlement})
              </Grid>
            </Fragment>
          )}
        </Grid>
      }
    ></CodexPage>
  )
}

export default OrbitView
