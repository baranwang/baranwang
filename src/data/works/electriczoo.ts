import { getDirImages } from '/@/utils'

export const electriczoo: Work = {
  title: '电子动物园',
  role: ['设计'],
  description: '看见音乐代理的海外 IP - Electric Zoo 的宣传专区及其购票系统的整体设计',
  url: 'http://electriczoo.kanjian.com/',
  images: getDirImages(import.meta.globEager('../assets/electriczoo/*.png')).map(src => ({ src }))
}
