import { Grid } from '@mui/material'
import { NATION } from '../../model/nations'
import { TEXT } from '../../model/utilities/text'
import { CodexPage } from '../common/CodexPage'
import { StyledText } from '../common/StyledText'
import { Nation } from '../../model/nations/types'

const NationView = (props: { nation: Nation }) => {
  const nation = props.nation
  const systems = NATION.systems(nation)
  return (
    <CodexPage
      title={nation.name}
      subtitle={`Nation (#${nation.idx})`}
      content={
        <Grid container>
          <Grid item xs={12}>
            <span>
              <b>Government: </b> {TEXT.title(nation.government)}
            </span>
          </Grid>
          <Grid item>
            <span>
              <b>Systems ({systems.length}): </b>{' '}
              <StyledText
                text={systems.map(system => TEXT.decorate({ link: system })).join(', ')}
              ></StyledText>
            </span>
          </Grid>
        </Grid>
      }
    ></CodexPage>
  )
}

export default NationView
