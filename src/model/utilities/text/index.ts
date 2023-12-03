import { DecorateTextParams } from './types'

const cleanDecoration = (str: string) =>
  str.replace(/@(.+?)@/g, (_, group) => {
    const [label, , , tooltip] = group.split('|')
    return tooltip ? `${label} (${tooltip})` : label
  })

export const TEXT = {
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
  title: (str: string) => {
    return str.replace(/[^\s-()]+/g, txt => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
  }
}
