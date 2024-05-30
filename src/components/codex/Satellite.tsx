import { Grid } from '@mui/material'
import { VIEW } from '../../context'
import { SATELLITE } from '../../model/system/satellites'
import { TEXT } from '../../model/utilities/text'
import { CodexPage } from '../common/CodexPage'
import { StyledText } from '../common/StyledText'
import { STYLES } from '../styles'
import { SOLAR_SYSTEM } from '../../model/system'
import { CONSTANTS } from '../../model/constants'
import { scaleLinear } from 'd3'
import { CELESTIAL } from '../../model/system/common'

const SatelliteView = () => {
  const { state } = VIEW.context()
  const satellite = window.galaxy.satellites[state.selected.id]
  const parent = window.galaxy.satellites[satellite.parent?.idx ?? -1]!
  const moons = SATELLITE.moons(satellite)
  const system = SATELLITE.system(satellite)
  const stars = SOLAR_SYSTEM.stars(system)
  const distance =
    (scaleLinear().domain([0, 60, 100, 200]).range([0, 100, 1000, 4000]).clamp(true)(
      parent && satellite?.parent?.type !== 'star'
        ? parent.orbit.distance
        : satellite.orbit.distance
    ) *
      (stars[0].radius * CONSTANTS.R)) /
    CONSTANTS.AU
  const temperature = CELESTIAL.temperature({
    star: {
      radius: stars[0].radius * CONSTANTS.R,
      temperature: stars[0].temperature,
      distance: distance * CONSTANTS.AU
    },
    albedo: 0,
    greenhouse: 0
  })
  return (
    <CodexPage
      title={SATELLITE.name(satellite)}
      subtitle={
        <StyledText
          text={`${SATELLITE.classification(satellite)} (#${satellite.idx ?? ''}), ${TEXT.decorate({
            link: satellite.moon ? parent : SATELLITE.system(satellite),
            label: satellite.moon ? SATELLITE.name(parent) : undefined,
            color: STYLES.subtitle
          })}`}
        ></StyledText>
      }
      content={
        <Grid container>
          <Grid item xs={12}>
            <b>Distance: </b> {distance.toFixed(2)} AU
          </Grid>
          <Grid item xs={12}>
            <b>Temperature: </b> {temperature.toFixed(0)} K
          </Grid>
          {moons.length > 0 && (
            <Grid item xs={12}>
              <span>
                <b>Moon{moons.length === 1 ? '' : 's'}: </b>{' '}
                <StyledText
                  text={moons
                    .map(obj =>
                      TEXT.decorate({
                        link: obj,
                        label: SATELLITE.name(obj),
                        tooltip: SATELLITE.classification(obj),
                        underlineColor: SATELLITE.templates[obj.type].color
                      })
                    )
                    .join(', ')}
                ></StyledText>
              </span>
            </Grid>
          )}
        </Grid>
      }
    ></CodexPage>
  )
}

export default SatelliteView
