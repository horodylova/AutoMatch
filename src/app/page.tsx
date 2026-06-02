import { Suspense } from "react";
import JournalPreview from "../components/JournalPreview";
import DatingHero from "../components/DatingHero";
import HomeBelowFold from "../components/HomeBelowFold";

export default function Page() {
  return (
    <>
      <DatingHero />
      <Suspense fallback={null}>
        <JournalPreview />
      </Suspense>
      <HomeBelowFold />
     
    </>
  );
}
