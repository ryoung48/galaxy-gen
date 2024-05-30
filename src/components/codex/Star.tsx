import { Grid } from '@mui/material'
import { VIEW } from '../../context'
import { STAR } from '../../model/system/stars'
import { TEXT } from '../../model/utilities/text'
import { CodexPage } from '../common/CodexPage'
import { StyledText } from '../common/StyledText'
import { STYLES } from '../styles'

const StarView = () => {
  const { state } = VIEW.context()
  const star = window.galaxy.stars[state.selected.id]
  return (
    <CodexPage
      title={STAR.name(star)}
      subtitle={
        <StyledText
          text={`${TEXT.title(star.type)} (#${star.idx ?? ''}), ${TEXT.decorate({
            link: STAR.system(star),
            color: STYLES.subtitle
          })}`}
        ></StyledText>
      }
      content={
        <Grid container>
          <Grid item xs={12}>
            <b>Mass: </b> {star.mass.toFixed(2)}
          </Grid>
          <Grid item xs={12}>
            <b>Radius: </b> {star.radius.toFixed(2)}
          </Grid>
          <Grid item xs={12}>
            <b>Luminosity: </b> {star.luminosity.toFixed(2)}
          </Grid>
          <Grid item xs={12}>
            <b>Temperature: </b> {star.temperature.toFixed(0)} K
          </Grid>
        </Grid>
      }
    ></CodexPage>
  )
}

export default StarView
