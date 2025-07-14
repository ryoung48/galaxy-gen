import { Grid } from '@mui/material'
import { CodexPage } from '../common/CodexPage'
import { Orbit } from '../../model/system/orbits/types'
import { ORBIT } from '../../model/system/orbits'
import { TEXT } from '../../model/utilities/text'
import { Fragment } from 'react'
import { COLORS } from '../../theme/colors'
import { StyledText } from '../common/StyledText'
import Icon from '@mdi/react'
import { mdiEarth } from '@mdi/js'
import { ORBIT_CLASSIFICATION } from '../../model/system/orbits/classification'
import { SIZE } from '../../model/system'

// Custom simple circle path (filled) for planet/moon icon
const mdiSphere = 'M12,2A10,10 0 1,0 22,12A10,10 0 0,0 12,2Z'

const OrbitView = (props: { orbit: Orbit }) => {
  const orbit = props.orbit
  const parent = ORBIT.parent(orbit)
  const moon = parent.tag !== 'star' && parent.type !== 'asteroid belt'
  const asteroid =
    orbit.type === 'asteroid belt' ||
    orbit.type === 'ice asteroid belt' ||
    orbit.type === 'asteroid' ||
    orbit.type === 'ice asteroid'
  return (
    <CodexPage
      title={ORBIT.name(orbit)}
      subtitle={
        <Fragment>
          <Icon
            path={mdiSphere}
            size={0.5}
            color={ORBIT_CLASSIFICATION[orbit.type].color}
            style={{ verticalAlign: 'middle', marginRight: 4, marginBottom: 1 }}
          />
          <StyledText
            text={`${orbit.type}${
              asteroid || orbit.type === 'gas giant' ? '' : moon ? ' moon' : ' planet'
            }, ${TEXT.decorate({
              link: window.galaxy.systems[orbit.system],
              color: COLORS.subtitle
            })}`}
          ></StyledText>
        </Fragment>
      }
      content={
        <Grid container>
          <Grid item xs={12}>
            <Icon
              path={mdiEarth}
              size={0.7}
              color={SIZE.colors(orbit.size)}
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            <b>Size: </b>
            {orbit.size}
          </Grid>
        </Grid>
      }
    ></CodexPage>
  )
}

export default OrbitView
