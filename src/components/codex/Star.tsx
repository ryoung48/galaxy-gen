import { Grid } from '@mui/material'
import { TEXT } from '../../model/utilities/text'
import { CodexPage } from '../common/CodexPage'
import { StyledText } from '../common/StyledText'
import { COLORS } from '../../theme/colors'
import { Star } from '../../model/system/stars/types'
import { STAR } from '../../model/system/stars'

const StarView = (props: { star: Star }) => {
  const star = props.star
  return (
    <CodexPage
      title={STAR.name(star)}
      subtitle={
        <StyledText
          text={`Star (${star.class}), ${TEXT.decorate({
            link: window.galaxy.systems[star.system],
            color: COLORS.subtitle
          })}`}
        ></StyledText>
      }
      content={
        <Grid container>
          <Grid item xs={12}>
            <b>Age: </b> {star.age} billion years
          </Grid>
          <Grid item xs={12}>
            <b>Mass: </b> {star.mass.toFixed(2)}
          </Grid>
          <Grid item xs={12}>
            <b>Radius: </b> {star.radius.toFixed(2)} ({star.r})
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
