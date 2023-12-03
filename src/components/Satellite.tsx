import { VIEW } from '../context'
import { TEXT } from '../model/utilities/text'
import { StyledText } from './common/StyledText'
import { CodexPage } from './common/CodexPage'
import { STYLES } from './styles'
import { SATELLITE } from '../model/system/satellites'
import { Grid } from '@mui/material'

const SatelliteView = () => {
  const { state } = VIEW.context()
  const satellite = window.galaxy.satellites[state.selected.id]
  const parent = window.galaxy.satellites[satellite.parent?.idx ?? -1]!
  const moons = SATELLITE.moons(satellite)
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
