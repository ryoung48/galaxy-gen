import { Grid } from '@mui/material'
import { NATION } from '../../model/nations'
import { TEXT } from '../../model/utilities/text'
import { CodexPage } from '../common/CodexPage'
import { StyledText } from '../common/StyledText'
import { Nation } from '../../model/nations/types'

const NationView = (props: { nation: Nation }) => {
  const nation = props.nation
  return (
    <CodexPage
      title={nation.name}
      subtitle={`Nation (#${nation.idx})`}
      content={
        <Grid container>
          <Grid item>
            <span>
              <b>Systems: </b>{' '}
              <StyledText
                text={NATION.systems(nation)
                  .map(system => TEXT.decorate({ link: system }))
                  .join(', ')}
              ></StyledText>
            </span>
          </Grid>
        </Grid>
      }
    ></CodexPage>
  )
}

export default NationView
