import { Grid, Chip, Box, Typography } from '@mui/material'
import { NATION } from '../../model/nations'
import { TEXT } from '../../model/utilities/text'
import { SPECIES } from '../../model/species'
import { CodexPage } from '../common/CodexPage'
import { StyledText } from '../common/StyledText'
import { Nation } from '../../model/nations/types'

const NationView = (props: { nation: Nation }) => {
  const nation = props.nation
  const systems = NATION.systems(nation)
  const species = nation.species
  const traitsInfo = SPECIES.getTraitsInfo(species.traits)

  const getArchetypeColor = (archetype: string) => {
    switch (archetype) {
      case 'biological':
        return '#4caf50'
      case 'mechanical':
        return '#2196f3'
      case 'lithic':
        return '#ff9800'
      default:
        return '#9e9e9e'
    }
  }

  const getClassColor = (class_: string) => {
    const colors = {
      humanoid: '#e91e63',
      mammalian: '#795548',
      reptilian: '#8bc34a',
      avian: '#ffc107',
      arthropod: '#ff5722',
      molluscoid: '#9c27b0',
      fungoid: '#607d8b',
      plantoid: '#4caf50',
      lithoid: '#ff9800',
      necroid: '#3f51b5',
      aquatic: '#00bcd4',
      toxoid: '#f44336',
      machine: '#2196f3',
      mechanical: '#2196f3'
    }
    return colors[class_ as keyof typeof colors] || '#9e9e9e'
  }

  const getWorldColor = (world: string) => {
    const worldColors = {
      desert: '#D4A574',
      arid: '#C19A6B',
      savanna: '#8FBC8F',
      oceanic: '#4682B4',
      continental: '#22897a',
      tropical: '#32CD32',
      tundra: '#B0C4DE',
      alpine: '#F5F5DC',
      arctic: '#F0F8FF'
    }
    return worldColors[world as keyof typeof worldColors] || '#9e9e9e'
  }

  const getClimateColor = (climate: string) => {
    const climateColors = {
      dry: '#D4A574', // Sandy brown for dry climates
      wet: '#4682B4', // Steel blue for wet climates
      cold: '#B0C4DE' // Light steel blue for cold climates
    }
    return climateColors[climate as keyof typeof climateColors] || '#9e9e9e'
  }

  const getPreferenceColor = () => {
    if (species.preferences.world) {
      return getWorldColor(species.preferences.world)
    }
    return getClimateColor(species.preferences.climate)
  }

  const getPreferenceTextColor = () => {
    if (species.preferences.world === 'arctic' || species.preferences.world === 'alpine') {
      return 'black'
    }
    return 'white'
  }

  return (
    <CodexPage
      title={nation?.name ?? 'Vacant'}
      subtitle={`Nation (#${nation?.idx})`}
      content={
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <span>
              <b>Systems ({systems.length}): </b>{' '}
              <StyledText
                text={systems.map(system => TEXT.decorate({ link: system })).join(', ')}
              ></StyledText>
            </span>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant='h6' sx={{ mb: 2, color: '#333' }}>
                🧬 Species Profile
              </Typography>

              <Grid container spacing={2} alignItems='center'>
                <Grid item>
                  <Chip
                    label={TEXT.title(species.archetype)}
                    sx={{
                      bgcolor: getArchetypeColor(species.archetype),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Grid>
                <Grid item>
                  <Chip
                    label={TEXT.title(species.class)}
                    sx={{
                      bgcolor: getClassColor(species.class),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Grid>
                <Grid item>
                  <Chip
                    label={`${TEXT.title(species.preferences.climate)}${
                      species.preferences.world ? ` - ${TEXT.title(species.preferences.world)}` : ''
                    }`}
                    sx={{
                      bgcolor: getPreferenceColor(),
                      color: getPreferenceTextColor(),
                      fontWeight: 'bold'
                    }}
                  />
                </Grid>
              </Grid>

              {traitsInfo.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant='subtitle2' sx={{ mb: 1, color: '#666' }}>
                    Traits ({traitsInfo.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {traitsInfo.map((trait, index) => (
                      <Chip
                        key={index}
                        label={`${trait.name}${
                          trait.traitPoints !== 0
                            ? ` (${trait.traitPoints > 0 ? '+' : ''}${trait.traitPoints})`
                            : ''
                        }`}
                        size='small'
                        sx={{
                          bgcolor:
                            trait.traitPoints > 0
                              ? 'rgba(76, 175, 80, 0.2)'
                              : trait.traitPoints < 0
                              ? 'rgba(244, 67, 54, 0.2)'
                              : 'rgba(158, 158, 158, 0.2)',
                          color:
                            trait.traitPoints > 0
                              ? '#2e7d32'
                              : trait.traitPoints < 0
                              ? '#c62828'
                              : '#666',
                          border: `1px solid ${
                            trait.traitPoints > 0
                              ? '#4caf50'
                              : trait.traitPoints < 0
                              ? '#f44336'
                              : '#9e9e9e'
                          }`,
                          fontSize: '0.75rem'
                        }}
                        title={trait.description}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      }
    ></CodexPage>
  )
}

export default NationView
