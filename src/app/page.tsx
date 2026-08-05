"use client";

import { useEffect, useMemo, useState } from "react";

type Film = { id: number; title: string; genre: string; blurb: string; tint: string };
type Recommendation = { id: number; title: string; rating: number; count: number; score: number; reason?: string; because?: string };

const genres = ["Acción", "Ciencia ficción", "Drama", "Thriller", "Comedia", "Animación", "Romance", "Clásicos"];
const films: Film[] = [
  { id: 50, title: "Star Wars", genre: "Ciencia ficción", blurb: "Una galaxia muy, muy lejana", tint: "from-amber-600 via-orange-900 to-zinc-950" },
  { id: 172, title: "The Empire Strikes Back", genre: "Ciencia ficción", blurb: "La fuerza vuelve a despertar", tint: "from-slate-500 via-blue-950 to-zinc-950" },
  { id: 181, title: "Return of the Jedi", genre: "Ciencia ficción", blurb: "El desenlace de una saga", tint: "from-emerald-700 via-zinc-950 to-black" },
  { id: 204, title: "Back to the Future", genre: "Ciencia ficción", blurb: "El futuro ya ocurrió", tint: "from-cyan-500 via-blue-950 to-zinc-950" },
  { id: 89, title: "Blade Runner", genre: "Ciencia ficción", blurb: "Más humana que humana", tint: "from-fuchsia-800 via-slate-950 to-black" },
  { id: 174, title: "Raiders of the Lost Ark", genre: "Acción", blurb: "La aventura tiene nombre", tint: "from-yellow-700 via-red-950 to-zinc-950" },
  { id: 195, title: "The Terminator", genre: "Acción", blurb: "Volverá", tint: "from-red-800 via-zinc-950 to-black" },
  { id: 96, title: "Terminator 2", genre: "Acción", blurb: "Hasta la vista", tint: "from-sky-600 via-zinc-900 to-black" },
  { id: 144, title: "Die Hard", genre: "Acción", blurb: "Nochebuena en Nakatomi", tint: "from-red-700 via-stone-900 to-black" },
  { id: 22, title: "Braveheart", genre: "Acción", blurb: "Libertad", tint: "from-blue-800 via-emerald-950 to-black" },
  { id: 100, title: "Fargo", genre: "Thriller", blurb: "Crimen en Minnesota", tint: "from-sky-100 via-slate-600 to-zinc-950" },
  { id: 98, title: "The Silence of the Lambs", genre: "Thriller", blurb: "El silencio tiene un precio", tint: "from-amber-900 via-zinc-950 to-black" },
  { id: 288, title: "Scream", genre: "Thriller", blurb: "¿Cuál es tu película favorita?", tint: "from-rose-900 via-black to-zinc-950" },
  { id: 333, title: "The Game", genre: "Thriller", blurb: "El juego ha comenzado", tint: "from-stone-600 via-slate-950 to-black" },
  { id: 127, title: "The Godfather", genre: "Drama", blurb: "Una oferta imposible de rechazar", tint: "from-stone-800 via-rose-950 to-black" },
  { id: 318, title: "Schindler's List", genre: "Drama", blurb: "La lista que cambió vidas", tint: "from-zinc-300 via-zinc-700 to-black" },
  { id: 64, title: "The Shawshank Redemption", genre: "Drama", blurb: "La esperanza es una buena cosa", tint: "from-sky-700 via-slate-950 to-black" },
  { id: 191, title: "Amadeus", genre: "Drama", blurb: "El genio y la envidia", tint: "from-amber-700 via-stone-950 to-black" },
  { id: 1, title: "Toy Story", genre: "Animación", blurb: "Hasta el infinito y más allá", tint: "from-blue-600 via-yellow-600 to-red-700" },
  { id: 151, title: "Willy Wonka", genre: "Animación", blurb: "Pura imaginación", tint: "from-fuchsia-700 via-violet-950 to-black" },
  { id: 132, title: "The Wizard of Oz", genre: "Animación", blurb: "Sigue el camino amarillo", tint: "from-emerald-600 via-yellow-600 to-sky-800" },
  { id: 294, title: "Liar Liar", genre: "Comedia", blurb: "24 horas sin mentir", tint: "from-emerald-500 via-lime-700 to-zinc-950" },
  { id: 168, title: "Monty Python and the Holy Grail", genre: "Comedia", blurb: "Un clásico absurdo", tint: "from-purple-700 via-slate-950 to-black" },
  { id: 202, title: "Groundhog Day", genre: "Comedia", blurb: "El día se repite", tint: "from-sky-500 via-zinc-900 to-black" },
  { id: 237, title: "Jerry Maguire", genre: "Romance", blurb: "Enséñame el dinero", tint: "from-rose-500 via-amber-900 to-zinc-950" },
  { id: 216, title: "When Harry Met Sally...", genre: "Romance", blurb: "¿Pueden ser amigos?", tint: "from-rose-400 via-stone-700 to-zinc-950" },
  { id: 483, title: "Casablanca", genre: "Clásicos", blurb: "Siempre nos quedará París", tint: "from-amber-200 via-stone-700 to-black" },
  { id: 12, title: "The Usual Suspects", genre: "Clásicos", blurb: "El mayor truco", tint: "from-zinc-500 via-zinc-900 to-black" },
];

