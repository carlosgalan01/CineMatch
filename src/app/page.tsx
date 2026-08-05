"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Film = { id: number; title: string; genre: string; blurb: string; tint: string };
type Recommendation = { id: number; title: string; rating: number; count: number; score: number; reason: string; reasonType: "item" | "users" | "popular"; because?: string };
type CatalogMovie = { movieId: number; sourceTitle: string; posterUrl: string | null; overview: string; genres: string[]; year?: string };
type MovieView = { id: number; title: string; genre: string; blurb: string; tint: string; reason?: string; communityRating?: number; count?: number };

const genres = ["Acción", "Ciencia ficción", "Drama", "Thriller", "Comedia", "Animación", "Romance", "Clásicos"];
const films: Film[] = [
  { id: 50, title: "Star Wars", genre: "Ciencia ficción", blurb: "Una galaxia muy, muy lejana", tint: "from-amber-600 via-orange-950 to-[#080812]" },
  { id: 172, title: "The Empire Strikes Back", genre: "Ciencia ficción", blurb: "La fuerza vuelve a despertar", tint: "from-slate-500 via-blue-950 to-[#080812]" },
  { id: 181, title: "Return of the Jedi", genre: "Ciencia ficción", blurb: "El desenlace de una saga", tint: "from-emerald-700 via-zinc-950 to-[#080812]" },
  { id: 204, title: "Back to the Future", genre: "Ciencia ficción", blurb: "El futuro ya ocurrió", tint: "from-cyan-500 via-blue-950 to-[#080812]" },
  { id: 89, title: "Blade Runner", genre: "Ciencia ficción", blurb: "Más humana que humana", tint: "from-fuchsia-800 via-slate-950 to-[#080812]" },
  { id: 174, title: "Raiders of the Lost Ark", genre: "Acción", blurb: "La aventura tiene nombre", tint: "from-yellow-700 via-red-950 to-[#080812]" },
  { id: 195, title: "The Terminator", genre: "Acción", blurb: "Volverá", tint: "from-red-800 via-zinc-950 to-[#080812]" },
  { id: 96, title: "Terminator 2", genre: "Acción", blurb: "Hasta la vista", tint: "from-sky-600 via-zinc-900 to-[#080812]" },
  { id: 144, title: "Die Hard", genre: "Acción", blurb: "Nochebuena en Nakatomi", tint: "from-red-700 via-stone-900 to-[#080812]" },
  { id: 22, title: "Braveheart", genre: "Acción", blurb: "Libertad", tint: "from-blue-800 via-emerald-950 to-[#080812]" },
  { id: 100, title: "Fargo", genre: "Thriller", blurb: "Crimen en Minnesota", tint: "from-sky-100 via-slate-600 to-[#080812]" },
  { id: 98, title: "The Silence of the Lambs", genre: "Thriller", blurb: "El silencio tiene un precio", tint: "from-amber-900 via-zinc-950 to-[#080812]" },
  { id: 288, title: "Scream", genre: "Thriller", blurb: "¿Cuál es tu película favorita?", tint: "from-rose-900 via-black to-[#080812]" },
  { id: 333, title: "The Game", genre: "Thriller", blurb: "El juego ha comenzado", tint: "from-stone-600 via-slate-950 to-[#080812]" },
  { id: 127, title: "The Godfather", genre: "Drama", blurb: "Una oferta imposible de rechazar", tint: "from-stone-800 via-rose-950 to-[#080812]" },
  { id: 318, title: "Schindler's List", genre: "Drama", blurb: "La lista que cambió vidas", tint: "from-zinc-300 via-zinc-700 to-[#080812]" },
  { id: 64, title: "The Shawshank Redemption", genre: "Drama", blurb: "La esperanza es una buena cosa", tint: "from-sky-700 via-slate-950 to-[#080812]" },
  { id: 191, title: "Amadeus", genre: "Drama", blurb: "El genio y la envidia", tint: "from-amber-700 via-stone-950 to-[#080812]" },
  { id: 1, title: "Toy Story", genre: "Animación", blurb: "Hasta el infinito y más allá", tint: "from-blue-600 via-yellow-600 to-red-800" },
  { id: 151, title: "Willy Wonka", genre: "Animación", blurb: "Pura imaginación", tint: "from-fuchsia-700 via-violet-950 to-[#080812]" },
  { id: 132, title: "The Wizard of Oz", genre: "Animación", blurb: "Sigue el camino amarillo", tint: "from-emerald-600 via-yellow-600 to-sky-900" },
  { id: 294, title: "Liar Liar", genre: "Comedia", blurb: "24 horas sin mentir", tint: "from-emerald-500 via-lime-800 to-[#080812]" },
  { id: 168, title: "Monty Python and the Holy Grail", genre: "Comedia", blurb: "Un clásico absurdo", tint: "from-purple-700 via-slate-950 to-[#080812]" },
  { id: 202, title: "Groundhog Day", genre: "Comedia", blurb: "El día se repite", tint: "from-sky-500 via-zinc-900 to-[#080812]" },
  { id: 237, title: "Jerry Maguire", genre: "Romance", blurb: "Enséñame el dinero", tint: "from-rose-500 via-amber-900 to-[#080812]" },
  { id: 216, title: "When Harry Met Sally...", genre: "Romance", blurb: "¿Pueden ser amigos?", tint: "from-rose-400 via-stone-700 to-[#080812]" },
  { id: 483, title: "Casablanca", genre: "Clásicos", blurb: "Siempre nos quedará París", tint: "from-amber-200 via-stone-700 to-[#080812]" },
  { id: 12, title: "The Usual Suspects", genre: "Clásicos", blurb: "El mayor truco", tint: "from-zinc-500 via-zinc-900 to-[#080812]" },
];

