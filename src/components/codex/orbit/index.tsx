import { Grid } from '@mui/material'
import Icon from '@mdi/react'
import { CodexPage } from '../../common/CodexPage'
import { StyledText } from '../../common/StyledText'
import { COLORS } from '../../../theme/colors'
import { TEXT } from '../../../model/utilities/text'
import { ORBIT } from '../../../model/system/orbits'
import type { Orbit } from '../../../model/system/orbits/types'
import { Fragment } from 'react'
import OrbitBasicInfo from './components/OrbitBasicInfo'
import OrbitEnvironment from './components/OrbitEnvironment'
import OrbitEconomyHabitability from './components/OrbitEconomyHabitability'
import OrbitSociety from './components/OrbitSociety'
import OrbitEconomy from './components/OrbitEconomy'
import { SOLAR_SYSTEM } from '../../../model/system'

// Custom simple circle path (filled) for planet/moon icon
const mdiSphere = 'M12,2A10,10 0 1,0 22,12A10,10 0 0,0 12,2Z'

const OrbitView = (props: { orbit: Orbit }) => {
  const orbit = props.orbit
  const parent = ORBIT.parent(orbit)
  const moon = parent.tag !== 'star' && parent.group !== 'asteroid belt'
  const asteroid = orbit.group === 'asteroid belt'
  const system = window.galaxy.systems[orbit.system]
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
            text={`(${orbit.idx}) ${orbit.type}${asteroid ? '' : moon ? ' moon' : ' planet'}, ${TEXT.decorate({
              link: system,
              label: SOLAR_SYSTEM.name(system),
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
          <OrbitBasicInfo orbit={orbit} />
          <OrbitEnvironment orbit={orbit} />
          <OrbitEconomyHabitability orbit={orbit} />
          <OrbitSociety orbit={orbit} />
          {/* <OrbitEconomy orbit={orbit} /> */}
        </Grid>
      }
    ></CodexPage>
  )
}

export default OrbitView
