import { Grid } from '@mui/material'
import { TEXT } from '../../model/utilities/text'
import { CodexPage } from '../common/CodexPage'
import { StyledText } from '../common/StyledText'
import { COLORS } from '../../theme/colors'
import { Star } from '../../model/system/stars/types'
import { STAR } from '../../model/system/stars'
import { MATH } from '../../model/utilities/math'

const formatters = {
  temperature: new Intl.NumberFormat('en-US', {
    style: 'unit',
    unit: 'celsius',
    notation: 'compact'
  }),
  luminosity: new Intl.NumberFormat('en-US', { notation: 'compact', minimumFractionDigits: 5 })
}

const StarView = (props: { star: Star }) => {
  const star = props.star
  const age =
    star.age < 1
      ? `${(star.age * 1000).toFixed(2)} million years`
      : star.age >= 1000
      ? `${(star.age / 1000).toFixed(2)} trillion years`
      : `${star.age.toFixed(2)} billion years`
  return (
    <CodexPage
      title={STAR.name(star)}
      subtitle={
        <StyledText
          text={`Star (${star.spectralClass}${star.subtype}-${
            star.luminosityClass
          }), ${TEXT.decorate({
            link: window.galaxy.systems[star.system],
            color: COLORS.subtitle
          })}`}
        ></StyledText>
      }
      content={
        <Grid container>
          <Grid item xs={12}>
            <b>Age: </b> {age}
          </Grid>
          <Grid item xs={12}>
            <b>Distance: </b> {MATH.orbits.fromAU(star.au).toFixed(2)} ({star.au.toFixed(2)} AU)
          </Grid>
          <Grid item xs={12}>
            <b>Eccentricity: </b> {star.eccentricity.toFixed(2)}
          </Grid>
          <Grid item xs={12}>
            <b>Period: </b> {MATH.time.convertYears(star.period)}
          </Grid>
          <Grid item xs={12}>
            <b>Mass: </b> {star.mass.toFixed(2)}
          </Grid>
          <Grid item xs={12}>
            <b>Diameter: </b> {star.diameter.toFixed(2)} ({star.r})
          </Grid>
          <Grid item xs={12}>
            <b>Luminosity: </b> {formatters.luminosity.format(star.luminosity)}
          </Grid>
          <Grid item xs={12}>
            <b>Temperature: </b>{' '}
            {formatters.temperature.format(MATH.temperature.celsius(star.temperature))}
          </Grid>
        </Grid>
      }
    ></CodexPage>
  )
}

export default StarView
