import { range } from 'd3'
import { OrbitalDeposit, OrbitalDepositSpawnParams, Resource } from './types'

const deposits: OrbitalDeposit = {
  minerals: {
    tag: 'M',
    color: '#d66c57',
    weight: 20,
    max: 5,
    weights: {
      asteroid: 2,
      barren: 1,
      molten: 0.5,
      toxic: 0.5,
      frozen: 0.5
    }
  },
  energy: {
    tag: 'E',
    color: '#d6ba57',
    weight: 10,
    max: 5,
    weights: {
      'a star': 0.5,
      'b star': 0.5,
      'f star': 1.25,
      'g star': 1.25,
      'k star': 1.5,
      'm star': 1.5,
      'm red giant': 1.5,
      't star': 1.5,
      'gas giant': 2,
      molten: 1,
      toxic: 1,
      'ice asteroid': 1
    }
  },
  society: {
    tag: 'SOC',
    color: '#57d6a5',
    weight: 10,
    max: 5,
    weights: { toxic: 1 }
  },
  physics: {
    tag: 'PHY',
    color: '#57aed6',
    weight: 2,
    max: 5,
    weights: {
      'a star': 3,
      'b star': 3,
      'f star': 2,
      'g star': 2,
      'k star': 1.5,
      'm star': 1.5,
      'm red giant': 1.5,
      't star': 1.5,
      'neutron star': 5,
      'black hole': 5,
      pulsar: 5
    }
  },
  engineering: {
    tag: 'ENG',
    color: '#d6a757',
    weight: 2,
    max: 5,
    weights: {
      frozen: 1,
      'gas giant': 1,
      'neutron star': 5,
      'black hole': 5,
      pulsar: 5
    }
  },
  trade: {
    tag: 'T',
    color: 'white',
    weight: 10,
    max: 5,
    weights: {
      asteroid: 2,
      'ice asteroid': 2,
      molten: 0.5,
      toxic: 1,
      'gas giant': 1
    }
  },
  'exotic gas': {
    tag: 'EG',
    color: '#0b6b33',
    weight: 1.5,
    max: 2,
    weights: {
      toxic: 1,
      'gas giant': 1,
      'ice asteroid': 0.5
    }
  },
  'rare crystals': {
    tag: 'RC',
    color: '#d6cc82',
    weight: 1.5,
    max: 2,
    weights: {
      frozen: 1
    }
  },
  'volatile motes': {
    tag: 'VM',
    color: '#c48507',
    weight: 1.5,
    max: 2,
    weights: {
      molten: 1,
      asteroid: 0.5
    }
  },
  zro: {
    tag: 'Z',
    color: '#4807c1',
    weight: 1,
    max: 2,
    weights: { toxic: 1 }
  },
  alloys: {
    tag: 'AL',
    color: '#a94fd6',
    weight: 1,
    max: 2,
    weights: { molten: 0.5, asteroid: 0.5 }
  }
}

export const ORBITAL_DEPOSITS = {
  deposits,
  spawn: ({ object }: OrbitalDepositSpawnParams) => {
    Object.entries(deposits)
      .filter(([, resource]) => resource.weights[object.type])
      .forEach(([key, resource]) => {
        const spawn = window.dice.weightedChoice<false | { type: Resource; amount: number }>([
          ...range(resource.max).map(i => ({
            v: { type: key as Resource, amount: i + 1 },
            w: (resource.weights[object.type] ?? 0) / 2 ** i
          })),
          { v: false as const, w: 30 }
        ])
        if (spawn) object.resources.push(spawn)
      })
  }
}