const stars = [1, 2, 3, 4, 5];

function FilmCard({ film, rating, onRate, onOpen }: { film: Film; rating?: number; onRate: (value: number) => void; onOpen?: () => void }) {
  return <article className="group w-40 shrink-0 sm:w-48">
    <button onClick={onOpen} className={`relative aspect-[2/3] w-full overflow-hidden rounded-md bg-gradient-to-br ${film.tint} text-left shadow-xl transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#9E8CFF]`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,255,255,.35),transparent_25%)]" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 pt-16">
        <p className="text-lg font-black uppercase leading-[.93] tracking-tight">{film.title}</p>
        <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-white/65">{film.genre}</p>
        <span className="mt-3 inline-flex rounded-full border border-white/30 bg-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider opacity-0 transition group-hover:opacity-100">Ver ficha</span>
      </div>
    </button>
    <div className="mt-2 flex items-center justify-between gap-1">
      <span className="text-xs text-white/55">{rating ? "Tu nota" : "¿La has visto?"}</span>
      <div className="flex">{stars.map((star) => <button key={star} aria-label={`${star} estrellas`} onClick={() => onRate(star)} className={`p-0.5 text-sm transition ${rating && star <= rating ? "text-[#ffd24a]" : "text-white/30 hover:text-[#ffd24a]"}`}>★</button>)}</div>
    </div>
  </article>;
}

