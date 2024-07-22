import { DecorateTextParams } from './types'

const cleanDecoration = (str: string) =>
  str.replace(/@(.+?)@/g, (_, group) => {
    const [label, , , tooltip] = group.split('|')
    return tooltip ? `${label} (${tooltip})` : label
  })

const local = 'en-US'

export const TEXT = {
  capitalize: ([firstLetter, ...restOfWord]: string) =>
    firstLetter.toUpperCase() + restOfWord.join(''),
  decorate: ({
    label,
    link,
    tooltip = '',
    color = '',
    italics = false,
    bold = false,
    underlineColor = ''
  }: DecorateTextParams) =>
    `@${label ?? link?.name}##${link?.idx ?? ''}##${link?.tag ?? ''}##${cleanDecoration(
      tooltip
    )}##${color}##${italics}##${bold}##${underlineColor}@`,
  formatters: {
    percent: (value: number, precision = 0) =>
      new Intl.NumberFormat(local, { style: 'percent', minimumFractionDigits: precision }).format(
        value
      ),
    compact: (value: number) => new Intl.NumberFormat(local, { notation: 'compact' }).format(value),
    long: (value: number) => new Intl.NumberFormat(local).format(value),
    list: (list: string[], ending: string) =>
      list.join(', ').replace(/, ([^,]*)$/, `${list.length > 2 ? ',' : ''} ${ending} $1`),
    sentences: (str: string) => {
      const matches = str.match(/.+?[.!?]( |$)/g)
      return (matches?.map(TEXT.capitalize)?.join('') ?? str).replace(/\.+/g, '.')
    }
  },
  title: (str: string) => {
    return str.replace(/[^\s-()]+/g, txt => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
  }
}
