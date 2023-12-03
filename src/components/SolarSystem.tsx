import { VIEW } from '../context'
import { TEXT } from '../model/utilities/text'
import { StyledText } from './common/StyledText'
import { CodexPage } from './common/CodexPage'
import { Grid } from '@mui/material'
import { SOLAR_SYSTEM } from '../model/system'
import { STYLES } from './styles'
import { STAR } from '../model/system/stars'
import { SATELLITE } from '../model/system/satellites'

const SolarSystemView = () => {
  const { state } = VIEW.context()
  const system = window.galaxy.systems[state.selected.id]
  return (
    <CodexPage
      title={system.name}
      subtitle={
        <StyledText
          text={`Solar System (#${system.idx ?? ''}), ${TEXT.decorate({
            link: SOLAR_SYSTEM.nation(system),
            color: STYLES.subtitle
          })}`}
        ></StyledText>
      }
      content={
        <Grid container>
          <Grid item xs={12}>
            <span>
              <b>Borders: </b>{' '}
              <StyledText
                text={system.lanes
                  .map(i => {
                    const neighbor = window.galaxy.systems[i]
                    return TEXT.decorate({ link: neighbor })
                  })
                  .join(', ')}
              ></StyledText>
            </span>
          </Grid>
          <Grid item xs={12}>
            <span>
              <b>Celestial Bodies: </b>{' '}
              <StyledText
                text={SOLAR_SYSTEM.objects(system)
                  .map(obj =>
                    TEXT.decorate({
                      link: obj,
                      label: obj.tag === 'star' ? STAR.name(obj) : SATELLITE.name(obj),
                      tooltip:
                        obj.tag === 'star' ? TEXT.title(obj.type) : SATELLITE.classification(obj),
                      underlineColor:
                        obj.tag === 'star'
                          ? STAR.templates[obj.type].color
                          : SATELLITE.templates[obj.type].color
                    })
                  )
                  .join(', ')}
              ></StyledText>
            </span>
          </Grid>
        </Grid>
      }
    ></CodexPage>
  )
}

export default SolarSystemView