const stars = [1, 2, 3, 4, 5];
const fallbackTints = ["from-violet-700 via-indigo-950 to-[#080812]", "from-sky-700 via-slate-950 to-[#080812]", "from-amber-600 via-stone-950 to-[#080812]", "from-emerald-700 via-slate-950 to-[#080812]"];
const cleanTitle = (title: string) => title.replace(/\s*\(\d{4}\)$/, "");

function Icon({ name, className = "h-5 w-5" }: { name: "arrow" | "check" | "close" | "info" | "skip" | "spark" | "star"; className?: string }) {
  const paths = {
    arrow: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
    skip: <><path d="m5 5 10 7L5 19V5Z" /><path d="M19 5v14" /></>,
    spark: <path d="m12 3 1.3 4.1L17 9l-3.7 1.9L12 15l-1.3-4.1L7 9l3.7-1.9L12 3Zm6 11 .7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14ZM5 13l.9 2.6L8.5 17l-2.6.9L5 20.5l-.9-2.6L1.5 17l2.6-1.4L5 13Z" />,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  };
  return <svg viewBox="0 0 24 24" fill={name === "spark" || name === "star" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{paths[name]}</svg>;
}

function Poster({ movie, metadata, sizes, priority = false }: { movie: MovieView; metadata?: CatalogMovie; sizes: string; priority?: boolean }) {
  return <div className={`absolute inset-0 bg-gradient-to-br ${movie.tint}`}>
    {metadata?.posterUrl ? <Image src={metadata.posterUrl} alt={`Póster de ${movie.title}`} fill sizes={sizes} priority={priority} className="object-cover" /> : <><div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_16%,rgba(255,255,255,.28),transparent_24%)]" /><div className="absolute inset-0 opacity-30 [background-image:linear-gradient(115deg,transparent_42%,rgba(255,255,255,.16)_43%,transparent_44%)]" /><span aria-hidden="true" className="absolute -right-[.08em] top-[14%] max-w-[92%] text-right text-[clamp(3rem,13vw,8rem)] font-black uppercase leading-[.78] tracking-[-.09em] text-white/[.055]">{movie.title}</span></>}
  </div>;
}

function RatingStars({ value, onRate, large = false }: { value?: number; onRate: (value: number) => void; large?: boolean }) {
  return <div className="flex items-center gap-1" aria-label={value ? `Tu valoración: ${value} de 5` : "Valora esta película"}>{stars.map((star) => <button key={star} type="button" onClick={() => onRate(star)} aria-label={`${star} ${star === 1 ? "estrella" : "estrellas"}`} className={`group grid rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9adff] ${large ? "h-11 w-11 sm:h-12 sm:w-12" : "h-8 w-8"}`}><Icon name="star" className={`${large ? "h-7 w-7" : "h-5 w-5"} place-self-center transition group-hover:scale-110 ${value && star <= value ? "text-[#e8c77a]" : "text-white/25 group-hover:text-[#e8c77a]"}`} /></button>)}</div>;
}

