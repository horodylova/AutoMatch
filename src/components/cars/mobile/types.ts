export type SwipeDeckItem = {
  id: string;
  make: string;
  model: string;
  trim: string;
  year: number | null;
  price: number | null;
  imageUrl: string;
  specs: {
    engine?: string;
    hp?: string;
    seats?: string;
  };
  versionCount: number;
};

export type SwipeDeckResponse = {
  items: SwipeDeckItem[];
  nextCursor: string | null;
  totalGroups: number;
};
