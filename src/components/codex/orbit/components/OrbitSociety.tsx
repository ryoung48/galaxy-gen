import { Grid, Tooltip } from '@mui/material'
import Icon from '@mdi/react'
import { mdiAccountGroup, mdiCog, mdiBank, mdiGavel } from '@mdi/js'
import type { Orbit } from '../../../../model/system/orbits/types'
import { TEXT } from '../../../../model/utilities/text'
import { METRICS } from '../../../maps/legend/metrics'
import { describeTechnology, formatters } from './OrbitUtils'
import { Fragment } from 'react'
import { ORBIT } from '../../../../model/system/orbits'
import { TechnologyTooltip } from './OrbitTooltips'

export default function OrbitSociety({ orbit }: { orbit: Orbit }) {
  if (!orbit.population) return null

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
      </Grid>
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
            <span style={{ cursor: 'pointer', borderBottom: '1px dotted black' }}>
              {TEXT.toHex(orbit.technology.score)}
            </span>
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
