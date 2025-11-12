import { Grid, Tooltip } from '@mui/material'
import Icon from '@mdi/react'
import {
  mdiCurrencyUsd,
  mdiAccountHardHat,
  mdiChartLine,
  mdiTrendingUp,
  mdiScaleBalance,
  mdiSwapHorizontal
} from '@mdi/js'
import type { Orbit } from '../../../../model/system/orbits/types'
import { TEXT } from '../../../../model/utilities/text'
import { Fragment } from 'react'
import { OrbitTooltipBase } from './OrbitTooltips'
import { getValueColor, formatters } from './OrbitUtils'

const tooltipStyles = { cursor: 'pointer', borderBottom: '1px dotted black' }

const ImportanceTooltip = ({
  trace,
  finalValue
}: {
  trace: NonNullable<Orbit['importance']>['trace']
  finalValue: number
}) => {
  const sortedAdjustments = [...trace].sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='Importance Factors'
      sections={[
        {
          items: sortedAdjustments.map((adj, idx) => ({
            key: idx,
            color: getValueColor(adj.value),
            label: `${adj.value > 0 ? '+' : ''}${adj.value}: ${adj.description}`
          })),
          emptyMessage: 'No adjustments applied'
        },
        {
          showDivider: true,
          items: [
            {
              color: getValueColor(finalValue),
              label: `Final Importance: ${finalValue > 0 ? '+' : ''}${finalValue}`
            }
          ]
        }
      ]}
    />
  )
}

const EfficiencyTooltip = ({
  trace,
  finalValue
}: {
  trace: NonNullable<Orbit['efficiency']>['trace']
  finalValue: number
}) => {
  const sortedAdjustments = [...trace].sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='Efficiency Factors'
      sections={[
        {
          items: sortedAdjustments.map((adj, idx) => ({
            key: idx,
            color: getValueColor(adj.value),
            label: `${adj.value > 0 ? '+' : ''}${adj.value}: ${adj.description}`
          })),
          emptyMessage: 'No adjustments applied'
        },
        {
          showDivider: true,
          items: [
            {
              color: getValueColor(finalValue),
              label: `Final Efficiency: ${finalValue > 0 ? '+' : ''}${finalValue}`
            }
          ]
        }
      ]}
    />
  )
}

const WTNTooltip = ({
  trace,
  finalValue
}: {
  trace: NonNullable<Orbit['wtn']>['trace']
  finalValue: number
}) => {
  const sortedAdjustments = [...trace].sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='World Trade Number Factors'
      sections={[
        {
          items: sortedAdjustments.map((adj, idx) => ({
            key: idx,
            color: getValueColor(adj.value),
            label: `${adj.value > 0 ? '+' : ''}${adj.value}: ${adj.description}`
          })),
          emptyMessage: 'No adjustments applied'
        },
        {
          showDivider: true,
          items: [
            {
              color: getValueColor(finalValue),
              label: `Final WTN: ${finalValue}`
            }
          ]
        }
      ]}
    />
  )
}

const InfrastructureTooltip = ({
  trace,
  finalValue
}: {
  trace: NonNullable<Orbit['infrastructure']>['trace']
  finalValue: number
}) => {
  const sortedAdjustments = [...trace].sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='Infrastructure Factors'
      sections={[
        {
          items: sortedAdjustments.map((adj, idx) => ({
            key: idx,
            color: getValueColor(adj.value),
            label: `${adj.value > 0 ? '+' : ''}${adj.value}: ${adj.description}`
          })),
          emptyMessage: 'No adjustments applied'
        },
        {
          showDivider: true,
          items: [
            {
              color: getValueColor(finalValue),
              label: `Final Infrastructure: ${finalValue}`
            }
          ]
        }
      ]}
    />
  )
}

const RUTooltip = ({
  trace
}: {
  trace: NonNullable<Orbit['ru']>['trace']
  finalValue: number
}) => {
  return (
    <OrbitTooltipBase
      title='Resource Units Calculation'
      sections={[
        {
          items: trace.map((item, idx) => ({
            key: idx,
            color: getValueColor(item.value),
            label: `${item.value > 0 ? '+' : ''}${item.value}: ${item.description}`
          })),
          emptyMessage: 'No calculation steps'
        }
      ]}
    />
  )
}

const GWPTooltip = ({
  trace,
  finalValue
}: {
  trace: NonNullable<Orbit['gwp']>['trace']
  finalValue: number
}) => {
  return (
    <OrbitTooltipBase
      title='GWP Per Capita Factors'
      sections={[
        {
          items: trace.map((item, idx) => ({
            key: idx,
            color: getValueColor(item.value),
            label: `${item.value > 0 ? '+' : ''}${item.value}: ${item.description}`
          })),
          emptyMessage: 'No calculation steps'
        },
        {
          showDivider: true,
          items: [
            {
              color: getValueColor(finalValue),
              label: `Final GWP per Capita: ${finalValue}`
            }
          ]
        }
      ]}
    />
  )
}

const InequalityTooltip = ({
  trace,
  finalValue
}: {
  trace: NonNullable<Orbit['inequality']>['trace']
  finalValue: number
}) => {
  const sortedAdjustments = [...trace].sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='Inequality Factors'
      sections={[
        {
          items: sortedAdjustments.map((adj, idx) => ({
            key: idx,
            color: getValueColor(adj.value),
            label: `${adj.value > 0 ? '+' : ''}${adj.value}: ${adj.description}`
          })),
          emptyMessage: 'No adjustments applied'
        },
        {
          showDivider: true,
          items: [
            {
              color: getValueColor(finalValue - 50),
              label: `Final Inequality: ${finalValue}`
            }
          ]
        }
      ]}
    />
  )
}

