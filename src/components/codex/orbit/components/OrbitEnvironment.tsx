import { Grid, Tooltip } from '@mui/material'
import Icon from '@mdi/react'
import { mdiCloudOutline, mdiGrass } from '@mdi/js'
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
                  atmosphere.subtype +
                  (atmosphere.tainted
                    ? `, ${atmosphere.code === 10 ? 'irritant' : 'tainted'}`
                    : '') +
                  (atmosphere.unusual ? `, ${atmosphere.unusual}` : '')
                })`
              : ''
          }
        />
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
        ) {TEMPERATURE.describe(orbit.temperature.mean)}, Δ{' '}
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
        {orbit.biosphere.affix ? ` (${orbit.biosphere.affix})` : ''}
      </Grid>
    </>
  )
}
