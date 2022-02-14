import { getDirImages } from '/@/utils'

export const casualday: Work = {
  title: 'Casual Day',
  role: ['前端开发', '后端开发'],
  description: '音乐厂牌 Casual Day 官网的前后端开发。',
  url: 'https://www.casualday.cn/',
  images: getDirImages(import.meta.globEager('../assets/casualday/*.png')).map(src => ({ src, style: 'block' })),
}
