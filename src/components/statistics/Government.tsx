import { range } from 'd3'
import { CustomPieChart } from './pie'
import { interpolatePurples } from 'd3'

export const GovernmentDistribution = () => {
  const govFreq = window.galaxy.orbits
    .filter(orbit => orbit.government !== undefined && orbit?.population!.code > 0)
    .reduce((dict: Record<number, number>, orbit) => {
      const gov = orbit.government!
      if (!dict[gov]) dict[gov] = 0
      dict[gov] += 1
      return dict
    }, {})

  const total = Object.values(govFreq).reduce((sum, count) => sum + count, 0)

  // Generate colors for different government types using red scale
  const colors = range(0, 16).map(i => interpolatePurples(i / 15))

  const getGovernmentLabel = (code: number): string => {
    if (code === 0) return 'Family/Clan/Tribal'
    if (code === 1) return 'Company/Corporation'
    if (code === 2) return 'Participating Democracy'
    if (code === 3) return 'Self-Perpetuating Oligarchy'
    if (code === 4) return 'Representative Democracy'
    if (code === 5) return 'Feudal Technocracy'
    if (code === 6) return 'Captive Government'
    if (code === 7) return 'Balkanisation'
    if (code === 8) return 'Civil Service Bureaucracy'
    if (code === 9) return 'Impersonal Bureaucracy'
    if (code === 10) return 'Charismatic Dictatorship'
    if (code === 11) return 'Non-Charismatic Dictatorship'
    if (code === 12) return 'Charismatic Oligarchy'
    if (code === 13) return 'Religious Dictatorship'
    if (code === 14) return 'Religious Autocracy'
    if (code === 15) return 'Totalitarian Oligarchy'
    return `Government Code ${code}`
  }

  const data = Object.entries(govFreq)
    .map(([code, count]) => ({
      id: getGovernmentLabel(parseInt(code)),
      label: getGovernmentLabel(parseInt(code)),
      value: count,
      color: colors[parseInt(code)]
    }))
    .sort((a, b) => {
      const aNum = Object.keys(govFreq).find(key => getGovernmentLabel(parseInt(key)) === a.id)
      const bNum = Object.keys(govFreq).find(key => getGovernmentLabel(parseInt(key)) === b.id)
      return parseInt(aNum || '0') - parseInt(bNum || '0')
    })

  return <CustomPieChart data={data} total={total} />
}
