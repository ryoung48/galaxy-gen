import { Box } from '@mui/material'
import { type ReactNode } from 'react'
import { METRICS } from '../../../maps/legend/metrics'
import { getValueColor, getTemperatureDeltaColor } from './OrbitUtils'
import { Orbit } from '../../../../model/system/orbits/types'
import { TEXT } from '../../../../model/utilities/text'
import { MATH } from '../../../../model/utilities/math'
import { formatters } from './OrbitUtils'

type OrbitTooltipItem = {
  label: ReactNode
  color: string
  key?: string | number
}

type OrbitTooltipSection = {
  items: OrbitTooltipItem[]
  emptyMessage?: ReactNode
  showDivider?: boolean
  dividerColor?: string
}

type OrbitTooltipBaseProps = {
  title: ReactNode
  sections: OrbitTooltipSection[]
}

const listSx = {
  m: 0,
  pl: 0,
  listStyle: 'none',
  mt: 0
} as const

const bulletBaseSx = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  mr: 1,
  flexShrink: 0
} as const

export const OrbitTooltipBase = ({ title, sections }: OrbitTooltipBaseProps) => (
  <Box sx={{ p: 1, maxWidth: 350 }}>
    <Box>{title}</Box>
    {sections.map((section, index) => {
      const hasItems = section.items.length > 0
      const dividerColor = section.dividerColor ?? '#ccc'
      const containerSx = section.showDivider
        ? { mt: 1, pt: 1, borderTop: `1px solid ${dividerColor}` }
        : { mt: 1 }

      if (!hasItems && !section.emptyMessage) {
        return section.showDivider ? <Box key={index} sx={containerSx} /> : null
      }

      return (
        <Box key={index} sx={containerSx}>
          {hasItems ? (
            <Box component='ul' sx={listSx}>
              {section.items.map((item, itemIndex) => (
                <Box
                  component='li'
                  key={item.key ?? itemIndex}
                  sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
                >
                  <Box sx={{ ...bulletBaseSx, backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </Box>
              ))}
            </Box>
          ) : (
            <Box>{section.emptyMessage}</Box>
          )}
        </Box>
      )
    })}
  </Box>
)

export const HabitabilityTooltip = ({
  trace,
  finalValue
}: {
  trace: Orbit['habitability']['trace']
  finalValue: number
}) => {
  const sortedAdjustments = [...trace].sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='Habitability Factors'
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
              color: METRICS.habitability.color(finalValue),
              label: `Final Habitability: ${finalValue}`
            }
          ]
        }
      ]}
    />
  )
}

export const RotationTooltip = ({
  trace,
  totalDm,
  lock
}: {
  trace: Orbit['rotation']['trace']
  totalDm: number
  lock?: string
}) => {
  const contributions = [...trace].sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='Tidal Lock Modifiers'
      sections={[
        {
          items: contributions.map((entry, idx) => ({
            key: idx,
            color: getValueColor(entry.value),
            label: `${entry.value > 0 ? '+' : ''}${entry.value}: ${entry.description}`
          })),
          emptyMessage: 'No DM adjustments recorded'
        },
        {
          showDivider: true,
          items: [
            {
              color: getValueColor(totalDm),
              label: `Total Score: ${totalDm}`
            },
            ...(lock
              ? [
                  {
                    color: '#6d597a',
                    label: `Lock Target: ${lock}`
                  }
                ]
              : [])
          ]
        }
      ]}
    />
  )
}

export const TechnologyTooltip = ({
  trace,
  finalValue
}: {
  trace: Orbit['technology']['trace']
  finalValue: number
}) => {
  const sortedAdjustments = [...trace].sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='Industry Factors'
      sections={[
        {
          items: sortedAdjustments.map((adj, idx) => ({
            key: idx,
            color: getValueColor(adj.value),
            label: `${adj.value > 0 ? '+' : ''}${adj.value}: ${adj.description}`
          })),
          emptyMessage: 'No adjustments recorded'
        },
        {
          showDivider: true,
          items: [
            {
              color: METRICS.tech.color(finalValue),
              label: `Final Tech Level: ${finalValue}`
            }
          ]
        }
      ]}
    />
  )
}

export const BiosphereTooltip = ({
  trace,
  finalValue
}: {
  trace: Orbit['biosphere']['trace']
  finalValue: number
}) => {
  const sortedAdjustments = [...trace].sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='Biosphere Factors'
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
              color: METRICS.biosphere.color(finalValue),
              label: `Final Biosphere: ${finalValue}`
            }
          ]
        }
      ]}
    />
  )
}

export const BiomassTooltip = ({
  trace,
  finalValue
}: {
  trace: Orbit['biosphere']['trace']
  finalValue: number
}) => {
  const sortedAdjustments = [...trace].sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='Biomass Factors'
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
              color: METRICS.biosphere.color(finalValue),
              label: `Final Biomass: ${finalValue}`
            }
          ]
        }
      ]}
    />
  )
}

