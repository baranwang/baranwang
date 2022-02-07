import ReactPDF, {
  Document,
  Page,
  Text,
  Font,
  StyleSheet,
  Link,
  View,
  Image,
} from '@react-pdf/renderer';
import cjk from 'cjk-regex';
import {
  title,
  description,
  chineseName,
  englishName,
  email,
  mobile,
  age,
  years,
} from '/@/config';
import { experience, works } from '/@/data';
import { resolve } from 'path';
import { useMemo } from 'react';
import sharp from 'sharp';

import type { Style } from '@react-pdf/types/style';

Font.register({
  family: 'Taipei Sans TC',
  fonts: [
    {
      fontWeight: 'thin',
      src: resolve(__dirname, '../fonts/TaipeiSansTCBeta-Light.ttf'),
    },
    {
      fontWeight: 'heavy',
      src: resolve(__dirname, '../fonts/TaipeiSansTCBeta-Bold.ttf'),
    },
  ],
});

Font.registerHyphenationCallback((word) => {
  if (cjk().toRegExp().test(word)) {
    return word.split('');
  }
  return [word];
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#424242',
    padding: 80,
    color: '#fff',
    fontFamily: 'Taipei Sans TC',
  },
  pageFlex: {
    flexDirection: 'column',
  },
  footer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: -16,
  },
  h1: {
    fontSize: 80,
    lineHeight: 1.25,
    fontWeight: 'thin',
  },
  h2: {
    fontSize: 40,
    lineHeight: 1.25,
    fontWeight: 'heavy',
    marginBottom: 16,
  },
  p: {
    fontSize: 24,
    fontWeight: 'thin',
    marginBottom: 16,
    lineHeight: 1.5,
    textAlign: 'left',
  },
  a: {
    color: '#fff',
  },
  strong: {
    fontWeight: 'heavy',
  },
});

const PageProps = (flex = false) => {
  const pageProps: ReactPDF.PageProps = {};
  if (flex) {
    pageProps.size = [1280, 720];
    pageProps.style = [styles.page, styles.pageFlex];
  } else {
    pageProps.size = [1280];
    pageProps.style = styles.page;
  }
  return pageProps;
};

const Footer = () => (
  <View style={styles.footer}>
    <Text style={styles.p}>
      <Link src={`mailto:${email}`} style={styles.a}>
        {email}
      </Link>
    </Text>
    <Text style={styles.p}>
      <Link src={`tel:${mobile}`} style={styles.a}>
        {mobile}
      </Link>
    </Text>
  </View>
);

const Images: React.FC<{
  images: { src: string | Promise<string>; style?: 'block' | 'inline' }[];
}> = ({ images }) => {
  const rows = useMemo(() => {
    const list: {
      src: string | Promise<string>;
      style?: 'block' | 'inline';
    }[][] = [];

    const resizeBase64 = (src: string, size: number) => {
      return sharp(Buffer.from(src.split(',').pop()!, 'base64'))
        .resize(size)
        .flatten({ background: { r: 66, g: 66, b: 66 } })
        .jpeg({ mozjpeg: true, quality: 99 })
        .toBuffer()
        .then((data) => `data:image/jpeg;base64,${data.toString('base64')}`);
    };
    for (const image of images) {
      if (image.style === 'block') {
        image.src = resizeBase64(image.src as string, 1120);
        list.push([image]);
      } else {
        image.src = resizeBase64(image.src as string, 400);

        const lastRow = list[list.length - 1];
        if (lastRow && lastRow[0].style !== 'block') {
          if (lastRow.length < 3) {
            lastRow.push(image);
          } else {
            list.push([image]);
          }
        } else {
          list.push([image]);
        }
      }
    }
    return list;
  }, [images]);

  return (
    <View style={{ margin: -8, marginTop: 16 }}>
      {rows.map((row, index) => {
        let flexDirection: Style['flexDirection'] = 'column';
        if (row[0].style !== 'block') {
          flexDirection = 'row';
          if (row.length < 3) {
            row = row.concat(
              Array(3 - row.length).fill({
                src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=',
              })
            );
          }
        }
        return (
          <View key={index} style={{ flexDirection }}>
            {row.map((image, index) => (
              <View key={index} style={{ padding: 8 }}>
                <Image src={image.src} />
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
};

const Resume = () => {
  return (
    <Document title={title} author={englishName} subject={description}>
      <Page {...PageProps(true)}>
        <Text style={styles.h1}>{title}</Text>
        <Text style={styles.p}>{description}</Text>
        <Footer />
      </Page>
      <Page {...PageProps()}>
        <Text style={styles.h2}>Hi~</Text>
        <Text style={styles.p}>
          我是
          <Text style={styles.strong}>
            {chineseName} / {englishName}
          </Text>
          ，一名 <Text style={styles.strong}>全栈设计师</Text>，今年 {age} 岁。
        </Text>
        <Text style={styles.p}>
          联系电话：
          <Link src={`tel:${mobile}`} style={[styles.strong, styles.a]}>
            {mobile}
          </Link>
          {' · '}
          电子邮箱：
          <Link src={`mailto:${email}`} style={[styles.strong, styles.a]}>
            {email}
          </Link>
        </Text>
        <Text style={styles.p}>
          互联网行业从业 <Text style={styles.strong}>{years}</Text>，从最初的 UI
          设计师，到现在逐步发展为一名全栈设计师，可独立完成产品的规划、设计及前端开发工作。乐于与团队成员分享，有极强求知欲，对多领域事物充满好奇。
        </Text>

        <Text style={{ ...styles.h2, marginTop: 40 }}>教育经历</Text>
        <Text style={styles.p}>2011 ～ 2014 · 平顶山学院 · 艺术设计</Text>

        <Text style={{ ...styles.h2, marginTop: 40 }}>工作经历</Text>
        {experience.map((item) => (
          <Text
            key={`${item.company}-${item.startTime}-${item.endTime}`}
            style={styles.p}>
            {item.startTime} ～ {item.endTime} · {item.company} · {item.title}
          </Text>
        ))}
      </Page>
      <Page {...PageProps(true)}>
        <Text style={styles.h1}>部分项目展示</Text>
        <View style={styles.footer}>
          <Text style={styles.p}>SCROLL DOWN</Text>
        </View>
      </Page>
      {works.map((item) => (
        <Page key={item.title} {...PageProps()}>
          <Text style={styles.h2}>{item.title}</Text>
          <Text style={styles.p}>{item.description}</Text>
          {item.url && (
            <Text style={styles.p}>
              项目地址：
              <Link src={item.url} style={styles.a}>
                {item.url}
              </Link>
            </Text>
          )}
          <Images images={item.images} />
        </Page>
      ))}
      <Page {...PageProps(true)}>
        <Text style={styles.h1}>THE END</Text>
        <Text style={styles.p}>THANKS FOR WATCHING</Text>
        <Footer />
      </Page>
    </Document>
  );
};

ReactPDF.render(<Resume />, resolve(process.cwd(), 'public', `${title}.pdf`));
