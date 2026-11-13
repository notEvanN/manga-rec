// Title sort orders, shared by the carousel and the title grid.
export const SORTERS = {
  newest: null, // server already returns newest first
  rating: (a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1),
  mostRated: (a, b) => b.ratingCount - a.ratingCount || (b.avgRating ?? -1) - (a.avgRating ?? -1),
};
