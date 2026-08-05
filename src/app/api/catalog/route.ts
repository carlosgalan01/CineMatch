import data from "@/data/movielens.json";

type TmdbMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  genre_ids: number[];
  release_date: string;
};

const titles = new Map<number, string>(data.movies as Array<[number, string]>);
const genreNames: Record<number, string> = {
  12: "Aventura", 14: "Fantasía", 16: "Animación", 18: "Drama", 27: "Terror",
  28: "Acción", 35: "Comedia", 36: "Historia", 53: "Thriller", 80: "Crimen",
  878: "Ciencia ficción", 9648: "Misterio", 10749: "Romance", 10751: "Familia",
};

function queryFor(title: string) {
  const year = title.match(/\((\d{4})\)$/)?.[1];
  return { query: title.replace(/\s*\(\d{4}\)$/, "").replace(/, The$/, "").replace(/, A$/, ""), year };
}

export async function GET(request: Request) {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) return Response.json({ error: "TMDB is not configured." }, { status: 503 });

  const ids = (new URL(request.url).searchParams.get("ids") ?? "")
    .split(",").map(Number).filter((id) => Number.isInteger(id) && titles.has(id)).slice(0, 40);

  const movies = await Promise.all(ids.map(async (movieId) => {
    const sourceTitle = titles.get(movieId)!;
    const { query, year } = queryFor(sourceTitle);
    const params = new URLSearchParams({ query, language: "es-ES", include_adult: "false" });
    if (year) params.set("primary_release_year", year);
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`, {
      headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!response.ok) return { movieId, sourceTitle, posterUrl: null, overview: "", genres: [] };
    const result = (await response.json()) as { results: TmdbMovie[] };
    const match = result.results[0];
    return {
      movieId,
      sourceTitle,
      tmdbId: match?.id ?? null,
      posterUrl: match?.poster_path ? `https://image.tmdb.org/t/p/w500${match.poster_path}` : null,
      overview: match?.overview ?? "",
      genres: (match?.genre_ids ?? []).map((id) => genreNames[id]).filter(Boolean),
      year: match?.release_date?.slice(0, 4) ?? year ?? "",
    };
  }));

  return Response.json({ movies });
}
