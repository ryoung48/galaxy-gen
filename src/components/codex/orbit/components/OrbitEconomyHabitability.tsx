import { Grid, Tooltip } from '@mui/material'
import Icon from '@mdi/react'
import { mdiHeart } from '@mdi/js'
import type { Orbit } from '../../../../model/system/orbits/types'
import { METRICS } from '../../../maps/legend/metrics'
import { describeHabitability } from './OrbitUtils'
import { HabitabilityTooltip } from './OrbitTooltips'
// import { TEXT } from '../../../../model/utilities/text'

// const tooltipStyles = { cursor: 'pointer', borderBottom: '1px dotted black' }

// const ResourcesTooltip = ({
//   trace,
//   finalValue
// }: {
//   trace: NonNullable<Orbit['resources']>['trace']
//   finalValue: number
// }) => {
//   const sortedAdjustments = [...trace].sort((a, b) => b.value - a.value)

//   // Use standard green/red color scheme for trace modifiers
//   const getValueColor = (value: number): string => {
//     if (value > 0) {
//       const intensity = Math.min(Math.abs(value) / 5, 1)
//       return `rgb(${Math.round(255 - intensity * 255)}, 255, ${Math.round(255 - intensity * 255)})`
//     } else {
//       const intensity = Math.min(Math.abs(value) / 12, 1)
//       return `rgb(255, ${Math.round(255 - intensity * 255)}, ${Math.round(255 - intensity * 255)})`
//     }
//   }

//   return (
//     <div style={{ padding: 8, maxWidth: 350 }}>
//       <div>Resources Factors</div>
//       <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', marginTop: 8 }}>
//         {sortedAdjustments.map((adj, idx) => (
//           <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
//             <div
//               style={{
//                 width: 8,
//                 height: 8,
//                 borderRadius: '50%',
//                 marginRight: 8,
//                 flexShrink: 0,
//                 backgroundColor: getValueColor(adj.value)
//               }}
//             />
//             <span>
//               {adj.value > 0 ? '+' : ''}
//               {adj.value}: {adj.description}
//             </span>
//           </li>
//         ))}
//       </ul>
//       <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #ccc' }}>
//         <div style={{ display: 'flex', alignItems: 'center' }}>
//           <div
//             style={{
//               width: 8,
//               height: 8,
//               borderRadius: '50%',
//               marginRight: 8,
//               flexShrink: 0,
//               backgroundColor: getResourceColor(finalValue)
//             }}
//           />
//           <span>Final Resources: {finalValue}</span>
//         </div>
//       </div>
//     </div>
//   )
// }

export default function OrbitEconomyHabitability({ orbit }: { orbit: Orbit }) {
  return (
    <>
      <Grid item xs={12}>
        <Icon
          path={mdiHeart}
          size={0.7}
          color={METRICS.habitability.color(orbit.habitability.score)}
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Habitability: </b> (
        <Tooltip
          title={
            <HabitabilityTooltip
              trace={orbit.habitability.trace}
              finalValue={orbit.habitability.score}
            />
          }
          placement='right'
          arrow
        >
          <span style={{ cursor: 'pointer', borderBottom: '1px dotted black' }}>
            {orbit.habitability.score}
          </span>
        </Tooltip>
        ) {describeHabitability(orbit.habitability.score)}
      </Grid>
      {/* <Grid item xs={12}>
        <Icon
          path={mdiRing}
          size={0.7}
          color={getResourceColor(orbit.resources.score)}
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Resources: </b> (
        <Tooltip
          title={
            <ResourcesTooltip trace={orbit.resources.trace} finalValue={orbit.resources.score} />
          }
          placement='right'
          arrow
        >
          <span style={tooltipStyles}>{TEXT.toHex(orbit.resources.score)}</span>
        </Tooltip>
        ) {getResourceDescription(orbit.resources.score)}
      </Grid> */}
    </>
  )
}
