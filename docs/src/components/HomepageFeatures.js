import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Easy to Use',
    Svg: require('/static/img/undraw_Personal_settings_re_i6w4.svg').default,
    description: (
      <>
        easyjwt has been designed with simplicity and reusability in mind 
      </>
    ),
  },
  {
    title: 'Simple JWT validation',
    Svg: require('/static/img/undraw_Safe_re_kiil.svg').default,
    description: (
      <>
        easyjwt allows you to validate your JWT with a single function
      </>
    ),
  },
  {
    title: 'No-brainer JWT signing',
    Svg: require('/static/img/undraw_Security_on_re_e491.svg').default,
    description: (
      <>
        easyjwt permits you to create jwt with simple and minimal steps with no crypto knowledge
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
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