export default function Home() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [storageReady, setStorageReady] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<MovieView | null>(null);
  const [catalog, setCatalog] = useState<Record<number, CatalogMovie>>({});
  const catalogRef = useRef<Record<number, CatalogMovie>>({});
  const [currentCard, setCurrentCard] = useState(0);
  const [onboardingStep, setOnboardingStep] = useState<"genres" | "ratings">("genres");
  const [hasDiscovered, setHasDiscovered] = useState(false);
  const [cardMotion, setCardMotion] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = window.localStorage.getItem("cinematch-ratings");
        if (saved) setRatings(JSON.parse(saved) as Record<number, number>);
      } catch { window.localStorage.removeItem("cinematch-ratings"); }
      finally { setStorageReady(true); }
    });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (storageReady) window.localStorage.setItem("cinematch-ratings", JSON.stringify(ratings)); }, [ratings, storageReady]);
  useEffect(() => {
    if (!selectedMovie) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedMovie(null); };
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; };
  }, [selectedMovie]);

  const rated = useMemo(() => Object.entries(ratings).map(([movieId, rating]) => ({ movieId: Number(movieId), rating })), [ratings]);
  const onboardingFilms = useMemo(() => films.filter((film) => selectedGenres.includes(film.genre)), [selectedGenres]);
  const visibleFilms = onboardingFilms.length ? onboardingFilms : films.slice(0, 14);
  const tinderFilm = visibleFilms[currentCard % visibleFilms.length];
  const progress = Math.min(100, (rated.length / 5) * 100);

  const loadCatalog = useCallback(async (ids: number[]) => {
    const missing = [...new Set(ids)].filter((id) => !catalogRef.current[id]);
    if (!missing.length) return;
    try {
      const response = await fetch(`/api/catalog?ids=${missing.join(",")}`);
      if (!response.ok) return;
      const result = await response.json() as { movies: CatalogMovie[] };
      const additions = Object.fromEntries(result.movies.map((movie) => [movie.movieId, movie]));
      catalogRef.current = { ...catalogRef.current, ...additions };
      setCatalog(catalogRef.current);
    } catch { /* Visual fallbacks keep the app usable offline. */ }
  }, []);
  useEffect(() => { void loadCatalog(films.map((film) => film.id)); }, [loadCatalog]);

  const discover = useCallback(async (nextRatings: Record<number, number>) => {
    const payload = Object.entries(nextRatings).map(([movieId, rating]) => ({ movieId: Number(movieId), rating }));
    if (payload.length < 5) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ratings: payload }) });
      const result = await response.json() as { hybrid?: Recommendation[]; error?: string };
      if (!response.ok) throw new Error(result.error || "No hemos podido actualizar tu selección.");
      const nextRecommendations = result.hybrid ?? [];
      setRecommendations(nextRecommendations); setHasDiscovered(true);
      void loadCatalog(nextRecommendations.map((movie) => movie.id));
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "No hemos podido actualizar tu selección."); }
    finally { setLoading(false); }
  }, [loadCatalog]);
  useEffect(() => {
    if (!hasDiscovered) return;
    const timer = window.setTimeout(() => { void discover(ratings); }, 450);
    return () => window.clearTimeout(timer);
  }, [ratings, hasDiscovered, discover]);

  const rate = (id: number, value: number) => setRatings((current) => ({ ...current, [id]: value }));
  function advance(direction: "left" | "right") {
    if (cardMotion) return;
    setCardMotion(direction);
    window.setTimeout(() => { setCurrentCard((current) => current + 1); setCardMotion(null); }, 260);
  }
  function rateAndAdvance(value: number) { rate(tinderFilm.id, value); advance("right"); }
  function viewForRecommendation(movie: Recommendation): MovieView {
    return { id: movie.id, title: cleanTitle(movie.title), genre: catalog[movie.id]?.genres.join(" · ") || "Selección CineMatch", blurb: catalog[movie.id]?.overview || "Una recomendación encontrada al cruzar tus valoraciones con los patrones de la comunidad MovieLens.", tint: fallbackTints[movie.id % fallbackTints.length], reason: movie.reason, communityRating: movie.rating, count: movie.count };
  }

  return <main className="min-h-screen overflow-x-hidden bg-[#080812] text-[#f7f1e7]">
    <Navigation ratedCount={rated.length} hasDiscovered={hasDiscovered} />
    {!hasDiscovered && onboardingStep === "genres" && <GenreIntro selectedGenres={selectedGenres} onToggle={(genre) => setSelectedGenres((current) => current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre])} onContinue={() => setOnboardingStep("ratings")} />}
    {!hasDiscovered && onboardingStep === "ratings" && <section className="relative min-h-screen px-5 pb-12 pt-24 sm:px-8 sm:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(97,74,180,.22),transparent_34%),linear-gradient(180deg,#080812_0%,#0c0c19_58%,#080812_100%)]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center"><p className="eyebrow">Tu primera selección</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">Una película. Una impresión.</h1><p className="mx-auto mt-3 hidden max-w-xl text-sm leading-6 text-white/55 sm:block sm:text-base">Puntúa solo las que conozcas. Cada gesto afina tu perfil y cambia lo que viene después.</p></div>
        <div className="mx-auto mt-5 grid max-w-4xl items-center gap-5 sm:mt-8 sm:gap-7 lg:grid-cols-[minmax(280px,390px)_1fr] lg:gap-14">
          <div className={`relative mx-auto w-full max-w-[250px] sm:max-w-[350px] ${cardMotion === "left" ? "card-exit-left" : cardMotion === "right" ? "card-exit-right" : "card-enter"}`} key={tinderFilm.id}>
            <div className="absolute inset-4 translate-y-4 rounded-[1.8rem] border border-white/8 bg-[#18172a] opacity-55" />
            <button type="button" onClick={() => setSelectedMovie(tinderFilm)} className="group relative block aspect-[2/3] w-full overflow-hidden rounded-[1.6rem] border border-white/15 text-left shadow-[0_30px_80px_rgba(0,0,0,.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9adff]">
              <Poster movie={tinderFilm} metadata={catalog[tinderFilm.id]} sizes="(max-width: 640px) 90vw, 350px" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080812] via-[#080812]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7"><div className="mb-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#d6ca9b]"><span>{catalog[tinderFilm.id]?.year || "Selección esencial"}</span><span>·</span><span>{catalog[tinderFilm.id]?.genres.join(" · ") || tinderFilm.genre}</span></div><h2 className="text-3xl font-semibold leading-[.95] tracking-[-.04em] sm:text-4xl">{tinderFilm.title}</h2><p className="mt-3 line-clamp-2 text-sm leading-5 text-white/65">{catalog[tinderFilm.id]?.overview || tinderFilm.blurb}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white/75 transition group-hover:text-white"><Icon name="info" className="h-4 w-4" /> Abrir ficha</span></div>
            </button>
          </div>
          <div className="mx-auto w-full max-w-md lg:mx-0">
            <div className="flex items-end justify-between gap-5"><div><p className="eyebrow">Construyendo tu perfil</p><p className="mt-2 text-lg font-medium">{rated.length < 5 ? `${rated.length} de 5 valoraciones` : "Tu perfil ya está listo"}</p></div><span className="text-sm tabular-nums text-white/40">{currentCard % visibleFilms.length + 1} / {visibleFilms.length}</span></div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#8170df] to-[#e8c77a] transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.045] p-4 sm:mt-8 sm:p-6"><p className="text-center text-sm text-white/55">¿Qué te pareció?</p><div className="mt-2 flex justify-center sm:mt-3"><RatingStars value={ratings[tinderFilm.id]} onRate={rateAndAdvance} large /></div><div className="mt-3 grid grid-cols-2 gap-3 sm:mt-5"><button type="button" onClick={() => advance("left")} className="secondary-action"><Icon name="skip" className="h-5 w-5" /> No la he visto</button><button type="button" onClick={() => setSelectedMovie(tinderFilm)} className="secondary-action"><Icon name="info" className="h-5 w-5" /> Ver ficha</button></div></div>
            {rated.length >= 5 ? <button type="button" disabled={loading} onClick={() => void discover(ratings)} className="primary-action mt-5 w-full">{loading ? "Buscando afinidades…" : <><Icon name="spark" className="h-5 w-5" /> Revelar mis recomendaciones</>}</button> : <p className="mt-5 text-center text-xs leading-5 text-white/40">Te faltan {5 - rated.length} valoraciones. Puedes pasar todas las películas que no conozcas.</p>}
            {error && <p role="alert" className="mt-4 text-center text-sm text-rose-300">{error}</p>}
            <button type="button" onClick={() => setOnboardingStep("genres")} className="mx-auto mt-5 block text-xs text-white/35 underline-offset-4 hover:text-white hover:underline">Cambiar géneros</button>
          </div>
        </div>
      </div>
    </section>}
    {hasDiscovered && <RecommendationsView recommendations={recommendations} catalog={catalog} ratings={ratings} loading={loading} error={error} onRefresh={() => void discover(ratings)} onOpen={(movie) => setSelectedMovie(viewForRecommendation(movie))} onRate={rate} />}
    {selectedMovie && <MovieModal movie={selectedMovie} metadata={catalog[selectedMovie.id]} rating={ratings[selectedMovie.id]} onRate={(value) => rate(selectedMovie.id, value)} onClose={() => setSelectedMovie(null)} />}
  </main>;
}