export const ComplexityTooltip = ({
  trace,
  finalValue
}: {
  trace: Orbit['biosphere']['trace']
  finalValue: number
}) => {
  const sortedAdjustments = [...trace].sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='Complexity Factors'
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
              color: METRICS.biosphere.color(finalValue),
              label: `Final Complexity: ${finalValue}`
            }
          ]
        }
      ]}
    />
  )
}

export const CompatibilityTooltip = ({
  trace,
  finalValue
}: {
  trace: Orbit['biosphere']['trace']
  finalValue: number
}) => {
  const sortedAdjustments = [...trace].sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='Compatibility Factors'
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
              color: METRICS.biosphere.color(finalValue),
              label: `Final Compatibility: ${finalValue}`
            }
          ]
        }
      ]}
    />
  )
}

export const PopulationConcentrationTooltip = ({
  trace,
  finalValue
}: {
  trace: NonNullable<Orbit['pcr']>['trace']
  finalValue: number
}) => {
  const entries = [...trace]

  return (
    <OrbitTooltipBase
      title='Population Concentration'
      sections={[
        {
          items: entries
            .sort((a, b) => b.value - a.value)
            .map((entry, idx) => ({
              key: idx,
              color: getValueColor(entry.value),
              label: `${entry.value > 0 ? '+' : ''}${entry.value}: ${entry.description}`
            })),
          emptyMessage: 'No modifiers applied'
        },
        {
          showDivider: true,
          items: [
            {
              color: getValueColor(finalValue),
              label: `Final PCR: ${finalValue}`
            }
          ]
        }
      ]}
    />
  )
}

export const TemperatureTooltip = ({
  trace,
  finalValue,
  baseline
}: {
  trace: { value: number; description: string }[]
  baseline: number
  finalValue: number
}) => {
  const sortedAdjustments = [...trace]
    .filter(adj => !adj.description.includes('baseline'))
    .sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='Temperature Factors'
      sections={[
        {
          items: [
            {
              color: getTemperatureDeltaColor(baseline ?? 0),
              label: `Earth Baseline: ${(baseline ?? 0).toFixed(0)}°C`
            }
          ]
        },
        {
          showDivider: true,
          dividerColor: '#ddd',
          items: sortedAdjustments.map((adj, idx) => ({
            key: idx,
            color: getTemperatureDeltaColor(adj.value),
            label: `${adj.value > 0 ? '+' : ''}${TEXT.formatters.compact(
              Math.floor(adj.value)
            )}°C: ${adj.description}`
          }))
        },
        {
          showDivider: true,
          dividerColor: '#ddd',
          items: [
            {
              color: getTemperatureDeltaColor(finalValue),
              label: `Final Mean: ${TEXT.formatters.compact(finalValue)}°C`
            }
          ]
        }
      ]}
    />
  )
}

export const CitiesTooltip = ({ pops, total }: { pops: Required<Orbit>['cities']['pops']; total: number }) => {
  const items = pops
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((value, index) => ({
      key: index,
      value,
      label: `${value.name}: ${formatters.population.format(Math.round(value.count))}${value.unusual ? ` (${value.unusual.toLowerCase()})` : ''}`
    }))

  const sections = [
    {
      items: items.map(item => ({
        key: item.key,
        color: getValueColor(item.value.count),
        label: item.label
      })),
      emptyMessage: 'No major cities recorded'
    },
    {
      showDivider: true,
      items: [
        {
          color: '#222',
          label: `Total: ${formatters.population.format(Math.round(total))}`
        }
      ]
    }
  ]

  return <OrbitTooltipBase title='Major City Populations' sections={sections} />
}

export const TemperatureRangeTooltip = ({
  trace,
  high,
  low
}: {
  trace: { value: number; description: string }[]
  high: number
  low: number
}) => {
  const h = MATH.temperature.celsius(high)
  const l = MATH.temperature.celsius(low)
  const finalValue = h - l
  const sortedAdjustments = [...trace]
    .filter(adj => !adj.description.includes('baseline'))
    .sort((a, b) => b.value - a.value)

  return (
    <OrbitTooltipBase
      title='Temperature Δ Factors'
      sections={[
        {
          items: sortedAdjustments.map((adj, idx) => ({
            key: idx,
            color: getTemperatureDeltaColor(adj.value),
            label: `${adj.value > 0 ? '+' : ''}${TEXT.formatters.compact(
              Math.floor(adj.value)
            )}°C: ${adj.description}`
          }))
        },
        {
          showDivider: true,
          dividerColor: '#ddd',
          items: [
            {
              color: getTemperatureDeltaColor(h),
              label: `High: ${TEXT.formatters.compact(h)}°C`
            },
            {
              color: getTemperatureDeltaColor(l),
              label: `Low: ${TEXT.formatters.compact(l)}°C`
            },
            {
              color: getTemperatureDeltaColor(finalValue),
              label: `Final Δ: ${TEXT.formatters.compact(finalValue)}°C`
            }
          ]
        }
      ]}
    />
  )
}
