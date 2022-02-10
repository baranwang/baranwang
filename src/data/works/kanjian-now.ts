import { getDirImages } from '/@/utils'

export const kanjianNow: Work = {
  title: '看见独立志（看见NOW）',
  role: ['产品', '前端开发', '设计',],
  description: '实验性项目，作为项目 Leader 独立设计及开发了整个项目。',
  images: getDirImages(import.meta.globEager('../assets/kanjian-now/*.png')).map(src => ({ src }))
}
