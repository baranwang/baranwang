import { getDirImages } from '/@/utils'

export const kanjianYuedianHardware: Work = {
  title: '乐典美育',
  role: ['设计'],
  description: '看见音乐乐典项目的大屏硬件，负责整体 UI 设计及还原度跟进',
  images: getDirImages(import.meta.globEager('../assets/kanjian-yuedian-hardware/*.png')).map(src => ({ src, style: 'block' }))
}
