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
import { RotationDistribution } from './Rotation'
import { AxialTiltDistribution } from './AxialTilt'
import { EccentricityDistribution } from './Eccentricity'
import { SizeDistribution } from './Size'
import { PopulationDistribution } from './Population'
import { TechnologyDistribution } from './Technology'
import { LawDistribution } from './Law'
import { StarportDistribution } from './Starport'
import { GovernmentDistribution } from './Government'
import { OrbitCodeDistribution } from './OrbitCodes'

export function StatisticsView() {
  const modes = [
    'stars',
    'planets',
    'moons',
    'size',
    'eccentricity',
    'axial tilt',
    'rotation',
    'atmosphere',
    'hydrosphere',
    'biosphere',
    'habitability',
    'population',
    'government',
    'law',
    'industry',
    'starport'
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
          if (mode === 'rotation') return <RotationDistribution></RotationDistribution>
          if (mode === 'axial tilt') return <AxialTiltDistribution></AxialTiltDistribution>
          if (mode === 'eccentricity') return <EccentricityDistribution></EccentricityDistribution>
          if (mode === 'size') return <SizeDistribution></SizeDistribution>
          if (mode === 'population') return <PopulationDistribution></PopulationDistribution>
          if (mode === 'codes') return <OrbitCodeDistribution></OrbitCodeDistribution>
          if (mode === 'industry') return <TechnologyDistribution></TechnologyDistribution>
          if (mode === 'law') return <LawDistribution></LawDistribution>
          if (mode === 'starport') return <StarportDistribution></StarportDistribution>
          if (mode === 'government') return <GovernmentDistribution></GovernmentDistribution>
          return <span></span>
        }}
      ></ToggleButtons>
    </Grid>
  )
}
