import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';
import Translate from '@docusaurus/Translate';


const FeatureList = [
  {
    title: <Translate
        id="features-easy-of-use.title"
        >
      Easy to Use
      </Translate>,
    Svg: require('/static/img/undraw_Personal_settings_re_i6w4.svg').default,
    description: (
      <Translate
        id="features-easy-of-use.tagline"
        >
      easyjwt has been designed with simplicity and reusability in mind 
      </Translate>
    ),
  },
  {
    title: <Translate
    id="features-simple-jwt-validation.title"
    >
  Simple JWT Validation
  </Translate>,
    Svg: require('/static/img/undraw_Safe_re_kiil.svg').default,
    description: (
      <Translate
        id="features-simple-jwt-validation-tagline"
        >
      easyjwt allows you to validate your JWT with a single function
      </Translate>
    ),
  },
  {
    title: <Translate
    id="features-jwt-signin.title"
    >
  No-brainer JWT signing
  </Translate>,
    Svg: require('/static/img/undraw_Security_on_re_e491.svg').default,
    description: (
      <Translate
      id="features-jwt-signin.tagline"
      >
    easyjwt permits you to create jwt with simple and minimal steps with no crypto knowledge
    </Translate>
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
