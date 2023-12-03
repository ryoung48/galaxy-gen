import { initClusters, randomizePhonemes } from './builder'
import { buildConsonants } from './builder/consonants'
import { buildBasicVowels, buildComplexVowels } from './builder/vowels'
import { CLUSTER } from './clusters'
import { Language, PhonemeCatalog, WordParams } from './types'

const spawn = () => {
  const lang: Language = {
    stop: ' ',
    stopChance: 0,
    basePhonemes: {
      [PhonemeCatalog.START_CONSONANT]: [],
      [PhonemeCatalog.MIDDLE_CONSONANT]: [],
      [PhonemeCatalog.END_CONSONANT]: [],
      [PhonemeCatalog.START_VOWEL]: [],
      [PhonemeCatalog.FRONT_VOWEL]: [],
      [PhonemeCatalog.MIDDLE_VOWEL]: [],
      [PhonemeCatalog.BACK_VOWEL]: [],
      [PhonemeCatalog.END_VOWEL]: []
    },
    phonemes: {
      [PhonemeCatalog.START_CONSONANT]: [],
      [PhonemeCatalog.MIDDLE_CONSONANT]: [],
      [PhonemeCatalog.END_CONSONANT]: [],
      [PhonemeCatalog.START_VOWEL]: [],
      [PhonemeCatalog.FRONT_VOWEL]: [],
      [PhonemeCatalog.MIDDLE_VOWEL]: [],
      [PhonemeCatalog.BACK_VOWEL]: [],
      [PhonemeCatalog.END_VOWEL]: []
    },
    vowels: [],
    diphthongs: [],
    digraphs: [],
    clusters: {},
    ending:
      window.dice.random > 0.15 ? PhonemeCatalog.MIDDLE_CONSONANT : PhonemeCatalog.MIDDLE_VOWEL,
    consonantChance: window.dice.uniform(0.1, 0.4),
    articleChance: window.dice.uniform(0, 0.05),
    predefined: {}
  }
  return lang
}

const baseVowels = ['a', 'e', 'i', 'o', 'u', 'y']

export const LANGUAGE = {
  word: {
    simple: ({
      lang,
      key,
      repeat = false,
      len,
      ending = lang.ending,
      stopChance,
      variation = 10
    }: WordParams) => {
      // create a new cluster if one doesn't already exist
      if (!lang.clusters[key])
        lang.clusters[key] = CLUSTER.spawn({
          src: lang,
          key,
          len,
          ending,
          stopChance,
          variation
        })
      return CLUSTER.word(lang.clusters[key], lang, repeat)
    },
    unique: (params: WordParams): string => {
      const w = LANGUAGE.word.simple(params)
      if (window.galaxy.uniqueNames[w]) {
        return LANGUAGE.word.unique({ ...params, repeat: true })
      }
      window.galaxy.uniqueNames[w] = true
      return w
    }
  },
  spawn: (human?: boolean) => {
    const lang = spawn()
    // stop chance
    const stop = window.dice.weightedChoice([
      { v: ' ', w: 0.6 },
      { v: "'", w: human ? 0 : 0.25 },
      { v: '-', w: human ? 0 : 0.15 }
    ])
    lang.stop = stop
    const stopChance = stop === "'" ? window.dice.uniform(0.3, 0.6) : stop === '-' ? 1 : 0
    lang.stopChance = stopChance
    // phonemes
    const vowels = buildBasicVowels({ ending: lang.ending })
    const { consonantPhonemes } = buildConsonants({ ending: lang.ending, vowels })
    const { uniqueVowels, vowelPhonemes } = buildComplexVowels({
      vowels,
      consonants: consonantPhonemes[PhonemeCatalog.END_CONSONANT],
      stops: stopChance,
      ending: lang.ending
    })
    lang.vowels = uniqueVowels
    lang.diphthongs = lang.vowels.filter(v => !baseVowels.includes(v))
    lang.digraphs = Array.from(
      new Set(
        Object.entries(consonantPhonemes)
          .map(([, v]) => v)
          .flat()
          .filter(c => c.length > 1 && !['ng', 'str', 'th', 'sh', 'dr', 'br'].includes(c))
      )
    )
    lang.basePhonemes = { ...consonantPhonemes, ...vowelPhonemes }
    randomizePhonemes(lang)
    // word clusters: each cluster has similar words
    initClusters({
      shortFirst: lang.ending === PhonemeCatalog.MIDDLE_VOWEL && window.dice.random > 0.9,
      src: lang
    })
    const cluster = CLUSTER.spawn({ src: lang, key: 'generic', len: 1 })
    // create title & article words
    lang.predefined = {
      the: [
        CLUSTER.simple(
          cluster,
          lang,
          window.dice.weightedChoice([
            { v: `${PhonemeCatalog.START_VOWEL}${PhonemeCatalog.END_CONSONANT}`, w: 0.2 },
            {
              v: `${PhonemeCatalog.START_CONSONANT}${PhonemeCatalog.MIDDLE_VOWEL}${PhonemeCatalog.END_CONSONANT}`,
              w: 0.8
            }
          ])
        )
      ],
      title: [
        CLUSTER.simple(
          cluster,
          lang,
          window.dice.weightedChoice([
            { v: `${PhonemeCatalog.START_VOWEL}${PhonemeCatalog.END_CONSONANT}`, w: 0.2 },
            {
              v: `${PhonemeCatalog.START_CONSONANT}${PhonemeCatalog.MIDDLE_VOWEL}${PhonemeCatalog.END_CONSONANT}`,
              w: 0.8
            }
          ])
        )
      ]
    }
    return lang
  }
}
