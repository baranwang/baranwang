import { getDirImages } from '/@/utils'
import icons from '/@/data/assets/kanjian-android/icons.png'

export const kanjianAndroid: Work = {
  title: '看见音乐 For Android',
  role: ['设计'],
  description: '看见音乐 Android 版项目，负责整体 UI 设计及还原度跟进，并制定基于 Android OS 的可延续性 UI Kit',
  images: [
    ...getDirImages(import.meta.globEager('../assets/kanjian-android/screenshot/*.png')).filter(item => !item.endsWith('icons.png')).map(src => ({ src })),
    {
      src: icons,
      style: 'block'
    }
  ]
}
