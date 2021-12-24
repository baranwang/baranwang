import { getDirImages } from '/@/utils'

export const smemo: Work = {
  title: '智能备忘录',
  description: '从大学开始和朋友一起合作的一款工具类 APP，主要负责产品逻辑优化、 UI 设计、及前端开发工作。项目曾获国家级比赛一等奖，目前累计安装超 200 万次，DAU 20,000+',
  images: getDirImages(import.meta.globEager('../assets/smemo/*.png')).map(src => ({ src }))
}
