import { Grid } from '@mui/material'
import Icon from '@mdi/react'

import { TEXT } from '../../model/utilities/text'
import { CodexPage } from '../common/CodexPage'
import { StyledText } from '../common/StyledText'
import { COLORS } from '../../theme/colors'
import { Star } from '../../model/system/stars/types'
import { STAR } from '../../model/system/stars'

// Custom simple circle path (filled) for planet/moon icon
const mdiSphere = 'M12,2A10,10 0 1,0 22,12A10,10 0 0,0 12,2Z'

const StarView = (props: { star: Star }) => {
  const star = props.star
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
            text={`Star (${star.type}), ${TEXT.decorate({
              link: window.galaxy.systems[star.system],
              color: COLORS.subtitle
            })}`}
          />
        </>
      }
      content={<Grid container>placeholder</Grid>}
    ></CodexPage>
  )
}

export default StarView