function Navigation({ ratedCount, hasDiscovered }: { ratedCount: number; hasDiscovered: boolean }) {
  return <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/[.06] bg-[#080812]/75 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 sm:h-18 sm:px-8 lg:px-12"><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-xl font-black tracking-[-.09em] text-[#b3a6ff] sm:text-2xl">CINEMATCH</button><div className="flex items-center gap-3 sm:gap-6">{hasDiscovered && <button type="button" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })} className="hidden text-sm text-white/55 transition hover:text-white sm:block">Seguir afinando</button>}<div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[.06] px-3 py-1.5 text-[11px] text-white/65 sm:text-xs"><span className={`h-1.5 w-1.5 rounded-full ${ratedCount >= 5 ? "bg-[#e8c77a] shadow-[0_0_10px_#e8c77a]" : "bg-[#8f7de8]"}`} /><span className="tabular-nums">{ratedCount}</span><span className="hidden sm:inline"> valoradas</span></div></div></div></nav>;
}

function GenreIntro({ selectedGenres, onToggle, onContinue }: { selectedGenres: string[]; onToggle: (genre: string) => void; onContinue: () => void }) {
  return <section className="relative flex min-h-screen items-end overflow-hidden px-5 pb-8 pt-24 sm:items-center sm:px-8 sm:py-28 lg:px-12"><div className="absolute inset-0 bg-cover bg-[68%_center] sm:bg-center" style={{ backgroundImage: "url('/images/cinematch-hero.png')" }} /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,14,.98)_0%,rgba(5,6,14,.88)_36%,rgba(5,6,14,.18)_78%),linear-gradient(0deg,#080812_0%,transparent_42%)] sm:bg-[linear-gradient(90deg,rgba(5,6,14,.98)_4%,rgba(5,6,14,.78)_48%,rgba(5,6,14,.08)_82%)]" /><div className="relative mx-auto grid w-full max-w-[1500px] items-end gap-8 lg:grid-cols-[minmax(0,680px)_minmax(360px,470px)] lg:gap-16"><div><p className="eyebrow">Recomendaciones hechas contigo</p><h1 className="mt-4 max-w-3xl text-[clamp(3.2rem,7vw,6.8rem)] font-semibold leading-[.84] tracking-[-.075em]">Tu próxima<br /><span className="font-serif font-normal italic text-[#e8c77a]">gran película.</span></h1><p className="mt-6 max-w-lg text-base leading-7 text-white/62 sm:text-lg">No vienes a recorrer un catálogo infinito. Valora unas pocas historias y deja que CineMatch encuentre las conexiones.</p></div><div className="rounded-[1.5rem] border border-white/12 bg-[#121221]/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,.45)] backdrop-blur-xl sm:p-7"><div className="flex items-center justify-between"><p className="eyebrow">Paso 1 · Tus coordenadas</p><span className="text-xs tabular-nums text-white/35">{selectedGenres.length} elegidos</span></div><h2 className="mt-3 text-2xl font-semibold tracking-[-.03em]">¿Qué historias te atraen?</h2><p className="mt-2 text-sm leading-6 text-white/50">Elige al menos dos. Tus valoraciones tendrán la última palabra.</p><div className="mt-5 flex flex-wrap gap-2.5">{genres.map((genre) => { const selected = selectedGenres.includes(genre); return <button key={genre} type="button" aria-pressed={selected} onClick={() => onToggle(genre)} className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9adff] ${selected ? "border-[#a99bff] bg-[#7161bd]/70 text-white" : "border-white/13 bg-white/[.045] text-white/62 hover:border-white/35 hover:text-white"}`}>{selected && <Icon name="check" className="h-3.5 w-3.5" />}{genre}</button>; })}</div><button type="button" disabled={selectedGenres.length < 2} onClick={onContinue} className="primary-action mt-6 w-full">Empezar mi selección <Icon name="arrow" className="h-5 w-5" /></button></div></div></section>;
}

