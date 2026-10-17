import { Container } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { seoByRoute, SITE } from '@/lib/seo/seo.config';
import { ROUTES } from '@/app/router/paths';
import { pilot } from '@/content/pilot';
import { frequencies } from '@/content/socials';
import { featuredStack } from '@/content/technologies';
import { Hero } from './components/Hero/Hero';
import { CoreActivity } from './components/CoreActivity/CoreActivity';
import { ModuleNav } from './components/ModuleNav/ModuleNav';
import styles from './BridgePage.module.css';

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: pilot.name,
  jobTitle: pilot.role,
  url: SITE.url,
  // Public profiles (GitHub, LinkedIn) — every channel that isn't mailto.
  sameAs: frequencies.map((f) => f.url).filter((url) => url.startsWith('https://')),
  knowsAbout: featuredStack.map((t) => t.name),
};

export default function BridgePage() {
  return (
    <Container>
      <Seo {...seoByRoute.bridge} path={ROUTES.bridge} jsonLd={personJsonLd} />
      <div className={styles.bridge}>
        <Hero />
        <CoreActivity />
        <ModuleNav />
      </div>
    </Container>
  );
}
