import { Suspense } from "react";
import JournalPreview from "../components/JournalPreview";
import DatingHero from "../components/DatingHero";
import DreamGarageSpotlight from "../components/DreamGarageSpotlight";
import HomeBelowFold from "../components/HomeBelowFold";

export default function Page() {
  return (
    <>
      <DatingHero />
      <DreamGarageSpotlight />
      <Suspense fallback={null}>
        <JournalPreview />
      </Suspense>
      <HomeBelowFold />
     
    </>
  );
}