function RecommendationsView({ recommendations, catalog, ratings, loading, error, onRefresh, onOpen, onRate }: { recommendations: Recommendation[]; catalog: Record<number, CatalogMovie>; ratings: Record<number, number>; loading: boolean; error: string; onRefresh: () => void; onOpen: (movie: Recommendation) => void; onRate: (id: number, value: number) => void }) {
  const hero = recommendations[0];
  const heroMetadata = hero ? catalog[hero.id] : undefined;
  const heroView = hero ? { id: hero.id, title: cleanTitle(hero.title), genre: heroMetadata?.genres.join(" · ") || "Tu mejor coincidencia", blurb: heroMetadata?.overview || "La película que encabeza hoy tu selección personalizada.", tint: fallbackTints[hero.id % fallbackTints.length], reason: hero.reason, communityRating: hero.rating, count: hero.count } : null;
  return <><section className="relative min-h-[620px] overflow-hidden px-5 pb-14 pt-28 sm:px-8 lg:px-12">{heroView && <><div className="absolute inset-y-0 right-0 w-full opacity-45 sm:w-2/3 sm:opacity-70"><Poster movie={heroView} metadata={heroMetadata} sizes="(max-width: 640px) 100vw, 70vw" priority /></div><div className="absolute inset-0 bg-[linear-gradient(90deg,#080812_4%,rgba(8,8,18,.94)_34%,rgba(8,8,18,.18)_78%),linear-gradient(0deg,#080812_0%,transparent_50%)]" /></>}<div className="relative mx-auto flex min-h-[470px] max-w-[1500px] items-end"><div className="max-w-2xl"><p className="eyebrow">La primera de tu lista</p><h1 className="mt-4 text-5xl font-semibold leading-[.9] tracking-[-.065em] sm:text-7xl">{heroView?.title || "Tu selección está lista"}</h1>{hero && <div className="mt-5 flex flex-wrap items-center gap-3 text-xs"><span className="reason-badge"><Icon name="spark" className="h-3.5 w-3.5" />{hero.reason}</span><span className="text-white/45">★ {hero.rating} · {hero.count} valoraciones</span></div>}<p className="mt-5 line-clamp-3 max-w-xl text-sm leading-6 text-white/62 sm:text-base sm:leading-7">{heroView?.blurb}</p><div className="mt-7 flex flex-wrap gap-3">{hero && <button type="button" onClick={() => onOpen(hero)} className="primary-action px-6"><Icon name="info" className="h-5 w-5" /> Ver ficha</button>}<button type="button" onClick={onRefresh} disabled={loading} className="secondary-action px-5">{loading ? "Actualizando…" : "Actualizar selección"}</button></div>{error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}</div></div></section><section className="relative z-10 mx-auto -mt-2 max-w-[1500px] space-y-12 px-5 pb-20 sm:px-8 lg:px-12"><RecommendationRow title="Tu mezcla personalizada" subtitle="Popularidad + afinidad entre películas + usuarios similares" films={recommendations.slice(0, 16)} catalog={catalog} loading={loading} onOpen={onOpen} /><RecommendationRow title="Conexiones que merece la pena explorar" subtitle="El motor sigue las señales más fuertes de tus valoraciones" films={recommendations.slice(10, 28)} catalog={catalog} loading={loading} onOpen={onOpen} /><div className="border-t border-white/8 pt-10"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="eyebrow">Tu perfil sigue vivo</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">Afina la siguiente selección</h2><p className="mt-1 text-sm text-white/45">Al puntuar, el ranking se actualiza automáticamente.</p></div>{loading && <span className="hidden text-xs text-[#c1b6ff] sm:block">Recalculando afinidades…</span>}</div><div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 rail-scroll">{films.slice(0, 14).map((film) => <CompactFilmCard key={film.id} film={film} metadata={catalog[film.id]} rating={ratings[film.id]} onOpen={() => onOpen({ id: film.id, title: film.title, rating: 0, count: 0, score: 0, reason: "Amplía tu perfil con esta valoración", reasonType: "item" })} onRate={(value) => onRate(film.id, value)} />)}</div></div></section></>;
}

function RecommendationRow({ title, subtitle, films: rowFilms, catalog, loading, onOpen }: { title: string; subtitle: string; films: Recommendation[]; catalog: Record<number, CatalogMovie>; loading: boolean; onOpen: (movie: Recommendation) => void }) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => rail.current?.scrollBy({ left: direction * Math.min(760, window.innerWidth * 0.82), behavior: "smooth" });
  return <div><div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold tracking-[-.02em] sm:text-2xl">{title}</h2><p className="mt-1 text-sm text-white/42">{subtitle}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => scroll(-1)} aria-label={`Anterior en ${title}`} className="carousel-control"><Icon name="arrow" className="h-5 w-5 rotate-180" /></button><button type="button" onClick={() => scroll(1)} aria-label={`Siguiente en ${title}`} className="carousel-control"><Icon name="arrow" className="h-5 w-5" /></button></div></div><div ref={rail} className="rail-scroll -mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-5 sm:-mx-8 sm:px-8 lg:-mx-2 lg:px-2">{loading && !rowFilms.length ? <div className="grid h-72 w-full place-items-center rounded-2xl border border-white/8 bg-white/[.025] text-sm text-white/45">Cruzando afinidades…</div> : rowFilms.map((movie) => <RecommendationCard key={movie.id} movie={movie} metadata={catalog[movie.id]} onOpen={() => onOpen(movie)} />)}</div></div>;
}

