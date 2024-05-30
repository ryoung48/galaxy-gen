import { Grid } from '@mui/material'
import { VIEW } from '../../context'
import { NATION } from '../../model/nations'
import { TEXT } from '../../model/utilities/text'
import { CodexPage } from '../common/CodexPage'
import { StyledText } from '../common/StyledText'

const NationView = () => {
  const { state } = VIEW.context()
  const nation = window.galaxy.nations[state.selected.id]
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
