import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy to Use',
    Svg: require('@site/static/img/plus.svg').default,
    description: (
      <>
        <code>npm i lite-utility</code>
      </>
    ),
  },
  {
    title: 'Functionality',
    Svg: require('@site/static/img/functionality.svg').default,
    description: (
      <>
        Simple timer, repeat timer, retry timer, endlessly timer, stopwatch, event emitter,
        subscribable event, subscribable state, throttle function, debounce function,
        once at a time working function, in memory slider, cache class, simple logger,
        cancelation operation, pipe functions, try catch function wrapper and other...
      </>
    ),
  },
  {
    title: 'Reliability',
    Svg: require('@site/static/img/reliability.svg').default,
    description: (
      <>
       All code is covered with unit tests.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
