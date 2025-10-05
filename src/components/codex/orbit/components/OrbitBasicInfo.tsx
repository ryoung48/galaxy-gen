import { Grid, Tooltip, Box } from '@mui/material'
import Icon from '@mdi/react'
import {
  mdiRuler,
  mdiClockOutline,
  mdiRotate3dVariant,
  mdiOrbit,
  mdiCompass,
  mdiEarth,
  mdiWaves,
  mdiPulse,
  mdiCalendarClock
} from '@mdi/js'
import type { Orbit } from '../../../../model/system/orbits/types'
import { TEXT } from '../../../../model/utilities/text'
import { SIZE } from '../../../../model/system/orbits/groups'
import { MATH } from '../../../../model/utilities/math'
import { describeAxialTilt, describeEccentricity, getImpactColor } from './OrbitUtils'
import { RotationTooltip } from './OrbitTooltips'
import { ORBIT } from '../../../../model/system/orbits'
import { STAR } from '../../../../model/system/stars'
import { CONSTANTS } from '../../../../model/constants'
import { SEISMOLOGY } from '../../../../model/system/orbits/seismology'

const tooltipStyles = { cursor: 'pointer', borderBottom: '1px dotted black' }

const formatters = {
  rotation: new Intl.NumberFormat('en-US', {
    notation: 'compact',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }),
  seismology: new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2
  })
}