export default function OrbitEconomy({ orbit }: { orbit: Orbit }) {
  if (!orbit.population || orbit.population.code === 0) return null

  return (
    <Fragment>
      <Grid item xs={12} pt={2}>
        <b>Economy</b>
      </Grid>

      {orbit.importance && (
        <Grid item xs={6}>
          <Icon
            path={mdiTrendingUp}
            size={0.7}
            color={orbit.importance.score > 0 ? '#4caf50' : orbit.importance.score < 0 ? '#f44336' : '#757575'}
            style={{ verticalAlign: 'middle', marginRight: 4 }}
          />
          <b>Importance: </b>
          <Tooltip
            title={
              <ImportanceTooltip
                trace={orbit.importance.trace}
                finalValue={orbit.importance.score}
              />
            }
            placement='right'
            arrow
          >
            <span style={tooltipStyles}>
              {orbit.importance.score > 0 ? '+' : ''}{orbit.importance.score}
            </span>
          </Tooltip>
        </Grid>
      )}

      {orbit.efficiency && (
        <Grid item xs={6}>
          <Icon
            path={mdiSwapHorizontal}
            size={0.7}
            color={orbit.efficiency.score > 0 ? '#4caf50' : orbit.efficiency.score < 0 ? '#f44336' : '#757575'}
            style={{ verticalAlign: 'middle', marginRight: 4 }}
          />
          <b>Efficiency: </b>
          <Tooltip
            title={
              <EfficiencyTooltip
                trace={orbit.efficiency.trace}
                finalValue={orbit.efficiency.score}
              />
            }
            placement='right'
            arrow
          >
            <span style={tooltipStyles}>
              {orbit.efficiency.score > 0 ? '+' : ''}{orbit.efficiency.score}
            </span>
          </Tooltip>
        </Grid>
      )}

      {orbit.labor !== undefined && (
        <Grid item xs={6}>
          <Icon
            path={mdiAccountHardHat}
            size={0.7}
            color='black'
            style={{ verticalAlign: 'middle', marginRight: 4 }}
          />
          <b>Labor: </b>({TEXT.toHex(orbit.labor)}) {orbit.labor}
        </Grid>
      )}

      {orbit.infrastructure !== undefined && (
        <Grid item xs={6}>
          <Icon
            path={mdiChartLine}
            size={0.7}
            color='black'
            style={{ verticalAlign: 'middle', marginRight: 4 }}
          />
          <b>Infrastructure: </b>
          <Tooltip
            title={
              <InfrastructureTooltip
                trace={orbit.infrastructure.trace}
                finalValue={orbit.infrastructure.score}
              />
            }
            placement='right'
            arrow
          >
            <span style={tooltipStyles}>
              ({TEXT.toHex(orbit.infrastructure.score)}) {orbit.infrastructure.score}
            </span>
          </Tooltip>
        </Grid>
      )}

      {orbit.ru !== undefined && (
        <Grid item xs={6}>
          <Icon
            path={mdiCurrencyUsd}
            size={0.7}
            color='black'
            style={{ verticalAlign: 'middle', marginRight: 4 }}
          />
          <b>RU: </b>
          <Tooltip
            title={<RUTooltip trace={orbit.ru.trace} finalValue={orbit.ru.score} />}
            placement='right'
            arrow
          >
            <span style={tooltipStyles}>
              {formatters.population.format(Math.round(orbit.ru.score))}
            </span>
          </Tooltip>
        </Grid>
      )}

      {orbit.gwp && (
        <Grid item xs={6}>
          <Icon
            path={mdiCurrencyUsd}
            size={0.7}
            color='black'
            style={{ verticalAlign: 'middle', marginRight: 4 }}
          />
          <b>GWP: </b>
          <Tooltip title={<GWPTooltip trace={orbit.gwp.trace} finalValue={orbit.gwp.perCapita} />} placement='right' arrow>
            <span style={tooltipStyles}>
              {formatters.population.format(Math.round(orbit.gwp.total))}
            </span>
          </Tooltip>
        </Grid>
      )}

      {orbit.wtn && (
        <Grid item xs={6}>
          <Icon
            path={mdiSwapHorizontal}
            size={0.7}
            color='black'
            style={{ verticalAlign: 'middle', marginRight: 4 }}
          />
          <b>WTN: </b>
          <Tooltip
            title={
              <WTNTooltip
                trace={orbit.wtn.trace}
                finalValue={orbit.wtn.score}
              />
            }
            placement='right'
            arrow
          >
            <span style={tooltipStyles}>
              ({TEXT.toHex(orbit.wtn.score)}) {orbit.wtn.score}
            </span>
          </Tooltip>
        </Grid>
      )}

      {orbit.inequality && (
        <Grid item xs={6}>
          <Icon
            path={mdiScaleBalance}
            size={0.7}
            color={orbit.inequality.score > 50 ? '#f44336' : '#4caf50'}
            style={{ verticalAlign: 'middle', marginRight: 4 }}
          />
          <b>Inequality: </b>
          <Tooltip
            title={
              <InequalityTooltip
                trace={orbit.inequality.trace}
                finalValue={orbit.inequality.score}
              />
            }
            placement='right'
            arrow
          >
            <span style={tooltipStyles}>
              {orbit.inequality.score}
            </span>
          </Tooltip>
        </Grid>
      )}
    </Fragment>
  )
}
