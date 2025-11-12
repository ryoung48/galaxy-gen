import { Box, Grid } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { Stat } from './types'
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
import { COLORS } from '../../theme/colors'
import { css } from '@emotion/css'
import { useState } from 'react'

const statsContainer = css`
  width: 100vw;
  height: 100vh;
  background: #c2c7d3ff;
  overflow-y: auto;
  position: relative;
`

const topChartSelector = css`
  position: fixed;
  top: 3vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(7, 41, 61, 0.2);
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  gap: 0;
  white-space: nowrap;
  max-width: 90vw;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${COLORS.accent};
    border-radius: 2px;
  }
`

const backButton = css`
  position: fixed;
  bottom: 3vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  box-shadow: 0 4px 20px rgba(7, 41, 61, 0.2);
  color: ${COLORS.primary};
  font-family: 'Michroma', sans-serif;
  font-size: 0.6rem;
  letter-spacing: 0.06em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${COLORS.primary};
    color: white;
    box-shadow: 0 6px 30px rgba(7, 41, 61, 0.3);
    transform: translateX(-50%) translateY(-2px);
  }
`

const chartButton = css`
  color: ${COLORS.primary};
  border: none;
  padding: 6px 10px;
  font-family: 'Michroma', sans-serif;
  font-size: 0.6rem;
  letter-spacing: 0.06em;
  font-weight: 600;
  text-transform: uppercase;
  transition: all 0.3s ease;
  cursor: pointer;
  background: transparent;
  border-right: 1px solid rgba(7, 41, 61, 0.1);
  flex-shrink: 0;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: ${COLORS.accent}20;
  }

  &.active {
    background: ${COLORS.primary};
    color: white;

    &:hover {
      background: ${COLORS.primary};
    }
  }
`

const contentWrapper = css`
  padding: 80px 24px 120px 24px;
  margin: 0 auto;
`

export function StatisticsView({ toggleStats }: { toggleStats: (value: boolean) => void }) {
  const [selectedMode, setSelectedMode] = useState<Stat>('stars')

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

  const renderContent = () => {
    if (selectedMode === 'stars') return <StarFrequency />
    if (selectedMode === 'planets') return <PlanetFrequency />
    if (selectedMode === 'moons') return <MoonFrequency />
    if (selectedMode === 'orbits') return <SystemSizes />
    if (selectedMode === 'biosphere') return <BiosphereDistribution />
    if (selectedMode === 'relations') return <BioRelations />
    if (selectedMode === 'atmosphere') return <AtmosphereDistribution />
    if (selectedMode === 'hydrosphere') return <HydrosphereDistribution />
    if (selectedMode === 'habitability') return <HabitabilityDistribution />
    if (selectedMode === 'rotation') return <RotationDistribution />
    if (selectedMode === 'axial tilt') return <AxialTiltDistribution />
    if (selectedMode === 'eccentricity') return <EccentricityDistribution />
    if (selectedMode === 'size') return <SizeDistribution />
    if (selectedMode === 'population') return <PopulationDistribution />
    if (selectedMode === 'industry') return <TechnologyDistribution />
    if (selectedMode === 'law') return <LawDistribution />
    if (selectedMode === 'starport') return <StarportDistribution />
    if (selectedMode === 'government') return <GovernmentDistribution />
    return null
  }

  return (
    <Box className={statsContainer}>
      {/* Chart Selector at Top */}
      <Box className={topChartSelector}>
        {modes.map(mode => (
          <Box
            key={mode}
            className={`${chartButton} ${selectedMode === mode ? 'active' : ''}`}
            onClick={() => setSelectedMode(mode)}
          >
            {mode}
          </Box>
        ))}
      </Box>

      {/* Content */}
      <Box className={contentWrapper}>
        <Grid container>
          {renderContent()}
        </Grid>
      </Box>

      {/* Back Button Centered at Bottom */}
      <Box className={backButton} onClick={() => toggleStats(false)}>
        <ArrowBackIcon sx={{ fontSize: '0.85rem' }} />
        Back to Map
      </Box>
    </Box>
  )
}
