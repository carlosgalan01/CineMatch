import data from "@/data/movielens.json";

type Rating = { movieId: number; rating: number };
type Movie = { id: number; title: string; rating: number; count: number };
type Source = "item" | "users" | "popular";

const movieTitles = new Map<number, string>(data.movies as Array<[number, string]>);
const userRatings = new Map<number, Map<number, number>>();
const itemRatings = new Map<number, Array<[number, number]>>();
const stats = new Map<number, { sum: number; count: number }>();

for (const [userId, movieId, rating] of data.ratings) {
  if (!userRatings.has(userId)) userRatings.set(userId, new Map());
  userRatings.get(userId)!.set(movieId, rating);
  if (!itemRatings.has(movieId)) itemRatings.set(movieId, []);
  itemRatings.get(movieId)!.push([userId, rating]);
  const current = stats.get(movieId) ?? { sum: 0, count: 0 };
  current.sum += rating;
  current.count += 1;
  stats.set(movieId, current);
}

const toMovie = (id: number): Movie => {
  const stat = stats.get(id) ?? { sum: 0, count: 0 };
  return { id, title: movieTitles.get(id) ?? "Unknown title", rating: +(stat.sum / stat.count).toFixed(2), count: stat.count };
};

function popularity(excluded: Set<number>) {
  return [...stats.entries()]
    .filter(([id, stat]) => !excluded.has(id) && stat.count >= 40)
    .sort((a, b) => b[1].count - a[1].count || b[1].sum / b[1].count - a[1].sum / a[1].count)
    .slice(0, 40)
    .map(([id]) => ({ ...toMovie(id), score: 1 }));
}

function userBased(ratings: Rating[], excluded: Set<number>) {
  const neighbours: Array<{ id: number; similarity: number; overlap: number }> = [];
  for (const [userId, profile] of userRatings) {
    let dot = 0, normA = 0, normB = 0, overlap = 0;
    for (const { movieId, rating } of ratings) {
      const historic = profile.get(movieId);
      if (historic !== undefined) {
        dot += rating * historic; normA += rating ** 2; normB += historic ** 2; overlap++;
      }
    }
    if (overlap >= 2 && normA && normB) {
      const similarity = dot / Math.sqrt(normA * normB);
      if (similarity > 0.68) neighbours.push({ id: userId, similarity, overlap });
    }
  }
  const top = neighbours.sort((a, b) => b.similarity - a.similarity).slice(0, 25);
  const scores = new Map<number, { sum: number; weight: number; support: number }>();
  for (const neighbour of top) {
    for (const [movieId, rating] of userRatings.get(neighbour.id)!) {
      if (excluded.has(movieId)) continue;
      const row = scores.get(movieId) ?? { sum: 0, weight: 0, support: 0 };
      row.sum += neighbour.similarity * rating; row.weight += neighbour.similarity; row.support++;
      scores.set(movieId, row);
    }
  }
  const movies = [...scores.entries()]
    .filter(([, value]) => value.support >= 2)
    .map(([id, value]) => ({ ...toMovie(id), score: value.sum / value.weight, support: value.support }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 40);
  return { movies, neighbourCount: top.length };
}

function itemBased(ratings: Rating[], excluded: Set<number>) {
  const scores = new Map<number, { weighted: number; weight: number; support: number; because: number | null }>();
  for (const { movieId: seed, rating: seedRating } of ratings) {
    const seedUsers = itemRatings.get(seed) ?? [];
    const seedNorm = Math.sqrt(seedUsers.reduce((total, [, value]) => total + value ** 2, 0));
    const dots = new Map<number, number>();
    const norms = new Map<number, number>();
    for (const [userId, seedValue] of seedUsers) {
      for (const [candidate, candidateValue] of userRatings.get(userId) ?? []) {
        if (candidate === seed || excluded.has(candidate)) continue;
        dots.set(candidate, (dots.get(candidate) ?? 0) + seedValue * candidateValue);
        norms.set(candidate, (norms.get(candidate) ?? 0) + candidateValue ** 2);
      }
    }
    for (const [candidate, dot] of dots) {
      const similarity = dot / (seedNorm * Math.sqrt(norms.get(candidate) ?? 1));
      if (similarity < 0.35) continue;
      const row = scores.get(candidate) ?? { weighted: 0, weight: 0, support: 0, because: null };
      row.weighted += similarity * seedRating; row.weight += similarity; row.support++;
      if (seedRating >= 4) row.because = seed;
      scores.set(candidate, row);
    }
  }
  return [...scores.entries()]
    .filter(([id, value]) => (stats.get(id)?.count ?? 0) >= 15 && value.support >= 1)
    .map(([id, value]) => ({ ...toMovie(id), score: value.weighted / value.weight, support: value.support, because: value.because ? movieTitles.get(value.because) : undefined }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 40);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { ratings?: Rating[] };
  const ratings = (body.ratings ?? []).filter((r) => Number.isInteger(r.movieId) && r.rating >= 1 && r.rating <= 5).slice(0, 30);
  if (ratings.length < 2) return Response.json({ error: "Rate at least two films." }, { status: 400 });
  const excluded = new Set(ratings.map((r) => r.movieId));
  const popular = popularity(excluded);
  const item = itemBased(ratings, excluded);
  const userResult = userBased(ratings, excluded);
  const users = userResult.movies;
  const becauseByMovie = new Map(item.map((movie) => [movie.id, movie.because]));
  const blend = new Map<number, { score: number; contributions: Partial<Record<Source, number>> }>();
  const add = (rows: Array<Movie & { score: number }>, weight: number, source: Source) => rows.slice(0, 20).forEach((row, index) => {
    const current = blend.get(row.id) ?? { score: 0, contributions: {} };
    const contribution = weight * ((21 - index) / 20);
    current.score += contribution;
    current.contributions[source] = (current.contributions[source] ?? 0) + contribution;
    blend.set(row.id, current);
  });
  add(popular, ratings.length < 5 ? 0.45 : 0.1, "popular");
  add(item, ratings.length < 5 ? 0.4 : 0.55, "item");
  add(users, ratings.length < 5 ? 0.15 : 0.35, "users");
  const hybrid = [...blend.entries()].map(([id, value]) => {
    const reasonType = (Object.entries(value.contributions).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "popular") as Source;
    const because = becauseByMovie.get(id)?.replace(/\s*\(\d{4}\)$/, "");
    const reason = reasonType === "item"
      ? because ? `Porque te gustó ${because}` : "Parecida a películas que valoraste"
      : reasonType === "users" ? "Usuarios con gustos similares" : "Favorita de la comunidad";
    return { ...toMovie(id), score: +value.score.toFixed(3), reason, reasonType, because };
  })
    .sort((a, b) => b.score - a.score).slice(0, 40);
  return Response.json({ hybrid, item, users, popular, diagnostics: { ratings: ratings.length, neighbours: userResult.neighbourCount } });
}