export default function Home() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>(() => {
    if (typeof window === "undefined") return {};
    const saved = window.localStorage.getItem("cinematch-ratings");
    return saved ? JSON.parse(saved) : {};
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);

  useEffect(() => { localStorage.setItem("cinematch-ratings", JSON.stringify(ratings)); }, [ratings]);
  const started = recommendations.length > 0;
  const rated = Object.entries(ratings).map(([movieId, rating]) => ({ movieId: Number(movieId), rating }));
  const onboardingFilms = useMemo(() => films.filter((film) => selectedGenres.includes(film.genre)), [selectedGenres]);
  const rate = (id: number, value: number) => setRatings((current) => ({ ...current, [id]: value }));

  async function discover() {
    setLoading(true);
    const response = await fetch("/api/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ratings: rated }) });
    const result = await response.json();
    setRecommendations(result.hybrid ?? []); setLoading(false);
  }

  const visibleFilms = onboardingFilms.length ? onboardingFilms : films.slice(0, 14);
  return <main className="min-h-screen overflow-hidden bg-[#070707] text-white">
    <nav className="fixed z-20 flex h-16 w-full items-center justify-between bg-gradient-to-b from-black/90 to-transparent px-5 sm:px-10">
      <div className="flex items-center gap-7"><span className="text-2xl font-black tracking-[-.11em] text-[#A99BFF]">CINEMATCH</span><span className="hidden text-sm text-white/70 md:block">Inicio</span><span className="hidden text-sm text-white/45 md:block">Mi lista</span></div>
      <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/70">{rated.length} películas valoradas</div>
    </nav>

    {!started ? <>
      <section style={{ backgroundImage: "linear-gradient(90deg, #07070b 8%, rgba(7,7,11,.78) 44%, rgba(7,7,11,.12)), url('/images/cinematch-hero.png')" }} className="relative flex min-h-[540px] items-end bg-cover bg-center px-5 pb-16 pt-28 sm:px-10">
        <div className="max-w-2xl"><p className="mb-4 text-xs font-bold uppercase tracking-[.28em] text-[#B5A9FF]">Un catálogo que aprende contigo</p><h1 className="text-5xl font-black leading-[.9] tracking-[-.065em] sm:text-7xl">Descubre algo<br/>que te encante.</h1><p className="mt-6 max-w-lg text-base leading-6 text-white/70">Primero cuéntanos qué tipo de historias te atraen. Con unas cuantas valoraciones, CineMatch construirá tu perfil.</p></div>
      </section>
      <section className="mx-auto -mt-7 max-w-6xl px-5 pb-14 sm:px-10"><div className="rounded-xl border border-white/10 bg-[#151522]/90 p-6 shadow-2xl backdrop-blur sm:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-white/40">Paso 1 de 2</p><h2 className="mt-2 text-2xl font-bold">¿Qué géneros te gustan?</h2><p className="mt-1 text-sm text-white/55">Elige al menos dos. Solo nos sirve para empezar: tus notas mandarán después.</p><div className="mt-6 flex flex-wrap gap-3">{genres.map((genre) => <button key={genre} onClick={() => setSelectedGenres((current) => current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre])} className={`rounded-full border px-4 py-2 text-sm transition ${selectedGenres.includes(genre) ? "border-[#A99BFF] bg-[#6E5BBA] font-semibold" : "border-white/15 bg-white/5 text-white/70 hover:border-white/50"}`}>{genre}</button>)}</div></div></section>
      <section className="px-5 pb-16 sm:px-10"><div className="mx-auto max-w-7xl"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-white/40">Paso 2 de 2</p><h2 className="mt-1 text-2xl font-bold">¿Cuáles has visto?</h2></div><span className="text-sm text-white/50">Pulsa una película para descubrirla · valora al menos 5</span></div><div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5">{visibleFilms.map((film) => <FilmCard key={film.id} film={film} rating={ratings[film.id]} onRate={(value) => rate(film.id, value)} onOpen={() => setSelectedFilm(film)} />)}</div><div className="mt-5 flex items-center gap-4"><button disabled={rated.length < 5 || loading} onClick={discover} className="rounded-full bg-[#B5A9FF] px-6 py-3 text-sm font-bold text-[#141121] transition hover:scale-[1.03] hover:bg-white disabled:cursor-not-allowed disabled:opacity-35">{loading ? "Creando tu perfil..." : "Ver mis recomendaciones"}</button>{rated.length < 5 && <span className="text-sm text-white/45">Te faltan {5 - rated.length} valoraciones.</span>}</div></div></section>
    </> : <>
      <section className="relative flex min-h-[460px] items-end bg-[linear-gradient(105deg,#020305_14%,rgba(2,3,5,.65)_49%,rgba(2,3,5,.08)),radial-gradient(circle_at_81%_31%,#0f6b9d,transparent_22%),radial-gradient(circle_at_66%_64%,#a12a2f,transparent_30%)] px-5 pb-14 pt-28 sm:px-10"><div><p className="text-xs font-bold uppercase tracking-[.28em] text-[#e50914]">Tu selección de hoy</p><h1 className="mt-3 text-5xl font-black leading-[.9] tracking-[-.065em] sm:text-7xl">Recomendado<br/>para ti.</h1><p className="mt-5 max-w-xl text-white/65">Combinamos películas parecidas a las que te gustaron, personas con afinidad y títulos populares del catálogo.</p><button onClick={discover} className="mt-7 rounded bg-white px-5 py-2.5 text-sm font-bold text-black">↻ Actualizar motor</button></div></section>
      <section className="space-y-10 px-5 py-10 sm:px-10"><Row title="Tu mezcla personalizada" subtitle="Motor híbrido · actualizado con tus valoraciones" films={recommendations} loading={loading} /><Row title="Porque te gustaron estas películas" subtitle="Filtrado colaborativo basado en ítems" films={recommendations.slice(5, 18)} loading={loading} /><div><h2 className="text-xl font-bold">Sigue afinando tu perfil</h2><p className="mt-1 text-sm text-white/45">Una nota nueva cambia tus recomendaciones.</p><div className="mt-4 flex gap-4 overflow-x-auto pb-4">{films.slice(0, 12).map((film) => <FilmCard key={film.id} film={film} rating={ratings[film.id]} onRate={(value) => rate(film.id, value)} />)}</div></div></section>
    </>}
  {selectedFilm && <div onClick={() => setSelectedFilm(null)} className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-5 backdrop-blur-sm"><article onClick={(event) => event.stopPropagation()} className={`relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br ${selectedFilm.tint} p-8 shadow-2xl`}><button onClick={() => setSelectedFilm(null)} className="absolute right-5 top-4 text-2xl text-white/70 hover:text-white">×</button><p className="text-xs font-bold uppercase tracking-[.22em] text-white/60">{selectedFilm.genre}</p><h2 className="mt-3 max-w-md text-4xl font-black leading-none">{selectedFilm.title}</h2><p className="mt-5 max-w-md text-base leading-7 text-white/80">{selectedFilm.blurb}. Esta ficha es una primera capa de exploración; en la siguiente iteración la conectaremos con la sinopsis y el póster real del catálogo.</p><div className="mt-8 flex gap-2">{stars.map((star) => <button key={star} onClick={() => rate(selectedFilm.id, star)} className={`rounded-full border px-3 py-2 text-sm ${ratings[selectedFilm.id] && star <= ratings[selectedFilm.id] ? "border-[#FFD66E] bg-[#FFD66E] text-black" : "border-white/25 bg-black/20"}`}>{star} ★</button>)}</div></article></div>}
  </main>;
}

function Row({ title, subtitle, films, loading }: { title: string; subtitle: string; films: Recommendation[]; loading: boolean }) {
  return <div><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-white/45">{subtitle}</p><div className="mt-4 flex gap-4 overflow-x-auto pb-4">{loading ? <p className="py-16 text-white/50">El motor está calculando afinidades…</p> : films.map((film, index) => <article key={film.id} className="group w-40 shrink-0 sm:w-48"><div className={`relative aspect-[2/3] overflow-hidden rounded-md bg-gradient-to-br ${["from-rose-900 via-zinc-900 to-black", "from-sky-700 via-zinc-950 to-black", "from-amber-600 via-red-950 to-black", "from-emerald-700 via-slate-950 to-black"][index % 4]} shadow-xl transition group-hover:-translate-y-1`}><span className="absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-xs font-bold text-[#ffd24a]">★ {film.rating}</span><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent p-3 pt-16"><p className="text-lg font-black uppercase leading-[.93] tracking-tight">{film.title.replace(/ \(\d{4}\)/, "")}</p><p className="mt-2 text-[10px] uppercase tracking-wider text-white/60">{film.reason ?? `Afinidad ${Math.round(film.score * 100)}%`}</p></div></div><p className="mt-2 line-clamp-1 text-xs text-white/45">{film.count} valoraciones en la comunidad</p></article>)}</div></div>;
}
