import { getDirImages } from '/@/utils'
import icons from '/@/data/assets/kanjian-android/icons.svg'

export const kanjianAndroid: Work = {
  title: '看见音乐 For Android',
  description: '看见音乐 Android 版项目，负责整体 UI 设计及还原度跟进，并制定基于 Android OS 的可延续性 UI Kit',
  images: [
    ...getDirImages(import.meta.globEager('../assets/kanjian-android/*.png')).map(src => ({ src })),
    {
      src: icons,
      style: 'block'
    }
  ]
}
