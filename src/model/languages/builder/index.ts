import { MATH } from '../../utilities/math'
import { CLUSTER } from '../clusters'
import { Language, PhonemeCatalog } from '../types'

interface CustomClusterParams {
  len?: number
  long_names?: number
  structures?: {
    [PhonemeCatalog.MIDDLE_CONSONANT]: string
    [PhonemeCatalog.MIDDLE_VOWEL]: string
  }
}

/**
 * filters terms that fall in the given set of letters
 * @param prospects
 * @param letters
 * @returns list prospects that pass
 */
export const validTerms = (prospects: string[], letters: string[]) =>
  prospects.filter(c => c.split('').every(l => letters.includes(l)))

export const randomizePhonemes = (src: Language) => {
  Object.entries(src.basePhonemes).forEach(([k, v]) => {
    src.phonemes[k as PhonemeCatalog] = MATH.buildDistribution(
      v.map(c => ({ v: c, w: window.dice.random })),
      1
    )
  })
}

export const initClusters = (params: {
  src: Language
  shortFirst?: boolean
  clusters?: Record<string, CustomClusterParams>
}) => {
  const { src, shortFirst, clusters } = params
  const { ending } = src
  src.clusters = {
    'solar system': CLUSTER.spawn({
      src: src,
      key: 'solar system',
      ending,
      stopChance: src.articleChance,
      variation: 5,
      longNames: 0.5
    }),
    star: CLUSTER.spawn({
      src: src,
      key: 'star',
      ending,
      stopChance: src.articleChance,
      variation: 5,
      longNames: 0.5
    }),
    satellite: CLUSTER.spawn({
      src: src,
      key: 'satellite',
      ending,
      stopChance: src.articleChance,
      variation: 5,
      longNames: 0.5
    }),
    nation: CLUSTER.spawn({
      src: src,
      key: 'nation',
      ending,
      stopChance: src.articleChance,
      variation: 15,
      longNames: 1
    }),
    male: CLUSTER.spawn({
      src: src,
      key: 'male',
      ending,
      stopChance: src.stopChance,
      len: shortFirst ? 1 : clusters?.male?.len,
      longNames: clusters?.male?.long_names || 0.3,
      variation: 15
    }),
    female: CLUSTER.spawn({
      src: src,
      key: 'female',
      ending: PhonemeCatalog.MIDDLE_VOWEL,
      stopChance: src.stopChance,
      variation: 15,
      len: shortFirst ? 1 : clusters?.female?.len,
      longNames: clusters?.female?.long_names || 0
    })
  }
  // similar first names
  src.clusters.female.patterns = src.clusters.male.patterns
}
