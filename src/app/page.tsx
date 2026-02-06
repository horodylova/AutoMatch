import HowItWorks from "../components/HowItWorks";
import CarPersonalities from "../components/CarPersonalities";
import Stats from "../components/Stats";
import AdviceBanner from "../components/AdviceBanner";
import JournalPreview from "../components/JournalPreview";
import DatingHero from "../components/DatingHero";

export default function Page() {
  return (
    <>
      <DatingHero />
      <HowItWorks />
      <AdviceBanner />
      <JournalPreview />
      <Stats />
      <CarPersonalities />
     
    </>
  );
}
