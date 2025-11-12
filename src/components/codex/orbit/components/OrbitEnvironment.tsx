import { Grid, Tooltip } from '@mui/material'
import Icon from '@mdi/react'
import {
  mdiCloudOutline,
  mdiGrass,
  mdiHandshake,
  mdiSkullOutline,
  mdiDna,
  mdiAirFilter,
  mdiGasCylinder,
  mdiCheckCircle,
  mdiAlertOctagon,
  mdiInformationOutline,
  mdiCubeOutline
} from '@mdi/js'
import type { Orbit } from '../../../../model/system/orbits/types'
import { TEXT } from '../../../../model/utilities/text'
import { MATH } from '../../../../model/utilities/math'
import { ATMOSPHERE } from '../../../../model/system/orbits/atmosphere'
import { HYDROSPHERE } from '../../../../model/system/orbits/hydrosphere'
import { BIOSPHERE } from '../../../../model/system/orbits/biosphere'
import { METRICS } from '../../../maps/legend/metrics'
import { TEMPERATURE } from '../../../../model/system/orbits/temperature'
import { StyledText } from '../../../common/StyledText'
import { getClimateIconPath, getHydrosphereIconPath, getTemperatureColor } from './OrbitUtils'
import { TemperatureTooltip, BiosphereTooltip, TemperatureRangeTooltip } from './OrbitTooltips'

const tooltipStyles = { cursor: 'pointer', borderBottom: '1px dotted black' }

const getCompatibilityColor = (compatibility?: 'miscible' | 'immiscible' | 'hybrid'): string => {
  switch (compatibility) {
    case 'miscible':
      return '#4caf50' // green
    case 'hybrid':
      return '#ff9800' // orange
    case 'immiscible':
      return '#f44336' // red
    default:
      return '#999'
  }
}

const getSurvivalGearIcon = (gear: string): string => {
  if (gear.includes('Vacc Suit')) return mdiGasCylinder
  if (gear.includes('Respirator') || gear.includes('Filter')) return mdiAirFilter
  if (gear.includes('Air Supply')) return mdiGasCylinder
  if (gear.includes('HEV Suit')) return mdiCubeOutline
  if (gear === 'None') return mdiCheckCircle
  if (gear.includes('Not Survivable')) return mdiAlertOctagon
  return mdiInformationOutline // Varies cases
}

const getSurvivalGearColor = (): string => {
  return '#000000' // black for all survival gear icons
}

export default function OrbitEnvironment({ orbit }: { orbit: Orbit }) {
  const { atmosphere } = orbit
  const hydro = HYDROSPHERE.labels.find(h => h.code === orbit.hydrosphere.code)

  return (
    <>
      <Grid item xs={12}>
        <Icon
          path={mdiCloudOutline}
          size={0.7}
          color={ATMOSPHERE.color(atmosphere.code)}
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Atmosphere: </b> (
        <Tooltip title={`${orbit.atmosphere.bar.toFixed(1)} bar`} arrow placement='top'>
          <span style={tooltipStyles}>{TEXT.toHex(orbit.atmosphere.code)}</span>
        </Tooltip>
        ) {TEXT.capitalize(atmosphere.type)}{' '}
        <StyledText
          text={
            atmosphere.subtype
              ? `(${
                  atmosphere.subtype === 'unusual' ? TEXT.decorate({ label: atmosphere.subtype, tooltip: atmosphere.unusual }) : atmosphere.subtype +
                  (atmosphere.tainted
                    ? `, ${TEXT.decorate({ label: atmosphere.code === 10 ? 'irritant' : 'tainted', tooltip: atmosphere.hazard ?? 'unknown' })}`
                    : '')
                })`
              : ''
          }
        />
        {(() => {
          const gear = ATMOSPHERE.survivalGear(atmosphere.code)
          if (gear === 'None') return null
          return (
            <>
              {' '}•{' '}
              <Icon
                path={getSurvivalGearIcon(gear)}
                size={0.7}
                color={getSurvivalGearColor()}
                style={{ verticalAlign: 'middle', marginRight: 4 }}
              />
              {gear}
            </>
          )
        })()}
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
        <b>Temperature: </b> (
        <Tooltip
          title={
            <TemperatureTooltip
              {...TEMPERATURE.trace.mean(orbit)}
              finalValue={MATH.temperature.celsius(orbit.temperature.mean)}
            />
          }
          placement='right'
          arrow
        >
          <span style={tooltipStyles}>
            {TEXT.formatters.compact(MATH.temperature.celsius(orbit.temperature.mean))}°C
          </span>
        </Tooltip>
        ) {TEMPERATURE.describe(orbit.temperature.mean)}{' '}•{' '} Δ{' '}
        <Tooltip
          title={
            <TemperatureRangeTooltip
              {...TEMPERATURE.trace.delta(orbit)}
              high={orbit.temperature.high}
              low={orbit.temperature.low}
            />
          }
          placement='right'
          arrow
        >
          <span style={tooltipStyles}>{orbit.temperature.delta.value.toFixed(0)}°C</span>
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
        <Icon
          path={getHydrosphereIconPath(orbit.hydrosphere.code)}
          size={0.7}
          color={HYDROSPHERE.color[orbit.hydrosphere.code]}
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Hydrosphere: </b> ({TEXT.toHex(orbit.hydrosphere.code)}){' '}
        {hydro?.range ? `${hydro.range} (${hydro.description})` : hydro?.description}
      </Grid>
      <Grid item xs={12}>
        <Icon
          path={mdiGrass}
          size={0.7}
          color={METRICS.biosphere.color(orbit.biosphere.code)}
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Biosphere: </b> (
        <Tooltip
          title={
            <BiosphereTooltip trace={orbit.biosphere.trace} finalValue={orbit.biosphere.code} />
          }
          placement='right'
          arrow
        >
          <span style={tooltipStyles}>{TEXT.toHex(orbit.biosphere.code)}</span>
        </Tooltip>
        ) {TEXT.title(BIOSPHERE.labels[orbit.biosphere.code])}
        {orbit.biosphere.code > 0 && orbit.biosphere.label && (
          <>
            {' '}•{' '}
            <Icon
              path={
                orbit.biosphere.label === 'remnants'
                  ? mdiSkullOutline
                  : orbit.biosphere.label === 'engineered'
                    ? mdiDna
                    : mdiHandshake
              }
              size={0.7}
              color={
                orbit.biosphere.label === 'remnants'
                  ? '#666'
                  : orbit.biosphere.label === 'engineered'
                    ? '#9c27b0'
                    : getCompatibilityColor(orbit.biosphere.label)
              }
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <span>{orbit.biosphere.label}</span>
          </>
        )}
      </Grid>
    </>
  )
}
