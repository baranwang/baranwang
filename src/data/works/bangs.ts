import { getDirImages } from '/@/utils'

export const bangs: Work = {
  title: '给你手机换个发型',
  role: ['产品', '设计', '前端开发', '后端开发'],
  description: '2017 年 iPhone X 刚发布时，参考 APP Custom Notch 的 idea 自己 redesign 并基于微信小程序开发了一款小程序，曾一度引爆网络，上线两个月用户突破 500 万，累计访问数千万，同时给公众号引入粉丝达近 100 万。',
  images: getDirImages(import.meta.globEager('../assets/bangs/*.png')).map(src => ({ src })),
}
