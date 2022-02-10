import { getDirImages } from '/@/utils'

export const kanjianTV: Work = {
  title: '看见音乐 For Android TV',
  role: ['设计'],
  description: '看见音乐 TV 版项目，负责整体 UI 设计及还原度跟进',
  images: getDirImages(import.meta.globEager('../assets/kanjian-tv/*.png')).map(src => ({ src, style: 'block' }))
}
