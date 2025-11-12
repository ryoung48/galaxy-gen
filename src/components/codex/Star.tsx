import { Grid, Tooltip } from '@mui/material'
import Icon from '@mdi/react'
import {
  mdiTimerSand,
  mdiRuler,
  mdiOrbit,
  mdiClockOutline,
  mdiWeight,
  mdiRulerSquare,
  mdiBrightness5,
  mdiFire,
  mdiMinusCircleOutline,
  mdiSprout
} from '@mdi/js'

import { TEXT } from '../../model/utilities/text'
import { CodexPage } from '../common/CodexPage'
import { StyledText } from '../common/StyledText'
import { COLORS } from '../../theme/colors'
import { Star } from '../../model/system/stars/types'
import { STAR } from '../../model/system/stars'
import { MATH } from '../../model/utilities/math'
import { CONSTANTS } from '../../model/constants'
import { SOLAR_SYSTEM } from '../../model/system'

// Custom simple circle path (filled) for planet/moon icon
const mdiSphere = 'M12,2A10,10 0 1,0 22,12A10,10 0 0,0 12,2Z'

const formatters = {
  temperature: new Intl.NumberFormat('en-US', {
    style: 'unit',
    unit: 'celsius',
    notation: 'compact'
  }),
  luminosity: new Intl.NumberFormat('en-US', { notation: 'compact', minimumFractionDigits: 8 })
}

const tooltipStyles = { cursor: 'pointer', borderBottom: '1px dotted black' }

// Temperature color gradient (cold to hot)
const getTemperatureColor = (celsius: number): string => {
  if (celsius < -50) return '#1e90ff' // very cold
  if (celsius < 0) return '#00bfff' // cold
  if (celsius < 30) return '#32cd32' // temperate
  if (celsius < 60) return '#ffa500' // warm
  if (celsius < 100) return '#ff8c00' // hot
  return '#ff4500' // scorching
}

const StarView = (props: { star: Star }) => {
  const star = props.star
  const age =
    star.age < 1
      ? `${(star.age * 1000).toFixed(2)} million years`
      : star.age >= 1000
      ? `${(star.age / 1000).toFixed(2)} trillion years`
      : `${star.age.toFixed(2)} billion years`
  const brownDwarf = STAR.isBrownDwarf(star.spectralClass)
  const postStellar = star.postStellar
  const system = window.galaxy.systems[star.system]
  return (
    <CodexPage
      title={STAR.name(star)}
      subtitle={
        <>
          <Icon
            path={mdiSphere}
            size={0.5}
            color={STAR.color(star)}
            style={{ verticalAlign: 'middle', marginRight: 4, marginBottom: 3 }}
          />
          <StyledText
            text={`Star (${star.spectralClass}${postStellar ? '' : star.subtype}${
              brownDwarf || postStellar ? '' : `-${star.luminosityClass}`
            }), ${TEXT.decorate({
              link: system,
              label: SOLAR_SYSTEM.name(system),
              color: COLORS.subtitle
            })}`}
          />
        </>
      }
      content={
        <Grid container>
          <Grid item xs={12}>
            <Icon
              path={mdiTimerSand}
              size={0.7}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Age: </b> {age}
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiRuler}
              size={0.7}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Distance: </b> {MATH.orbits.fromAU(star.au).toFixed(3)} ({star.au.toFixed(2)} AU)
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiMinusCircleOutline}
              size={0.7}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Minimum Orbit: </b> {star.mao.toFixed(3)} ({MATH.orbits.toAU(star.mao).toFixed(2)}{' '}
            AU)
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiSprout}
              size={0.7}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Habitable Zone: </b> {star.hzco.toFixed(3)} ({MATH.orbits.toAU(star.hzco).toFixed(2)}{' '}
            AU)
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiOrbit}
              size={0.7}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Eccentricity: </b> {star.eccentricity.toFixed(2)}
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiClockOutline}
              size={0.7}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Period: </b> {MATH.time.convertYears(star.period)}
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiWeight}
              size={0.7}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Mass: </b> {star.mass.toFixed(2)} ☉
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiRulerSquare}
              size={0.7}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Diameter: </b>{' '}
            <Tooltip
              title={TEXT.formatters.compact((star.diameter * CONSTANTS.R * 2) / 1e3) + ' km'}
              placement='top'
              arrow
            >
              <span style={tooltipStyles}>{star.diameter.toFixed(2)}</span>
            </Tooltip>{' '}
            ☉ ({star.r})
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiBrightness5}
              size={0.7}
              color={STAR.color(star)}
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Luminosity: </b> {formatters.luminosity.format(star.luminosity)} ☉
          </Grid>
          <Grid item xs={12}>
            <Icon
              path={mdiFire}
              size={0.7}
              color={getTemperatureColor(MATH.temperature.celsius(star.temperature))}
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Temperature: </b>{' '}
            {formatters.temperature.format(MATH.temperature.celsius(star.temperature))}
          </Grid>
        </Grid>
      }
    ></CodexPage>
  )
}

export default StarView
