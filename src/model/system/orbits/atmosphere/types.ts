export type Atmosphere = {
  code: number
  bar: number
  type: 'breathable' | 'exotic' | 'corrosive' | 'insidious' | 'trace' | 'vacuum' | 'gaseous'
  subtype?:
    | 'very thin'
    | 'thin'
    | 'standard'
    | 'dense'
    | 'very dense'
    | 'extremely dense'
    | 'low'
    | 'unusual'
    | 'hydrogen'
    | 'helium'
  tainted?: boolean
  hazard?:
    | 'biologic'
    | 'radioactive'
    | 'gas mix'
    | 'low oxygen'
    | 'high oxygen'
    | 'particulates'
    | 'sulphur compounds'
  unusual?: 'ellipsoid' | 'layered' | 'steam' | 'storms' | 'tides' | 'seasonal' | 'biologic'
}