function RecommendationCard({ movie, metadata, onOpen }: { movie: Recommendation; metadata?: CatalogMovie; onOpen: () => void }) {
  const view: MovieView = { id: movie.id, title: cleanTitle(movie.title), genre: metadata?.genres.join(" · ") || "Selección CineMatch", blurb: metadata?.overview || "", tint: fallbackTints[movie.id % fallbackTints.length] };
  return <article className="group w-[68vw] max-w-[230px] shrink-0 snap-start sm:w-48"><button type="button" onClick={onOpen} className="block w-full text-left focus-visible:outline-none"><div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,.3)] transition duration-300 group-hover:-translate-y-1.5 group-hover:border-[#a99bff]/50 group-hover:shadow-[0_24px_55px_rgba(45,31,100,.35)] group-focus-within:ring-2 group-focus-within:ring-[#b9adff]"><Poster movie={view} metadata={metadata} sizes="(max-width: 640px) 68vw, 192px" /><div className="absolute inset-0 bg-gradient-to-t from-[#080812] via-transparent to-black/15" /><span className="absolute right-3 top-3 rounded-full border border-white/12 bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-[#ead187] backdrop-blur">★ {movie.rating}</span><div className="absolute inset-x-0 bottom-0 p-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#171326]/88 px-2.5 py-1.5 text-[10px] font-semibold leading-tight text-[#d2c8ff] backdrop-blur"><Icon name={movie.reasonType === "popular" ? "star" : "spark"} className="h-3 w-3 shrink-0" />{movie.reason}</span></div></div><h3 className="mt-3 line-clamp-2 text-base font-semibold leading-5 tracking-[-.02em] text-white transition group-hover:text-[#d5cdff]">{view.title}</h3><p className="mt-1 text-[11px] text-white/38">{metadata?.year ? `${metadata.year} · ` : ""}{movie.count} valoraciones</p></button></article>;
}

