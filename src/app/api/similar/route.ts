import data from "@/data/movielens.json";

type MovieSummary = { id: number; title: string; rating: number; count: number };

const titles = new Map<number, string>(data.movies as Array<[number, string]>);
const users = new Map<number, Array<[number, number]>>();
const items = new Map<number, Array<[number, number]>>();
const stats = new Map<number, { sum: number; count: number; norm: number }>();

for (const [userId, movieId, rating] of data.ratings) {
  if (!users.has(userId)) users.set(userId, []);
  users.get(userId)!.push([movieId, rating]);
  if (!items.has(movieId)) items.set(movieId, []);
  items.get(movieId)!.push([userId, rating]);
  const current = stats.get(movieId) ?? { sum: 0, count: 0, norm: 0 };
  current.sum += rating; current.count += 1; current.norm += rating ** 2;
  stats.set(movieId, current);
}

function summary(id: number): MovieSummary {
  const stat = stats.get(id) ?? { sum: 0, count: 0, norm: 0 };
  return { id, title: titles.get(id) ?? "Título desconocido", rating: stat.count ? +(stat.sum / stat.count).toFixed(2) : 0, count: stat.count };
}

const catalog = [...stats.entries()].filter(([, stat]) => stat.count >= 20).map(([id]) => summary(id)).sort((a, b) => a.title.localeCompare(b.title));

export async function GET(request: Request) {
  const movieId = Number(new URL(request.url).searchParams.get("movieId"));
  if (!movieId) return Response.json({ movies: catalog });

  const seed = stats.get(movieId);
  const seedRatings = items.get(movieId);
  if (!seed || !seedRatings || seed.count < 20) return Response.json({ error: "Esta película no tiene valoraciones suficientes para compararla." }, { status: 404 });

  const dots = new Map<number, number>();
  for (const [userId, seedRating] of seedRatings) {
    for (const [candidateId, candidateRating] of users.get(userId) ?? []) {
      if (candidateId !== movieId) dots.set(candidateId, (dots.get(candidateId) ?? 0) + seedRating * candidateRating);
    }
  }
  const recommendations = [...dots.entries()]
    .filter(([candidateId]) => (stats.get(candidateId)?.count ?? 0) >= 20)
    .map(([candidateId, dot]) => {
      const candidate = stats.get(candidateId)!;
      const score = dot / Math.sqrt(seed.norm * candidate.norm);
      return { ...summary(candidateId), score: +score.toFixed(4), reason: `Similitud ítem–ítem · ${score.toFixed(3)}`, reasonType: "item" as const };
    })
    .sort((a, b) => b.score - a.score).slice(0, 12);

  return Response.json({ seed: summary(movieId), recommendations });
}