export default function OrbitBasicInfo({ orbit }: { orbit: Orbit }) {
  const tilt = MATH.tilt.absolute(orbit.tilt)
  const lockLabel = orbit.lock
    ? `${
        orbit.lock.type === 'star'
          ? STAR.name(window.galaxy.stars[orbit.lock.idx])
          : ORBIT.name(window.galaxy.orbits[orbit.lock.idx])
      } (${orbit.lock.type})`
    : undefined
  const rotationTooltip = (
    <RotationTooltip
      trace={orbit.rotation.trace ?? []}
      totalDm={orbit.rotation.roll ?? 0}
      lock={lockLabel}
    />
  )
  const tideSources = orbit.tides
    .map(({ idx, effect, type }) => {
      const source =
        type === 'star'
          ? STAR.name(window.galaxy.stars[idx])
          : ORBIT.name(window.galaxy.orbits[idx])
      return {
        label: `${source} (${type})`,
        value: effect
      }
    })
    .sort((a, b) => b.value - a.value)
  const totalTides = tideSources.reduce((sum, s) => sum + s.value, 0)
  const parent = ORBIT.parent(orbit)
  const calendarDay = orbit.calendar.day
  const calendarYear = orbit.calendar.year
  return (
    <>
      <Grid item xs={12}>
        <Icon
          path={mdiRuler}
          size={0.7}
          color='black'
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Distance: </b>{' '}
        {orbit.moon ? (
          <span>
            <Tooltip
              title={
                TEXT.formatters.compact(parent.diameter * CONSTANTS.ED * orbit.moon.pd) + ' km'
              }
              placement='top'
              arrow
            >
              <span style={tooltipStyles}>{`${orbit.moon.pd.toFixed(2)} PD`}</span>
            </Tooltip>
            <Tooltip
              title={
                TEXT.formatters.compact(parent.tag === 'orbit' ? parent.mor + 2 : 0) + ' PD limit'
              }
              placement='top'
              arrow
            >
              <span>
                {' '}
                (<span style={tooltipStyles}>{`${orbit.moon.range}`}</span>)
              </span>
            </Tooltip>
          </span>
        ) : (
          `${MATH.orbits.fromAU(orbit.au).toFixed(3)} (${orbit.au.toFixed(3)} AU)`
        )}
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
        <b>Rotation: </b> {formatters.rotation.format(orbit.rotation.value)} hours (
        <Tooltip title={rotationTooltip} placement='right' arrow>
          <span style={tooltipStyles}>{orbit.direction}</span>
        </Tooltip>
        )
      </Grid>
      <Grid item xs={12}>
        <Icon
          path={mdiCalendarClock}
          size={0.7}
          color='black'
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Local Calendar: </b>
        {`${TEXT.formatters.compact(calendarYear)} days/year, ${
          isFinite(calendarDay) ? formatters.rotation.format(calendarDay) : 'Infinite'
        } hours/day`}
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
        <b>Axial Tilt: </b> {tilt.toFixed(2)}° ({describeAxialTilt(tilt)})
      </Grid>
      <Grid item xs={12}>
        <Icon
          path={mdiEarth}
          size={0.7}
          color={SIZE.colors(orbit.size)}
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Size: </b>(
        <Tooltip title={SIZE.label(orbit.size)} placement='top' arrow>
          <span style={tooltipStyles}>{TEXT.toHex(orbit.size)}</span>
        </Tooltip>
        ){' '}
        <Tooltip
          title={TEXT.formatters.compact(orbit.diameter * CONSTANTS.ED) + ' km'}
          placement='top'
          arrow
        >
          <span style={tooltipStyles}>{orbit.diameter.toFixed(2)}</span>
        </Tooltip>
        ⊕ (D), {orbit.mass.toFixed(3)}⊕ (M), {orbit.gravity.toFixed(2)} (G)
      </Grid>
      {/* <Grid item xs={12}>
        <Icon
          path={mdiTerrain}
          size={0.7}
          color={SIZE.colors(orbit.size)}
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Composition: </b>{' '}
        {orbit.composition.description ?? TEXT.capitalize(orbit.composition.type)}
      </Grid> */}
      <Grid item xs={12}>
        <Icon
          path={mdiWaves}
          size={0.7}
          color='black'
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Surface Tides: </b>
        <Tooltip
          title={
            <Box sx={{ p: 1, maxWidth: 350 }}>
              <Box>Surface Tide Sources</Box>
              <Box component='ul' sx={{ m: 0, pl: 0, listStyle: 'none', mt: 1 }}>
                {tideSources.map((s, i) => (
                  <Box
                    component='li'
                    key={i}
                    sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getImpactColor(s.value, 50),
                        mr: 1,
                        flexShrink: 0
                      }}
                    />
                    <span>{`${formatters.seismology.format(s.value)} m: ${s.label}`}</span>
                  </Box>
                ))}
              </Box>
            </Box>
          }
          placement='right'
          arrow
        >
          <span style={tooltipStyles}>{formatters.seismology.format(totalTides)} m</span>
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
        <Icon
          path={mdiPulse}
          size={0.7}
          color='black'
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Seismology: </b>
        <Tooltip
          title={
            <Box sx={{ p: 1, maxWidth: 350 }}>
              <Box>Seismology Sources</Box>
              <Box component='ul' sx={{ m: 0, pl: 0, listStyle: 'none', mt: 1 }}>
                <Box component='li' sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: getImpactColor(orbit.seismology.residual, 100),
                      mr: 1,
                      flexShrink: 0
                    }}
                  />
                  <span>Residual: {formatters.seismology.format(orbit.seismology.residual)}</span>
                </Box>
                <Box component='li' sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: getImpactColor(orbit.seismology.tides.stress, 100),
                      mr: 1,
                      flexShrink: 0
                    }}
                  />
                  <span>
                    Tidal Stress: {formatters.seismology.format(orbit.seismology.tides.stress)}
                  </span>
                </Box>
                <Box component='li' sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: getImpactColor(orbit.seismology.tides.heating, 100),
                      mr: 1,
                      flexShrink: 0
                    }}
                  />
                  <span>
                    Tidal Heating: {formatters.seismology.format(orbit.seismology.tides.heating)}
                  </span>
                </Box>
              </Box>
            </Box>
          }
          placement='right'
          arrow
        >
          <span>
            <span style={tooltipStyles}>
              {formatters.seismology.format(orbit.seismology.total)}
            </span>{' '}
            ({SEISMOLOGY.describe(orbit.seismology.total)})
          </span>
        </Tooltip>
      </Grid>
    </>
  )
}
