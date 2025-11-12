import { Grid, Tooltip } from '@mui/material'
import Icon from '@mdi/react'
import {
  mdiAccountGroup,
  mdiCog,
  mdiBank,
  mdiGavel,
  mdiMapMarkerRadius,
  mdiCityVariantOutline,
  mdiOfficeBuilding
} from '@mdi/js'
import type { Orbit } from '../../../../model/system/orbits/types'
import { TEXT } from '../../../../model/utilities/text'
import { METRICS } from '../../../maps/legend/metrics'
import { describeTechnology, formatters } from './OrbitUtils'
import { Fragment } from 'react'
import { ORBIT } from '../../../../model/system/orbits'
import { TechnologyTooltip, PopulationConcentrationTooltip, CitiesTooltip } from './OrbitTooltips'
import { LANGUAGE } from '../../../../model/languages'

const tooltipStyles = { cursor: 'pointer', borderBottom: '1px dotted black' }

const describePCR = (code: number): string => {
  const descriptions: Record<number, string> = {
    0: 'Extremely Dispersed',
    1: 'Highly Dispersed',
    2: 'Moderately Dispersed',
    3: 'Partially Dispersed',
    4: 'Slightly Dispersed',
    5: 'Slightly Concentrated',
    6: 'Partially Concentrated',
    7: 'Moderately Concentrated',
    8: 'Highly Concentrated',
    9: 'Extremely Concentrated'
  }
  return descriptions[Math.min(9, Math.max(0, code))] ?? 'Unknown'
}

export default function OrbitSociety({ orbit }: { orbit: Orbit }) {
  if (!orbit.population) return null

  orbit.cities?.pops
    .filter(pop => !pop.name)
    .forEach(pop => {
      const system = window.galaxy.systems[orbit.system]
      const nation = window.galaxy.nations[system.nation]
      pop.name = LANGUAGE.word.unique({ key: 'orbit', lang: nation.language })
    })

  return (
    <Fragment>
      <Grid item xs={12}>
        <Icon
          path={mdiAccountGroup}
          size={0.7}
          color={METRICS.population.color(orbit.population!.code)}
          style={{ verticalAlign: 'middle', marginRight: 4 }}
        />
        <b>Population: </b> ({TEXT.toHex(orbit.population.code)}){' '}
        {formatters.population.format(orbit.population.size)}
        {orbit.pcr && (
          <>
            {' '}
            •{' '}
            <Icon
              path={mdiMapMarkerRadius}
              size={0.55}
              color='black'
              style={{ verticalAlign: 'middle', marginRight: 2 }}
            />
            <Tooltip
              title={
                <PopulationConcentrationTooltip
                  trace={orbit.pcr.trace}
                  finalValue={orbit.pcr.code}
                />
              }
              placement='top'
              arrow
            >
              <span style={tooltipStyles}>{describePCR(orbit.pcr.code).toLowerCase()}</span>
            </Tooltip>
          </>
        )}
      </Grid>
      {orbit.urbanization && orbit.cities && (
        <Grid item xs={12}>
          <Icon
            path={mdiOfficeBuilding}
            size={0.7}
            color='black'
            style={{ verticalAlign: 'middle', marginRight: 4 }}
          />
          <b>Urbanization: </b>(
          {`${((orbit.cities.total / orbit.population.size) * 100).toFixed(0)}%`}) •{' '}
          <Icon
            path={mdiCityVariantOutline}
            size={0.55}
            color='black'
            style={{ verticalAlign: 'middle', marginRight: 2 }}
          />
          {orbit.cities.count > 0 ? (
            <Tooltip
              title={
                <CitiesTooltip pops={orbit.cities.pops ?? []} total={orbit.cities.total ?? 0} />
              }
              placement='right'
              arrow
            >
              <span style={tooltipStyles}>
                {orbit.cities.count} major {orbit.cities.count === 1 ? 'city' : 'cities'}
              </span>
            </Tooltip>
          ) : (
            '0 major cities'
          )}
        </Grid>
      )}
      {orbit.technology !== undefined && (
        <Grid item xs={12}>
          <Icon
            path={mdiCog}
            size={0.7}
            color={METRICS.tech.color(orbit.technology.score)}
            style={{ verticalAlign: 'middle', marginRight: 4 }}
          />
          <b>Industry: </b> (
          <Tooltip
            title={
              <TechnologyTooltip
                trace={orbit.technology.trace}
                finalValue={orbit.technology.score}
              />
            }
            placement='right'
            arrow
          >
            <span style={tooltipStyles}>{TEXT.toHex(orbit.technology.score)}</span>
          </Tooltip>
          ) {describeTechnology(orbit.technology.score)}
        </Grid>
      )}
      {orbit.population.code > 0 && orbit.government !== undefined && (
        <Grid item xs={12}>
          <Icon
            path={mdiBank}
            size={0.7}
            color='black'
            style={{ verticalAlign: 'middle', marginRight: 4 }}
          />
          <b>Government: </b> ({TEXT.toHex(orbit.government)}){' '}
          {ORBIT.governments[orbit.government.toString()]}
        </Grid>
      )}
      {orbit.population.code > 0 && orbit.law !== undefined && (
        <Grid item xs={12}>
          <Icon
            path={mdiGavel}
            size={0.7}
            color='black'
            style={{ verticalAlign: 'middle', marginRight: 4 }}
          />
          <b>Law Level: </b> ({TEXT.toHex(orbit.law)}) {ORBIT.lawLevel(orbit.law)}
        </Grid>
      )}
    </Fragment>
  )
}
