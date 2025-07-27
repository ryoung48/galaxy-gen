import { Grid } from '@mui/material'
import { CodexPage } from '../common/CodexPage'
import { Orbit } from '../../model/system/orbits/types'
import { ORBIT } from '../../model/system/orbits'
import { TEXT } from '../../model/utilities/text'
import { Fragment } from 'react'
import { MATH } from '../../model/utilities/math'
import { COLORS } from '../../theme/colors'
import { StyledText } from '../common/StyledText'
import { TEMPERATURE } from '../../model/system/orbits/temperature'
import { METRICS } from '../maps/legend/metrics'
import { ATMOSPHERE } from '../../model/system/orbits/atmosphere'
import { HYDROSPHERE } from '../../model/system/orbits/hydrosphere'
import Icon from '@mdi/react'
import {
  mdiRuler,
  mdiClockOutline,
  mdiRotate3dVariant,
  mdiOrbit,
  mdiCompass,
  mdiCloudOutline,
  mdiSnowflake,
  mdiWeatherSunny,
  mdiFire,
  mdiWater,
  mdiWaterOff,
  mdiWaterOutline,
  mdiWeatherHurricane,
  mdiHeart,
  mdiAccountGroup,
  mdiGrass,
  mdiEarth,
  mdiCog
  // mdiTerrain
} from '@mdi/js'
import { SIZE } from '../../model/system/orbits/groups'
import { BIOSPHERE } from '../../model/system/orbits/biosphere'

// Custom simple circle path (filled) for planet/moon icon
const mdiSphere = 'M12,2A10,10 0 1,0 22,12A10,10 0 0,0 12,2Z'

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

function describeTechnology(tech: number): string {
  if (tech === 0) return 'No industry'
  if (tech >= 1 && tech <= 3) return 'Primitive'
  if (tech >= 4 && tech <= 6) return 'Industrial'
  if (tech >= 7 && tech <= 9) return 'Early Stellar'
  if (tech >= 10 && tech <= 11) return 'Late Stellar'
  if (tech >= 12 && tech <= 14) return 'Low Imperial'
  if (tech >= 15) return 'High Imperial'
  return `Tech Level ${tech}`
}

const formatters = {
  population: new Intl.NumberFormat('en-US', { notation: 'compact' })
}

// Temperature color gradient (cold to hot)
const getTemperatureColor = (celsius: number): string => {
  if (celsius < -50) return '#a2d6f8' // very cold
  if (celsius < 0) return '#00bfff' // cold
  if (celsius < 30) return '#32cd32' // temperate
  if (celsius < 60) return '#ffa500' // warm
  if (celsius < 100) return '#ff8c00' // hot
  return '#ff4500' // scorching
}

// Choose mdi path based on climate description
const getClimateIconPath = (climate: string) => {
  switch (climate) {
    case 'frozen':
    case 'cold':
      return mdiSnowflake
    case 'temperate':
    case 'hot':
      return mdiWeatherSunny
    case 'burning':
      return mdiFire
    default:
      return mdiWeatherSunny
  }
}

// Choose mdi path based on hydrosphere code
const getHydrosphereIconPath = (code: number) => {
  if (code === 0) return mdiWaterOff // arid, barren
  if (code <= 2) return mdiWaterOutline // dry to semi-arid
  if (code <= 12) return mdiWater // moderate water presence
  return mdiWeatherHurricane // gas-giant core or exotic cases
}

// // Color mapping for composition types
// const compositionColor: Record<Orbit['composition']['type'], string> = {
//   rocky: '#c2a679', // tan / rock
//   ice: '#a2d6f8', // light blue ice
//   metallic: '#c0c0c0', // silver
//   gas: '#e8daef' // pale yellow
// }

