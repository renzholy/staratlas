import dayjs from 'dayjs'

export const numberFormat = Intl.NumberFormat()

export function formatTime(date?: dayjs.ConfigType) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export function formatTimeSimple(date?: dayjs.ConfigType) {
  return dayjs(date).format('MM-DD HH:mm:ss')
}
