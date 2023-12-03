import { VIEW } from '../context'
import { TEXT } from '../model/utilities/text'
import { StyledText } from './common/StyledText'
import { CodexPage } from './common/CodexPage'
import { STYLES } from './styles'
import { STAR } from '../model/system/stars'

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
      content={<span></span>}
    ></CodexPage>
  )
}

export default StarView
