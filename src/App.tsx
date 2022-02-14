import { useEffect, useState } from 'react';
import { Anchor, Button, Col, ColProps, Popover, Row, Space, Tag } from 'antd';
import { Card } from './components/Card';
import { Image } from './components/Image';
import {
  title,
  chineseName,
  englishName,
  email,
  mobile,
  age,
  years,
  description,
} from './config';
import { awards, experience, works } from './data';
import { Helmet } from 'react-helmet';
import { useRegisterSW } from 'virtual:pwa-register/react';

import classNames from 'classnames';
import styles from './app.module.less';
import resumePDF from '/@/resume.pdf?url';
import fullStackDesigner from '/@/data/assets/full-stack-designer.jpg';

const Footer = () => {
  return (
    <footer>
      <p>
        <a href={`mailto:${email}`}>{email}</a>
        <br />
        <a href={`tel:${mobile}`}>{mobile}</a>
      </p>
    </footer>
  );
};

function App() {
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (offlineReady || needRefresh) {
      updateServiceWorker();
    }
  }, [offlineReady, needRefresh]);

  const [showDownload, setShowDownload] = useState(true);

  useEffect(() => {
    const hanlderPrint = (e: Event) => {
      e.preventDefault();
      window.location.assign(`/${title}.pdf`);
    };

    let isScrolling: number;
    const handleScroll = () => {
      setShowDownload(false);
      window.clearTimeout(isScrolling);
      isScrolling = window.setTimeout(function () {
        console.log('Scrolling has stopped.');
        setShowDownload(true);
      }, 500);
    };

    window.addEventListener('scroll', handleScroll, false);
    window.addEventListener('beforeprint', hanlderPrint, false);
    return () => {
      window.removeEventListener('scroll', handleScroll, false);
      window.removeEventListener('beforeprint', hanlderPrint, false);
    };
  }, []);

  return (
    <div className={styles.app}>
      <Helmet>
        <link rel='preload' href={fullStackDesigner} as='image' />
      </Helmet>

      <aside>
        <Anchor>
          <Anchor.Link href='#profile' title='个人简介' />
          <Anchor.Link href='#works' title='部分项目展示'>
            {works.map((work, index) => (
              <Anchor.Link
                key={index}
                href={`#works-${index}`}
                title={<span title={work.description}>{work.title}</span>}
              />
            ))}
          </Anchor.Link>
        </Anchor>
      </aside>
      <main>
        <Card flex>
          <h1>{title}</h1>
          <p>{description}</p>
          <Footer />
        </Card>

        <Card id='profile'>
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
                <a href={`tel:${mobile}`}>{mobile}</a>
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
                {item.startTime} ～ {item.endTime} · {item.company} ·{' '}
                {item.title}
              </p>
            ))}
          </section>

          <section>
            <h2>获奖经历</h2>
            {awards.map((item) => (
              <p key={item.name}>
                {item.year} · {item.name}
              </p>
            ))}
          </section>
        </Card>

        <Card id='works' flex>
          <h1>部分项目展示</h1>
          <footer>
            <p>SCROLL DOWN</p>
          </footer>
        </Card>

        {works.map((item, index) => (
          <Card id={`works-${index}`} key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <p>项目角色：{item.role.join(' / ')}</p>
            {item.url && (
              <p>
                项目地址：
                <a href={item.url} target='_blank'>
                  {item.url}
                </a>
              </p>
            )}

            <Row className={styles.images} gutter={[24, 24]}>
              {item.images.map((image) => {
                const colProps: ColProps = {};
                if (image.style === 'block') {
                  colProps.span = 24;
                } else {
                  colProps.lg = 8;
                  colProps.md = 12;
                  colProps.sm = 24;
                  colProps.className = styles['images-inline'];
                }
                return (
                  <Col {...colProps} key={image.src}>
                    <Image src={image.src} />
                  </Col>
                );
              })}
            </Row>
          </Card>
        ))}

        <Card flex>
          <h1>THE END</h1>
          <p>THANKS FOR WATCHING</p>
          <Footer />
        </Card>
      </main>

      <footer
        className={classNames(styles.footer, {
          [styles['footer-hide']]: !showDownload,
        })}>
        <Button
          type='primary'
          size='large'
          href={resumePDF}
          download={`${description}.pdf`}>
          下载 PDF
        </Button>
      </footer>
    </div>
  );
}

export default App;
