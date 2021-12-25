import { useEffect } from 'react';
import { Col, ColProps, Image, Popover, Row } from 'antd';
import { Card } from './components/Card';
import {
  title,
  chineseName,
  englishName,
  email,
  age,
  years,
  description,
} from './config';
import { experience, works } from './data';
import { Helmet } from 'react-helmet';
import { useRegisterSW } from 'virtual:pwa-register/react';

import styles from './app.module.less';
import fullStackDesigner from '/@/data/assets/full-stack-designer.jpg';

const Footer = () => {
  return (
    <footer>
      <p>
        <a href={`mailto:${email}`}>{email}</a>
        <br />
        <a href='tel:+8618521081077'>+86 185-2108-1077</a>
      </p>
    </footer>
  );
};

function App() {
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW registered', r);
    },
  });

  useEffect(() => {
    if (offlineReady || needRefresh) {
      updateServiceWorker();
    }
  }, [offlineReady, needRefresh]);

  return (
    <div className={styles.app}>
      <Helmet>
        <link rel='preload' href={fullStackDesigner} as='image' />
      </Helmet>
      <Card flex>
        <h1>{title}</h1>
        <p>{description}</p>
        <Footer />
      </Card>

      <Card>
        <section>
          <h2>Hi~</h2>
          <p>
            我是
            <strong>
              {chineseName} / {englishName}
            </strong>
            ，一名
            <Popover
              overlayClassName={styles['full-stack-designer']}
              content={<img src={fullStackDesigner} />}>
              <strong>全栈设计师</strong>
            </Popover>
            ，今年 {age} 岁。
          </p>
          <p>
            联系电话：
            <strong>
              <a href='tel:+8618521081077'>+86 185-2108-1077</a>
            </strong>
            {' · '}
            电子邮箱：
            <strong>
              <a href={`mailto:${email}`}>{email}</a>
            </strong>
          </p>
          <p>
            互联网行业从业 <strong>{years}</strong>，从最初的 UI
            设计师，到现在逐步发展为一名全栈设计师，可独立完成产品的规划、设计及前端开发工作。乐于与团队成员分享，有极强求知欲，对多领域事物充满好奇。
          </p>
        </section>

        <section>
          <h2>教育经历</h2>
          <p>2011 ～ 2014 · 平顶山学院 · 艺术设计</p>
        </section>

        <section>
          <h2>工作经历</h2>
          {experience.map((item) => (
            <p key={`${item.company}-${item.startTime}-${item.endTime}`}>
              {item.startTime} ～ {item.endTime} · {item.company} · {item.title}
            </p>
          ))}
        </section>
      </Card>

      <Card flex>
        <h1>部分项目展示</h1>
        <footer>
          <p>SCROLL DOWN</p>
        </footer>
      </Card>

      {works.map((item) => (
        <Card key={item.title}>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          {item.url && (
            <p>
              项目地址：
              <a href={item.url} target='_blank'>
                {item.url}
              </a>
            </p>
          )}
          <Image.PreviewGroup>
            <Row className={styles.images} gutter={[24, 24]}>
              {item.images.map((image) => {
                const colProps: ColProps = {};
                if (image.style === 'block') {
                  colProps.span = 24;
                } else {
                  colProps.lg = 8;
                  colProps.md = 12;
                  colProps.sm = 24;
                }
                return (
                  <Col {...colProps} key={image.src}>
                    <Image src={image.src} placeholder={<Image preview={false} src={`${image.src}?imageMogr2/blur/50x5/grayscale/1/ignore-error/1`} />} />
                  </Col>
                );
              })}
            </Row>
          </Image.PreviewGroup>
        </Card>
      ))}

      <Card flex>
        <h1>THE END</h1>
        <p>THANKS FOR WATCHING</p>
        <Footer />
      </Card>
    </div>
  );
}

export default App;
