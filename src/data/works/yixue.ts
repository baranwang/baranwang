import { getDirImages } from '/@/utils'

export const yixue: Work = {
  title: '乂学在线学习中心',
  description: '在乂学教育期间独立负责设计的学习中心项目。',
  images: getDirImages(import.meta.globEager('../assets/yixue/*.png')).map(src => ({ src, style: 'block' }))
}