function CompactFilmCard({ film, metadata, rating, onOpen, onRate }: { film: Film; metadata?: CatalogMovie; rating?: number; onOpen: () => void; onRate: (value: number) => void }) {
  return <article className="w-[62vw] max-w-[190px] shrink-0 snap-start"><button type="button" onClick={onOpen} className="group relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/10 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9adff]"><Poster movie={film} metadata={metadata} sizes="(max-width: 640px) 62vw, 190px" /><div className="absolute inset-0 bg-gradient-to-t from-[#080812] via-transparent to-transparent" /><h3 className="absolute inset-x-0 bottom-0 p-4 text-lg font-semibold leading-5 tracking-[-.03em]">{film.title}</h3></button><div className="mt-2"><RatingStars value={rating} onRate={onRate} /></div></article>;
}

function MovieModal({ movie, metadata, rating, onRate, onClose }: { movie: MovieView; metadata?: CatalogMovie; rating?: number; onRate: (value: number) => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:grid sm:place-items-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><article role="dialog" aria-modal="true" aria-labelledby="movie-title" className="relative mx-auto my-4 grid max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/13 bg-[#11111d] shadow-[0_30px_100px_rgba(0,0,0,.65)] sm:my-0 sm:h-[min(620px,calc(100vh-3rem))] sm:grid-cols-[260px_1fr] sm:overflow-hidden"><div className="relative min-h-[260px] sm:min-h-0"><Poster movie={movie} metadata={metadata} sizes="(max-width: 640px) 100vw, 260px" priority /><div className="absolute inset-0 bg-gradient-to-t from-[#11111d] via-transparent to-black/15 sm:bg-gradient-to-r sm:from-transparent sm:to-[#11111d]/25" /></div><div className="relative flex flex-col p-5 sm:overflow-y-auto sm:p-7 lg:p-8"><button type="button" onClick={onClose} aria-label="Cerrar ficha" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-black/25 text-white/65 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9adff]"><Icon name="close" /></button><p className="eyebrow pr-12">{metadata?.year || "CineMatch"} {metadata?.genres.length ? `· ${metadata.genres.join(" · ")}` : `· ${movie.genre}`}</p><h2 id="movie-title" className="mt-3 text-3xl font-semibold leading-[.95] tracking-[-.05em] sm:text-4xl">{movie.title}</h2>{movie.reason && <div className="mt-4"><span className="reason-badge"><Icon name="spark" className="h-3.5 w-3.5" />{movie.reason}</span></div>}<p className="mt-4 text-sm leading-6 text-white/65">{metadata?.overview || movie.blurb}</p>{(movie.communityRating || movie.count) && <div className="mt-5 flex gap-6 border-y border-white/8 py-3"><div><p className="text-lg font-semibold text-[#e8c77a]">★ {movie.communityRating}</p><p className="mt-1 text-[10px] uppercase tracking-[.14em] text-white/35">Nota comunidad</p></div><div><p className="text-lg font-semibold">{movie.count}</p><p className="mt-1 text-[10px] uppercase tracking-[.14em] text-white/35">Valoraciones</p></div></div>}<div className="mt-5"><p className="text-xs font-semibold uppercase tracking-[.16em] text-white/45">Tu valoración</p><div className="mt-1"><RatingStars value={rating} onRate={onRate} large /></div><p className="mt-1 text-xs text-white/35">Tu nota se guarda en este dispositivo y reajusta tus recomendaciones.</p></div><div className="mt-5 rounded-xl border border-[#a99bff]/15 bg-[#8f7de8]/[.07] p-3.5"><div className="flex gap-3"><Icon name="spark" className="mt-0.5 h-4 w-4 shrink-0 text-[#b9adff]" /><div><p className="text-xs font-semibold text-[#d5cdff]">Por qué podría gustarte</p><p className="mt-1 text-xs leading-5 text-white/45">{movie.reason || "Forma parte de tu selección inicial y ayudará al motor a entender mejor tus afinidades."}</p></div></div></div></div></article></div>;
}
