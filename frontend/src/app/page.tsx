import HeroSection from './components/HeroSection';
import { TrustStatsStrip } from './components/TrustStatsStrip';
import { HowitWorksSection } from './components/HowitWorksSection';
import CategoryGridSection from './components/CategoryGridSection';
import { TrustDataSourcesStrip } from './components/TrustDataSourcesStrip';
import { LandingCTA } from './components/LandingCTA';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStatsStrip />
      <HowitWorksSection />
      <CategoryGridSection />
      <TrustDataSourcesStrip />
      <LandingCTA />
    </>
  );
}