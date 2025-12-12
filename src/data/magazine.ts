export interface MagazineIssue {
  slug: string;
  title: string;
  tagline?: string;
  printNumber: string;
  releaseDate: string;
  sourceUrl: string;
  coverImageUrl: string;
  pageImageUrls: string[];
}

export const MAGAZINE_ISSUES: MagazineIssue[] = [
  {
    slug: "goodbye-horses",
    title: "Goodbye, Horses",
    tagline: "our first print",
    printNumber: "print #1",
    releaseDate: "04.11.2025",
    sourceUrl: "https://thebumdiary.com/goodbye-horses",
    coverImageUrl: "https://framerusercontent.com/images/c98lxIEjeDoDXbJJ2ueGXi7Jvo.jpg",
    // Extracted from the page's "↓ All Pages" section
    pageImageUrls: [
      "https://framerusercontent.com/images/EUGrQW4I3cUOmWr7lmQavarGg.png",
      "https://framerusercontent.com/images/sCFN7jprzWKlvvb5E0vHZGQ0gRc.png",
      "https://framerusercontent.com/images/9usYurqoMTFc16wsiPbMMoF8D3c.png",
      "https://framerusercontent.com/images/ZjqzKmu2FoNcQ61YwxRSyGa9Po.png",
      "https://framerusercontent.com/images/9EFRzjMlK6oB502zp5DB8j0ZkJM.png",
      "https://framerusercontent.com/images/D7rDDnoBp2r64nwPuNEOeAOBQ.png",
      "https://framerusercontent.com/images/9aV0L9ajwW3BBsZSv2qUCpjRepg.png",
      "https://framerusercontent.com/images/X2ON7dYGe4MnDZS9dgm40WgbvQ.png",
      "https://framerusercontent.com/images/Rzg4tc1idSyQhF9LMDSyyOwS6sI.png",
      "https://framerusercontent.com/images/V31KcBbMWp6Qy6zih2k4wGCFOg.png",
      "https://framerusercontent.com/images/ozhEcWYTo2YrW7uDAvquzqoQFg.png",
    ],
  },
];

export function getMagazineIssue(slug: string): MagazineIssue | undefined {
  return MAGAZINE_ISSUES.find((issue) => issue.slug === slug);
}
