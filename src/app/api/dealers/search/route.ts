import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const make = searchParams.get("make");
  const model = searchParams.get("model");
  const yearParam = searchParams.get("year");
  const location = searchParams.get("location");

  if (!make || !model || !yearParam || !location) {
    return NextResponse.json(
      { error: "Missing required parameters: make, model, year, location" },
      { status: 400 }
    );
  }

  const targetYear = parseInt(yearParam, 10);
  const startYear = targetYear - 5;
  const endYear = targetYear;

  // Query construction for future Google Search API usage
  const query = `buy ${make} ${model} ${startYear}..${endYear} near ${location}`;

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  interface GoogleResult {
    title: string;
    link: string;
    snippet: string;
    displayLink?: string;
    pagemap?: {
      cse_image?: { src: string }[];
      cse_thumbnail?: { src: string }[];
    };
    source?: string;
  }

  let results: GoogleResult[] = [];
  let message = "Stub response";

  // Try real API if keys exist
  if (apiKey && cx) {
    try {
      const fetchPage = async (start: number) => {
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10&start=${start}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Google API error: ${res.status}`);
        return await res.json();
      };

      const [page1, page2] = await Promise.all([
        fetchPage(1),
        fetchPage(11)
      ]);

      const items1 = page1.items || [];
      const items2 = page2.items || [];
      results = [...items1, ...items2];
      message = "Real Google Search results";
    } catch (error) {
      console.error("Google Search API failed:", error);
      // Fallback to stub will happen below
    }
  }

  // Fallback to stub if no results
  if (results.length === 0) {
    results = Array.from({ length: 15 }, (_, i) => ({
      title: `${make} ${model} ${endYear - (i % 5)} for sale - Dealer ${i + 1}`,
      link: `https://example.com/dealer-${i + 1}`,
      snippet: `Find the best deals on ${make} ${model} near ${location}. Available in stock at Dealer ${i + 1}. Call for price.`,
      pagemap: {
        cse_image: [
          { src: "https://placehold.co/200x150/0E1B24/E6D6B4?text=Car+Image" }
        ],
        cse_thumbnail: [
          { src: "https://placehold.co/100x75/0E1B24/E6D6B4?text=Thumb" }
        ]
      },
      displayLink: `dealer${i + 1}.com`,
      source: "Google Search Stub"
    }));
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  return NextResponse.json({
    query,
    filters: { make, model, yearRange: `${startYear}-${endYear}`, location },
    results,
    message
  });
}
