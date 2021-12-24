import { getDirImages } from '/@/utils'

export const kanjianTV4Wasu: Work = {
  title: '看见音乐 For 华数 TV',
  description: '看见音乐与华数 TV 合作项目，负责整体 UI 设计工作',
  images: getDirImages(import.meta.globEager('../assets/kanjian-tv-for-wasu/*.png')).map(src => ({ src, style: 'block' }))
}
