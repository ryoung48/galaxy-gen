import { Grid } from '@mui/material'
import { Stat } from './types'
import { ToggleButtons } from '../common/ToggleButtons'
import { StarFrequency } from './Stars'
import { PlanetFrequency } from './Planets'
import { MoonFrequency } from './Moons'
import { SystemSizes } from './Systems'
import { BiosphereDistribution } from './Biosphere'
import { BioRelations } from './Relations'
import { HydrosphereDistribution } from './Hydrosphere'
import { AtmosphereDistribution } from './Atmosphere'
import { HabitabilityDistribution } from './Habitability'
import { SizeDistribution } from './Size'
import { PopulationDistribution } from './Population'

export function StatisticsView() {
  const modes = [
    'stars',
    'planets',
    'moons',
    'size',
    'hydrosphere',
    'atmosphere',
    'biosphere',
    'habitability',
    'population'
  ] as Stat[]
  return (
    <Grid container pt={12}>
      <ToggleButtons
        selection={modes}
        content={mode => {
          if (mode === 'stars') return <StarFrequency></StarFrequency>
          if (mode === 'planets') return <PlanetFrequency></PlanetFrequency>
          if (mode === 'moons') return <MoonFrequency></MoonFrequency>
          if (mode === 'orbits') return <SystemSizes></SystemSizes>
          if (mode === 'biosphere') return <BiosphereDistribution></BiosphereDistribution>
          if (mode === 'relations') return <BioRelations></BioRelations>
          if (mode === 'atmosphere') return <AtmosphereDistribution></AtmosphereDistribution>
          if (mode === 'hydrosphere') return <HydrosphereDistribution></HydrosphereDistribution>
          if (mode === 'habitability') return <HabitabilityDistribution></HabitabilityDistribution>
          if (mode === 'size') return <SizeDistribution></SizeDistribution>
          if (mode === 'population') return <PopulationDistribution></PopulationDistribution>
          return <span></span>
        }}
      ></ToggleButtons>
    </Grid>
  )
}