const OrbitView = (props: { orbit: Orbit }) => {
  const orbit = props.orbit
  const parent = ORBIT.parent(orbit)
  const moon = parent.tag !== 'star' && parent.group !== 'asteroid belt'
  const asteroid = orbit.group === 'asteroid belt'
  const { atmosphere } = orbit
  const hydro = HYDROSPHERE.labels.find(h => h.code === orbit.hydrosphere.code)
  return (
    <CodexPage
      title={ORBIT.name(orbit)}
      subtitle={
        <Fragment>
          <Icon
            path={mdiSphere}
            size={0.5}
            color={ORBIT.colors(orbit)}
            style={{ verticalAlign: 'middle', marginRight: 4, marginBottom: 1 }}
          />
          <StyledText
            text={`${orbit.type}${asteroid ? '' : moon ? ' moon' : ' planet'}${
              orbit.subtype
                ? ` (${orbit.subtype}${orbit.chemistry ? `, ${orbit.chemistry}` : ''})`
                : ''
            }, ${TEXT.decorate({
              link: window.galaxy.systems[orbit.system],
              color: COLORS.subtitle
            })}`}
          ></StyledText>
        </Fragment>
      }
      content={
        <Grid container>
          <Grid item xs={12} pb={2}>
            <i>{ORBIT.describe(orbit)}</i>
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiRuler}
              size={0.7}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Distance: </b>{' '}
            {orbit.moon
              ? `${orbit.moon.pd.toFixed(2)} PD`
              : `${MATH.orbits.fromAU(orbit.au).toFixed(3)} (${orbit.au.toFixed(3)} AU)`}
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiClockOutline}
              size={0.7}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Period: </b>{' '}
            {orbit.moon
              ? MATH.time.convertHours(orbit.moon.period)
              : MATH.time.convertYears(orbit.period)}
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiRotate3dVariant}
              size={0.7}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Rotation: </b> {isFinite(orbit.rotation) ? `${orbit.rotation} hours` : 'Infinite'} (
            {describeRotation(orbit.rotation)})
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiOrbit}
              size={0.7}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Eccentricity: </b> {orbit.eccentricity.toFixed(2)} (
            {describeEccentricity(orbit.eccentricity)})
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiCompass}
              size={0.7}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Axial Tilt: </b> {orbit.axialTilt.toFixed(2)}° ({describeAxialTilt(orbit.axialTilt)})
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiEarth}
              size={0.7}
              color={SIZE.colors(orbit.size)}
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Size: </b>({orbit.size}) {orbit.diameter.toFixed(2)}⊕ (D), {orbit.mass.toFixed(3)}⊕
            (M), {orbit.gravity.toFixed(2)} (G)
          </Grid>
          {/* <Grid item xs={12}>
            <Icon
              path={mdiTerrain}
              size={0.7}
              color={compositionColor[orbit.composition.type]}
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Composition: </b>{' '}
            {TEXT.title(orbit.composition.description ?? orbit.composition.type)}
          </Grid> */}
          <Grid item xs={12}>
            <Icon
              path={mdiCloudOutline}
              size={0.7}
              color={ATMOSPHERE.color(atmosphere.code)}
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
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
            {(() => {
              const climate = TEMPERATURE.describe(orbit.temperature.mean)
              return (
                <Icon
                  path={getClimateIconPath(climate)}
                  size={0.7}
                  color={getTemperatureColor(MATH.temperature.celsius(orbit.temperature.mean))}
                  style={{ verticalAlign: 'middle', marginRight: 4 }}
                />
              )
            })()}
            <b>Temperature: </b> {MATH.temperature.celsius(orbit.temperature.mean).toFixed(2)}°C (
            {TEMPERATURE.describe(orbit.temperature.mean)}){' '}
            <span style={{ color: COLORS.subtitle }}>
              [{MATH.temperature.celsius(orbit.temperature.low).toFixed(1)}°C,{' '}
              {MATH.temperature.celsius(orbit.temperature.high).toFixed(1)}°C]
            </span>
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={getHydrosphereIconPath(orbit.hydrosphere.code)}
              size={0.7}
              color={HYDROSPHERE.color[orbit.hydrosphere.code]}
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Hydrosphere: </b> ({orbit.hydrosphere.code}){' '}
            {hydro?.range ? `${hydro.range} (${hydro.description})` : hydro?.description}
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiGrass}
              size={0.7}
              color={METRICS.biosphere.color(orbit.biosphere)}
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Biosphere: </b> ({orbit.biosphere}) {BIOSPHERE.labels[orbit.biosphere]}
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiHeart}
              size={0.7}
              color={METRICS.habitability.color(orbit.habitability)}
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Habitability: </b> ({orbit.habitability}) {describeHabitability(orbit.habitability)}
          </Grid>
          {orbit.technology !== undefined && (
            <Grid item xs={12}>
              <Icon
                path={mdiCog}
                size={0.7}
                color={METRICS.tech.color(orbit.technology)}
                style={{ verticalAlign: 'middle', marginRight: 4 }}
              />
              <b>Industry: </b> ({orbit.technology}) {describeTechnology(orbit.technology)}
            </Grid>
          )}
          {orbit.population && (
            <Fragment>
              <Grid item xs={12}>
                <Icon
                  path={mdiAccountGroup}
                  size={0.7}
                  color={METRICS.population.color(orbit.population!.code)}
                  style={{ verticalAlign: 'middle', marginRight: 4 }}
                />
                <b>Population: </b> {formatters.population.format(orbit.population.size)}
              </Grid>
            </Fragment>
          )}
        </Grid>
      }
    ></CodexPage>
  )
}

export default OrbitView
