import { formatDistanceToNowStrict } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { name, author } from '../package.json';

export const title = name;
export const chineseName = '王柄涵';
export const englishName = 'Baran';
export const email = author.email;
export const birthday = new Date('1993-05-01T12:40:00.000Z');
export const startTime = new Date('2014-03-08T00:00:00.000Z');
export const age = parseInt(
  formatDistanceToNowStrict(birthday, { unit: 'year' })
);
export const years = formatDistanceToNowStrict(startTime, { locale: zhCN });
export const description = `${chineseName} · ${years} · 全栈设计师 / UI 设计师 / 前端开发工程师`