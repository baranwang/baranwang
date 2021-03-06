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
import { links } from './data/links';

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
          <Anchor.Link href='#profile' title='????????????' />
          <Anchor.Link href='#works' title='??????????????????'>
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
              ??????
              <strong>
                {chineseName} / {englishName}
              </strong>
              ?????????
              <Popover
                overlayClassName={styles['full-stack-designer']}
                content={<img src={fullStackDesigner} />}>
                <strong>???????????????</strong>
              </Popover>
              ????????? {age} ??????
            </p>
            <p>
              ???????????????
              <strong>
                <a href={`tel:${mobile}`}>{mobile}</a>
              </strong>
              {' ?? '}
              ???????????????
              <strong>
                <a href={`mailto:${email}`}>{email}</a>
              </strong>
            </p>
            <p>
              ????????????????????? <strong>{years}</strong>??????????????? UI
              ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
            </p>
          </section>

          <section>
            <h2>????????????</h2>
            <p>2011 ??? 2014 ?? ??????????????? ?? ????????????</p>
          </section>

          <section>
            <h2>????????????</h2>
            {experience.map((item) => (
              <p key={`${item.company}-${item.startTime}-${item.endTime}`}>
                {item.startTime} ??? {item.endTime} ?? {item.company} ??{' '}
                {item.title}
              </p>
            ))}
          </section>

          <section>
            <h2>????????????</h2>
            {awards.map((item) => (
              <p key={item.name}>
                {item.year} ?? {item.name}
              </p>
            ))}
          </section>

          <section>
            <h2>????????????</h2>
            {links.map((item) => (
              <p key={item.name}>
                <a href={item.url} target='_blank'>
                  [{item.name}] {item.url}
                </a>
              </p>
            ))}
          </section>
        </Card>

        <Card id='works' flex>
          <h1>??????????????????</h1>
          <footer>
            <p>SCROLL DOWN</p>
          </footer>
        </Card>

        {works.map((item, index) => (
          <Card id={`works-${index}`} key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <p>???????????????{item.role.join(' / ')}</p>
            {item.url && (
              <p>
                ???????????????
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
          ?????? PDF
        </Button>
      </footer>
    </div>
  );
}

export default App;
