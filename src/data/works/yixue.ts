import { getDirImages } from '/@/utils'

export const yixue: Work = {
  title: '在线学习中心',
  role: ['设计', '前端开发'],
  description: '在乂学教育期间独立负责设计的学习中心项目。',
  images: getDirImages(import.meta.globEager('../assets/yixue/*.png')).map(src => ({ src, style: 'block' }))
}
