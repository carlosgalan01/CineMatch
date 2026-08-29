"use client";

import Image from "next/image";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Film = { id: number; title: string; genre: string; blurb: string; tint: string };
type SignalDetail = { rank: number; weight: number; rankFactor: number; contribution: number };
type Recommendation = { id: number; title: string; rating: number; count: number; score: number; reason: string; reasonType: "item" | "users" | "popular"; because?: string; signals?: { popular: number; item: number; users: number }; signalDetails?: Partial<Record<"popular" | "item" | "users", SignalDetail>> };
type SimilarMovie = { id: number; title: string; rating: number; count: number };
type CatalogMovie = { movieId: number; sourceTitle: string; posterUrl: string | null; backdropUrl?: string | null; overview: string; genres: string[]; year?: string };
type MovieView = { id: number; title: string; genre: string; blurb: string; tint: string; reason?: string; communityRating?: number; count?: number };
type AppView = "similar" | "discover" | "ratings" | "recommendations" | "motor";
type LocalProfile = { id: string; name: string };
type ProfileData = { ratings: Record<number, number>; genres: string[]; view: AppView; cardIndex: number };
type Diagnostics = { ratings: number; neighbours: number };

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
  { id: 176, title: "Aliens", genre: "Acción", blurb: "Esta vez es la guerra", tint: "from-cyan-700 via-slate-950 to-[#080812]" },
  { id: 568, title: "Speed", genre: "Acción", blurb: "No bajes de ochenta", tint: "from-red-600 via-zinc-950 to-[#080812]" },
  { id: 2, title: "GoldenEye", genre: "Acción", blurb: "Bond entra en una nueva era", tint: "from-amber-500 via-slate-900 to-[#080812]" },
  { id: 79, title: "The Fugitive", genre: "Acción", blurb: "Un hombre inocente a la fuga", tint: "from-sky-700 via-zinc-950 to-[#080812]" },
  { id: 405, title: "Mission: Impossible", genre: "Acción", blurb: "La misión empieza aquí", tint: "from-blue-700 via-black to-[#080812]" },
  { id: 385, title: "True Lies", genre: "Acción", blurb: "Espías, secretos y una doble vida", tint: "from-orange-700 via-zinc-950 to-[#080812]" },
  { id: 183, title: "Alien", genre: "Ciencia ficción", blurb: "En el espacio nadie puede oír tus gritos", tint: "from-emerald-900 via-slate-950 to-[#080812]" },
  { id: 135, title: "2001: A Space Odyssey", genre: "Ciencia ficción", blurb: "El viaje definitivo", tint: "from-slate-200 via-blue-950 to-[#080812]" },
  { id: 423, title: "E.T. the Extra-Terrestrial", genre: "Ciencia ficción", blurb: "Una amistad de otro mundo", tint: "from-indigo-500 via-blue-950 to-[#080812]" },
  { id: 250, title: "The Fifth Element", genre: "Ciencia ficción", blurb: "El futuro necesita un quinto elemento", tint: "from-orange-500 via-indigo-950 to-[#080812]" },
  { id: 7, title: "Twelve Monkeys", genre: "Ciencia ficción", blurb: "El futuro está en el pasado", tint: "from-yellow-700 via-zinc-950 to-[#080812]" },
  { id: 258, title: "Contact", genre: "Ciencia ficción", blurb: "La señal que cambia todo", tint: "from-sky-500 via-indigo-950 to-[#080812]" },
  { id: 257, title: "Men in Black", genre: "Ciencia ficción", blurb: "Ellos protegen la Tierra", tint: "from-zinc-500 via-black to-[#080812]" },
  { id: 357, title: "One Flew Over the Cuckoo's Nest", genre: "Drama", blurb: "Una rebelión contra las reglas", tint: "from-amber-700 via-stone-950 to-[#080812]" },
  { id: 272, title: "Good Will Hunting", genre: "Drama", blurb: "El talento también necesita valor", tint: "from-emerald-700 via-stone-950 to-[#080812]" },
  { id: 97, title: "Dances with Wolves", genre: "Drama", blurb: "Una frontera, dos mundos", tint: "from-amber-500 via-sky-950 to-[#080812]" },
  { id: 192, title: "Raging Bull", genre: "Drama", blurb: "Dentro y fuera del cuadrilátero", tint: "from-zinc-300 via-zinc-900 to-[#080812]" },
  { id: 23, title: "Taxi Driver", genre: "Drama", blurb: "Las noches de una ciudad enferma", tint: "from-yellow-700 via-red-950 to-[#080812]" },
  { id: 69, title: "Forrest Gump", genre: "Drama", blurb: "Una vida extraordinaria", tint: "from-sky-500 via-emerald-950 to-[#080812]" },
  { id: 56, title: "Pulp Fiction", genre: "Drama", blurb: "Historias cruzadas bajo el neón", tint: "from-yellow-500 via-red-950 to-[#080812]" },
  { id: 11, title: "Seven", genre: "Thriller", blurb: "Siete pecados, una investigación", tint: "from-amber-900 via-zinc-950 to-[#080812]" },
  { id: 273, title: "Heat", genre: "Thriller", blurb: "Dos hombres a ambos lados de la ley", tint: "from-blue-600 via-slate-950 to-[#080812]" },
  { id: 479, title: "Vertigo", genre: "Thriller", blurb: "Una obsesión que desafía la realidad", tint: "from-emerald-600 via-red-950 to-[#080812]" },
  { id: 185, title: "Psycho", genre: "Thriller", blurb: "Una parada que nunca se olvida", tint: "from-zinc-200 via-zinc-900 to-[#080812]" },
  { id: 603, title: "Rear Window", genre: "Thriller", blurb: "Todo el mundo guarda un secreto", tint: "from-amber-600 via-slate-950 to-[#080812]" },
  { id: 302, title: "L.A. Confidential", genre: "Thriller", blurb: "La ciudad de las apariencias", tint: "from-yellow-700 via-zinc-950 to-[#080812]" },
  { id: 173, title: "The Princess Bride", genre: "Comedia", blurb: "Espadas, aventuras y amor verdadero", tint: "from-emerald-600 via-blue-950 to-[#080812]" },
  { id: 94, title: "Home Alone", genre: "Comedia", blurb: "Navidad, trampas y una casa vacía", tint: "from-red-600 via-emerald-950 to-[#080812]" },
  { id: 393, title: "Mrs. Doubtfire", genre: "Comedia", blurb: "Una familia, un disfraz inolvidable", tint: "from-sky-500 via-violet-950 to-[#080812]" },
  { id: 70, title: "Four Weddings and a Funeral", genre: "Comedia", blurb: "El amor nunca llega a tiempo", tint: "from-rose-500 via-slate-950 to-[#080812]" },
  { id: 25, title: "The Birdcage", genre: "Comedia", blurb: "Una cena difícil de mantener en secreto", tint: "from-fuchsia-600 via-blue-950 to-[#080812]" },
  { id: 71, title: "The Lion King", genre: "Animación", blurb: "Recuerda quién eres", tint: "from-amber-500 via-orange-950 to-[#080812]" },
  { id: 95, title: "Aladdin", genre: "Animación", blurb: "Un deseo puede cambiarlo todo", tint: "from-blue-600 via-violet-950 to-[#080812]" },
  { id: 588, title: "Beauty and the Beast", genre: "Animación", blurb: "La belleza está en el interior", tint: "from-amber-500 via-blue-950 to-[#080812]" },
  { id: 99, title: "Snow White and the Seven Dwarfs", genre: "Animación", blurb: "El cuento que abrió una era", tint: "from-sky-500 via-red-950 to-[#080812]" },
  { id: 404, title: "Pinocchio", genre: "Animación", blurb: "El deseo de ser un niño de verdad", tint: "from-yellow-500 via-blue-950 to-[#080812]" },
  { id: 432, title: "Fantasia", genre: "Animación", blurb: "Música convertida en imágenes", tint: "from-indigo-500 via-blue-950 to-[#080812]" },
  { id: 91, title: "The Nightmare Before Christmas", genre: "Animación", blurb: "Cuando Halloween descubre la Navidad", tint: "from-violet-700 via-black to-[#080812]" },
  { id: 596, title: "The Hunchback of Notre Dame", genre: "Animación", blurb: "Las campanas de Notre Dame", tint: "from-red-700 via-indigo-950 to-[#080812]" },
  { id: 313, title: "Titanic", genre: "Romance", blurb: "Un amor contra el tiempo", tint: "from-sky-500 via-blue-950 to-[#080812]" },
  { id: 739, title: "Pretty Woman", genre: "Romance", blurb: "Un encuentro inesperado", tint: "from-rose-500 via-red-950 to-[#080812]" },
  { id: 88, title: "Sleepless in Seattle", genre: "Romance", blurb: "Dos ciudades y una voz en la radio", tint: "from-blue-500 via-slate-950 to-[#080812]" },
  { id: 275, title: "Sense and Sensibility", genre: "Romance", blurb: "Entre la razón y el corazón", tint: "from-emerald-600 via-stone-950 to-[#080812]" },
  { id: 286, title: "The English Patient", genre: "Romance", blurb: "Un amor escrito en el desierto", tint: "from-amber-500 via-stone-950 to-[#080812]" },
  { id: 133, title: "Gone with the Wind", genre: "Romance", blurb: "Una pasión en tiempos de guerra", tint: "from-red-600 via-zinc-950 to-[#080812]" },
  { id: 134, title: "Citizen Kane", genre: "Clásicos", blurb: "El misterio de una última palabra", tint: "from-zinc-300 via-zinc-900 to-[#080812]" },
  { id: 511, title: "Lawrence of Arabia", genre: "Clásicos", blurb: "El desierto y la leyenda", tint: "from-amber-400 via-orange-950 to-[#080812]" },
  { id: 178, title: "12 Angry Men", genre: "Clásicos", blurb: "Una duda razonable", tint: "from-stone-300 via-zinc-900 to-[#080812]" },
  { id: 480, title: "North by Northwest", genre: "Clásicos", blurb: "El hombre equivocado en el lugar equivocado", tint: "from-sky-500 via-zinc-950 to-[#080812]" },
  { id: 488, title: "Sunset Boulevard", genre: "Clásicos", blurb: "El lado oscuro de Hollywood", tint: "from-zinc-300 via-amber-950 to-[#080812]" },
  { id: 484, title: "The Maltese Falcon", genre: "Clásicos", blurb: "Todos buscan la misma pieza", tint: "from-amber-700 via-zinc-950 to-[#080812]" },
  { id: 705, title: "Singin' in the Rain", genre: "Clásicos", blurb: "Hollywood aprende a cantar", tint: "from-yellow-400 via-blue-950 to-[#080812]" },
];

const stars = [1, 2, 3, 4, 5];
const fallbackTints = ["from-violet-700 via-indigo-950 to-[#080812]", "from-sky-700 via-slate-950 to-[#080812]", "from-amber-600 via-stone-950 to-[#080812]", "from-emerald-700 via-slate-950 to-[#080812]"];
function cleanTitle(title: string) {
  const withoutYear = title.replace(/\s*\(\d{4}\)$/, "");
  const article = withoutYear.match(/^(.*), (The|A|An)$/);
  return article ? `${article[2]} ${article[1]}` : withoutYear;
}
const profileKey = (id: string, field: "ratings" | "genres" | "view" | "card") => `cinematch-profile:${id}:${field}`;

function readProfileData(id: string): ProfileData {
  try {
    const ratings = JSON.parse(window.localStorage.getItem(profileKey(id, "ratings")) ?? "{}") as Record<number, number>;
    const savedGenres = JSON.parse(window.localStorage.getItem(profileKey(id, "genres")) ?? "[]") as string[];
    const savedView = window.localStorage.getItem(profileKey(id, "view")) as AppView | null;
    const savedCard = Number(window.localStorage.getItem(profileKey(id, "card")) ?? 0);
    const view = savedView && ["similar", "discover", "ratings", "recommendations", "motor"].includes(savedView) ? savedView : Object.keys(ratings).length >= 5 ? "recommendations" : "discover";
    return { ratings, genres: savedGenres, view, cardIndex: Number.isInteger(savedCard) && savedCard >= 0 ? savedCard : 0 };
  } catch {
    return { ratings: {}, genres: [], view: "discover", cardIndex: 0 };
  }
}

function writeProfileData(id: string, data: ProfileData) {
  window.localStorage.setItem(profileKey(id, "ratings"), JSON.stringify(data.ratings));
  window.localStorage.setItem(profileKey(id, "genres"), JSON.stringify(data.genres));
  window.localStorage.setItem(profileKey(id, "view"), data.view);
  window.localStorage.setItem(profileKey(id, "card"), String(data.cardIndex));
}

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
  return <div className={`flex items-center ${large ? "gap-2" : "gap-1"}`} aria-label={value ? `Tu valoración: ${value} de 5` : "Valora esta película"}>{stars.map((star) => { const selected = Boolean(value && star <= value); return <button key={star} type="button" onClick={() => onRate(star)} aria-label={`${star} ${star === 1 ? "estrella" : "estrellas"}`} className={`group grid rounded-full transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9adff] ${large ? `h-12 w-12 border sm:h-13 sm:w-13 ${selected ? "border-[#e8c77a]/60 bg-[#e8c77a]/12 shadow-[0_0_22px_rgba(232,199,122,.12)]" : "border-white/10 bg-black/20 hover:-translate-y-1 hover:border-[#e8c77a]/45 hover:bg-[#e8c77a]/8"}` : "h-8 w-8"}`}><Icon name="star" className={`${large ? "h-7 w-7" : "h-5 w-5"} place-self-center transition group-hover:scale-110 ${selected ? "text-[#e8c77a]" : "text-white/25 group-hover:text-[#e8c77a]"}`} /></button>; })}</div>;
}

export default function Home() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [storageReady, setStorageReady] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<MovieView | null>(null);
  const [catalog, setCatalog] = useState<Record<number, CatalogMovie>>({});
  const catalogRef = useRef<Record<number, CatalogMovie>>({});
  const restoreAttempted = useRef(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [activeView, setActiveView] = useState<AppView>("similar");
  const [hasDiscovered, setHasDiscovered] = useState(false);
  const [cardMotion, setCardMotion] = useState<"left" | "right" | null>(null);
  const [ratingFeedback, setRatingFeedback] = useState<number | null>(null);
  const [profiles, setProfiles] = useState<LocalProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<LocalProfile | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [ratedConfirmation, setRatedConfirmation] = useState<{ title: string; rating: number } | null>(null);
  const [similarCatalog, setSimilarCatalog] = useState<SimilarMovie[]>([]);
  const [similarQuery, setSimilarQuery] = useState("");
  const [similarSeed, setSimilarSeed] = useState<SimilarMovie | null>(null);
  const [similarResults, setSimilarResults] = useState<Recommendation[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState("");
  const confirmationTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const savedProfiles = JSON.parse(window.localStorage.getItem("cinematch-profiles") ?? "[]") as LocalProfile[];
        const activeId = window.localStorage.getItem("cinematch-active-profile");
        const savedProfile = savedProfiles.find((profile) => profile.id === activeId) ?? null;
        setProfiles(savedProfiles);
        if (savedProfile) {
          const data = readProfileData(savedProfile.id);
          setActiveProfile(savedProfile); setRatings(data.ratings); setSelectedGenres(data.genres); setActiveView(data.view); setCurrentCard(data.cardIndex);
        } else {
          const legacyRatings = JSON.parse(window.localStorage.getItem("cinematch-ratings") ?? "{}") as Record<number, number>;
          const legacyGenres = JSON.parse(window.localStorage.getItem("cinematch-genres") ?? "[]") as string[];
          const legacyView = window.localStorage.getItem("cinematch-view") as AppView | null;
          setRatings(legacyRatings); setSelectedGenres(legacyGenres);
          if (legacyView && ["similar", "discover", "ratings", "recommendations", "motor"].includes(legacyView)) setActiveView(legacyView);
          else if (Object.keys(legacyRatings).length >= 5) setActiveView("recommendations");
        }
      } catch { window.localStorage.removeItem("cinematch-ratings"); }
      finally { setStorageReady(true); }
    });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (storageReady && activeProfile) window.localStorage.setItem(profileKey(activeProfile.id, "ratings"), JSON.stringify(ratings)); }, [ratings, storageReady, activeProfile]);
  useEffect(() => { if (storageReady && activeProfile) window.localStorage.setItem(profileKey(activeProfile.id, "genres"), JSON.stringify(selectedGenres)); }, [selectedGenres, storageReady, activeProfile]);
  useEffect(() => { if (storageReady && activeProfile) window.localStorage.setItem(profileKey(activeProfile.id, "view"), activeView); }, [activeView, storageReady, activeProfile]);
  useEffect(() => { if (storageReady && activeProfile) window.localStorage.setItem(profileKey(activeProfile.id, "card"), String(currentCard)); }, [currentCard, storageReady, activeProfile]);
  useEffect(() => {
    if (!selectedMovie) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedMovie(null); };
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; };
  }, [selectedMovie]);
  useEffect(() => () => { if (confirmationTimer.current) window.clearTimeout(confirmationTimer.current); }, []);

  const rated = useMemo(() => Object.entries(ratings).map(([movieId, rating]) => ({ movieId: Number(movieId), rating })), [ratings]);
  const visibleFilms = useMemo(() => [
    ...films.filter((film) => selectedGenres.includes(film.genre)),
    ...films.filter((film) => !selectedGenres.includes(film.genre)),
  ], [selectedGenres]);
  const tinderFilm = visibleFilms[currentCard];
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
  useEffect(() => {
    let active = true;
    fetch("/api/similar")
      .then((response) => response.json())
      .then((result: { movies?: SimilarMovie[] }) => { if (active) setSimilarCatalog(result.movies ?? []); })
      .catch(() => { if (active) setSimilarError("No hemos podido cargar el catálogo de películas."); });
    return () => { active = false; };
  }, []);
  useEffect(() => { void loadCatalog(visibleFilms.slice(currentCard, currentCard + 8).map((film) => film.id)); }, [loadCatalog, visibleFilms, currentCard]);

  const discover = useCallback(async (nextRatings: Record<number, number>, navigateToResults = false) => {
    const payload = Object.entries(nextRatings).map(([movieId, rating]) => ({ movieId: Number(movieId), rating }));
    if (payload.length < 5) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ratings: payload }) });
      const result = await response.json() as { hybrid?: Recommendation[]; diagnostics?: Diagnostics; error?: string };
      if (!response.ok) throw new Error(result.error || "No hemos podido actualizar tu selección.");
      const nextRecommendations = result.hybrid ?? [];
      setRecommendations(nextRecommendations); setDiagnostics(result.diagnostics ?? null); setHasDiscovered(true);
      if (navigateToResults) setActiveView("recommendations");
      void loadCatalog(nextRecommendations.map((movie) => movie.id));
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "No hemos podido actualizar tu selección."); }
    finally { setLoading(false); }
  }, [loadCatalog]);
  useEffect(() => {
    if (!hasDiscovered) return;
    const timer = window.setTimeout(() => { void discover(ratings); }, 450);
    return () => window.clearTimeout(timer);
  }, [ratings, hasDiscovered, discover]);
  useEffect(() => {
    if (!storageReady || !activeProfile || !["recommendations", "motor"].includes(activeView) || rated.length < 5 || recommendations.length || restoreAttempted.current) return;
    restoreAttempted.current = true;
    void discover(ratings);
  }, [storageReady, activeProfile, activeView, rated.length, recommendations.length, discover, ratings]);

  const rate = (id: number, value: number) => setRatings((current) => ({ ...current, [id]: value }));
  function advance(direction: "left" | "right") {
    if (cardMotion) return;
    setCardMotion(direction);
    window.setTimeout(() => { setCurrentCard((current) => current + 1); setCardMotion(null); }, 260);
  }
  function rateAndAdvance(value: number) {
    if (!tinderFilm || ratingFeedback) return;
    rate(tinderFilm.id, value); setRatingFeedback(value);
    window.setTimeout(() => { setRatingFeedback(null); advance("right"); }, 420);
  }
  function viewForRecommendation(movie: Recommendation): MovieView {
    return { id: movie.id, title: cleanTitle(movie.title), genre: catalog[movie.id]?.genres.join(" · ") || "Selección CineMatch", blurb: catalog[movie.id]?.overview || "Una recomendación encontrada al cruzar tus valoraciones con los patrones de la comunidad MovieLens.", tint: fallbackTints[movie.id % fallbackTints.length], reason: movie.reason, communityRating: movie.rating, count: movie.count };
  }
  function selectProfile(profile: LocalProfile) {
    if (activeProfile) writeProfileData(activeProfile.id, { ratings, genres: selectedGenres, view: activeView, cardIndex: currentCard });
    const data = readProfileData(profile.id);
    window.localStorage.setItem("cinematch-active-profile", profile.id);
    restoreAttempted.current = false;
    setActiveProfile(profile); setRatings(data.ratings); setSelectedGenres(data.genres); setActiveView(data.view); setCurrentCard(data.cardIndex);
    setRecommendations([]); setDiagnostics(null); setHasDiscovered(false); setSelectedMovie(null); setProfileDialogOpen(false);
  }
  function createProfile(name: string) {
    const profile = { id: crypto.randomUUID(), name: name.trim() };
    const nextProfiles = [...profiles, profile];
    const carryLegacyData = profiles.length === 0 && !activeProfile;
    const data: ProfileData = carryLegacyData ? { ratings, genres: selectedGenres, view: activeView, cardIndex: currentCard } : { ratings: {}, genres: [], view: "discover", cardIndex: 0 };
    writeProfileData(profile.id, data);
    window.localStorage.setItem("cinematch-profiles", JSON.stringify(nextProfiles));
    window.localStorage.setItem("cinematch-active-profile", profile.id);
    if (carryLegacyData) {
      window.localStorage.removeItem("cinematch-ratings"); window.localStorage.removeItem("cinematch-genres"); window.localStorage.removeItem("cinematch-view");
    }
    setProfiles(nextProfiles); setActiveProfile(profile); setRatings(data.ratings); setSelectedGenres(data.genres); setActiveView(data.view); setCurrentCard(data.cardIndex);
    setRecommendations([]); setDiagnostics(null); setHasDiscovered(false); restoreAttempted.current = false; setProfileDialogOpen(false);
  }
  function deleteProfile(profile: LocalProfile) {
    const confirmed = window.confirm(`¿Eliminar el perfil de ${profile.name}? Se borrarán definitivamente sus valoraciones y preferencias de este dispositivo.`);
    if (!confirmed) return;

    const nextProfiles = profiles.filter((candidate) => candidate.id !== profile.id);
    (["ratings", "genres", "view", "card"] as const).forEach((field) => window.localStorage.removeItem(profileKey(profile.id, field)));
    window.localStorage.setItem("cinematch-profiles", JSON.stringify(nextProfiles));
    setProfiles(nextProfiles);

    if (activeProfile?.id !== profile.id) return;

    const nextProfile = nextProfiles[0] ?? null;
    const data = nextProfile ? readProfileData(nextProfile.id) : { ratings: {}, genres: [], view: "discover" as AppView, cardIndex: 0 };
    if (nextProfile) window.localStorage.setItem("cinematch-active-profile", nextProfile.id);
    else window.localStorage.removeItem("cinematch-active-profile");
    restoreAttempted.current = false;
    setActiveProfile(nextProfile); setRatings(data.ratings); setSelectedGenres(data.genres); setActiveView(data.view); setCurrentCard(data.cardIndex);
    setRecommendations([]); setDiagnostics(null); setHasDiscovered(false); setSelectedMovie(null);
  }
  function rateSelectedMovie(value: number) {
    if (!selectedMovie) return;
    rate(selectedMovie.id, value);
    if (activeView !== "recommendations") return;
    setRatedConfirmation({ title: selectedMovie.title, rating: value });
    setSelectedMovie(null);
    if (confirmationTimer.current) window.clearTimeout(confirmationTimer.current);
    confirmationTimer.current = window.setTimeout(() => setRatedConfirmation(null), 2500);
  }
  async function findSimilar(movie: SimilarMovie) {
    setSimilarSeed(movie); setSimilarQuery(cleanTitle(movie.title)); setSimilarLoading(true); setSimilarError("");
    try {
      const response = await fetch(`/api/similar?movieId=${movie.id}`);
      const result = await response.json() as { recommendations?: Recommendation[]; error?: string };
      if (!response.ok) throw new Error(result.error || "No hemos podido comparar esta película.");
      const nextResults = result.recommendations ?? [];
      setSimilarResults(nextResults);
      void loadCatalog([movie.id, ...nextResults.map((resultMovie) => resultMovie.id)]);
    } catch (requestError) {
      setSimilarResults([]);
      setSimilarError(requestError instanceof Error ? requestError.message : "No hemos podido comparar esta película.");
    } finally { setSimilarLoading(false); }
  }

  return <main className="min-h-screen overflow-x-hidden bg-[#080812] pb-16 text-[#f7f1e7] sm:pb-0">
    <Navigation ratedCount={rated.length} activeView={activeView} canViewRecommendations={rated.length >= 5} profileName={activeProfile?.name} onProfileClick={() => setProfileDialogOpen(true)} onNavigate={setActiveView} />
    {activeView === "similar" && <SimilarMoviesView query={similarQuery} onQueryChange={(value) => { setSimilarQuery(value); if (value.trim().toLocaleLowerCase("es") !== cleanTitle(similarSeed?.title ?? "").toLocaleLowerCase("es")) { setSimilarSeed(null); setSimilarResults([]); } }} movies={similarCatalog} seed={similarSeed} results={similarResults} catalog={catalog} loading={similarLoading} error={similarError} onSelect={(movie) => void findSimilar(movie)} onOpen={(movie) => setSelectedMovie(viewForRecommendation(movie))} />}
    {activeView === "discover" && <GenreIntro selectedGenres={selectedGenres} onToggle={(genre) => setSelectedGenres((current) => current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre])} onContinue={() => setActiveView("ratings")} />}
    {activeView === "ratings" && <section className="relative min-h-screen px-5 pb-12 pt-24 sm:px-8 sm:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(97,74,180,.22),transparent_34%),linear-gradient(180deg,#080812_0%,#0c0c19_58%,#080812_100%)]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center"><p className="eyebrow">Paso 2 · Valoraciones</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">Valora las películas que conozcas</h1><p className="mx-auto mt-3 hidden max-w-xl text-sm leading-6 text-white/55 sm:block sm:text-base">Puedes saltarte todas las que no hayas visto. Con cinco valoraciones ya podemos calcular las primeras recomendaciones.</p></div>
        {tinderFilm ? <div className="mx-auto mt-5 grid max-w-4xl items-center gap-5 sm:mt-8 sm:gap-7 lg:grid-cols-[minmax(280px,390px)_1fr] lg:gap-14">
          <div className={`relative mx-auto w-full max-w-[250px] sm:max-w-[350px] ${cardMotion === "left" ? "card-exit-left" : cardMotion === "right" ? "card-exit-right" : "card-enter"}`} key={tinderFilm.id}>
            <div className="absolute inset-4 translate-y-4 rounded-[1.8rem] border border-white/8 bg-[#18172a] opacity-55" />
            <button type="button" onClick={() => setSelectedMovie(tinderFilm)} className="group relative block aspect-[2/3] w-full overflow-hidden rounded-[1.6rem] border border-white/15 text-left shadow-[0_30px_80px_rgba(0,0,0,.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9adff]">
              <Poster movie={tinderFilm} metadata={catalog[tinderFilm.id]} sizes="(max-width: 640px) 90vw, 350px" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080812] via-[#080812]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7"><div className="mb-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#d6ca9b]"><span>{catalog[tinderFilm.id]?.year || "Selección esencial"}</span><span>·</span><span>{catalog[tinderFilm.id]?.genres.join(" · ") || tinderFilm.genre}</span></div><h2 className="text-3xl font-semibold leading-[.95] tracking-[-.04em] sm:text-4xl">{tinderFilm.title}</h2><p className="mt-3 line-clamp-2 text-sm leading-5 text-white/65">{catalog[tinderFilm.id]?.overview || tinderFilm.blurb}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white/75 transition group-hover:text-white"><Icon name="info" className="h-4 w-4" /> Abrir ficha</span></div>
            </button>
          </div>
          <div className="mx-auto w-full max-w-md lg:mx-0">
            <div className="flex items-end justify-between gap-5"><div><p className="eyebrow">Valoraciones del perfil</p><p className="mt-2 text-lg font-medium">{rated.length < 5 ? `${rated.length} de 5 valoraciones` : "Ya podemos calcular el ranking"}</p></div><span className="text-xs text-white/35">Ordenadas por tus géneros</span></div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#8170df] to-[#e8c77a] transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>
            <div className="relative mt-4 overflow-hidden rounded-2xl border border-[#a99bff]/25 bg-[radial-gradient(circle_at_50%_0%,rgba(143,125,232,.18),transparent_55%),rgba(255,255,255,.045)] p-4 shadow-[0_20px_60px_rgba(35,24,82,.18)] sm:mt-8 sm:p-6"><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b9adff] to-transparent" /><p className="eyebrow text-center">Tu valoración</p><p className={`mt-2 text-center text-base font-semibold transition ${ratingFeedback ? "text-[#e8c77a]" : "text-white"}`}>{ratingFeedback ? `✓ Guardada · ${ratingFeedback} de 5` : "¿Qué te pareció?"}</p><div className="mt-4 flex justify-center"><RatingStars value={ratings[tinderFilm.id]} onRate={rateAndAdvance} large /></div><div className="mx-auto mt-2 flex max-w-[292px] justify-between px-1 text-[10px] text-white/28"><span>No me gustó</span><span>Me encantó</span></div><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={() => advance("left")} className="secondary-action"><Icon name="skip" className="h-5 w-5" /> {ratings[tinderFilm.id] ? "Siguiente película" : "No la he visto"}</button><button type="button" onClick={() => setSelectedMovie(tinderFilm)} className="secondary-action"><Icon name="info" className="h-5 w-5" /> Ver ficha</button></div></div>
            {rated.length >= 5 ? <button type="button" disabled={loading} onClick={() => void discover(ratings, true)} className="primary-action mt-5 w-full">{loading ? "Calculando recomendaciones…" : <><Icon name="spark" className="h-5 w-5" /> Ver mis recomendaciones</>}</button> : <p className="mt-5 text-center text-xs leading-5 text-white/40">Te faltan {5 - rated.length} valoraciones. Puedes saltarte todas las películas que no conozcas.</p>}
            {error && <p role="alert" className="mt-4 text-center text-sm text-rose-300">{error}</p>}
            <button type="button" onClick={() => setActiveView("discover")} className="mx-auto mt-5 block text-xs text-white/35 underline-offset-4 hover:text-white hover:underline">Cambiar géneros</button>
          </div>
        </div> : <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-white/10 bg-white/[.04] p-8 text-center sm:p-10"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#7161bd]/25 text-[#c8beff]"><Icon name="check" /></span><p className="eyebrow mt-6">Lista completada</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Ya has revisado todas las películas</h2><p className="mt-3 text-sm leading-6 text-white/50">Puedes cambiar los géneros para modificar el orden o calcular las recomendaciones con las valoraciones que ya has guardado.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">{rated.length >= 5 && <button type="button" disabled={loading} onClick={() => void discover(ratings, true)} className="primary-action"><Icon name="spark" className="h-5 w-5" /> Ver mis recomendaciones</button>}<button type="button" onClick={() => setActiveView("discover")} className="secondary-action">Cambiar géneros</button></div></div>}
      </div>
    </section>}
    {activeView === "recommendations" && <RecommendationsView recommendations={recommendations} catalog={catalog} ratings={ratings} loading={loading} error={error} onRefresh={() => void discover(ratings)} onOpen={(movie) => setSelectedMovie(viewForRecommendation(movie))} onRate={rate} />}
    {activeView === "motor" && <MotorView ratedCount={rated.length} recommendations={recommendations} diagnostics={diagnostics} loading={loading} onCalculate={() => void discover(ratings)} />}
    {selectedMovie && <MovieModal movie={selectedMovie} metadata={catalog[selectedMovie.id]} rating={ratings[selectedMovie.id]} onRate={rateSelectedMovie} onClose={() => setSelectedMovie(null)} />}
    {ratedConfirmation && <RatingConfirmation title={ratedConfirmation.title} rating={ratedConfirmation.rating} />}
    {storageReady && (((!activeProfile && activeView !== "similar") || profileDialogOpen)) && <ProfileDialog profiles={profiles} activeProfile={activeProfile} hasLegacyRatings={!activeProfile && rated.length > 0} onSelect={selectProfile} onCreate={createProfile} onDelete={deleteProfile} onClose={activeView === "similar" || activeProfile ? () => setProfileDialogOpen(false) : undefined} />}
  </main>;
}

function Navigation({ ratedCount, activeView, canViewRecommendations, profileName, onProfileClick, onNavigate }: { ratedCount: number; activeView: AppView; canViewRecommendations: boolean; profileName?: string; onProfileClick: () => void; onNavigate: (view: AppView) => void }) {
  const items: Array<{ view: AppView; label: string }> = [{ view: "similar", label: "Similares" }, { view: "discover", label: "Descubrir" }, { view: "ratings", label: "Valorar" }, { view: "recommendations", label: "Para ti" }, { view: "motor", label: "Motor" }];
  const tabs = (mobile = false) => items.map(({ view, label }) => {
    const disabled = view === "recommendations" && !canViewRecommendations;
    const active = activeView === view;
    return <button key={view} type="button" disabled={disabled} title={disabled ? "Valora al menos 5 películas para acceder" : undefined} onClick={() => onNavigate(view)} className={`${mobile ? "flex-1 py-3 text-xs" : "px-3 py-2 text-sm"} relative font-medium transition ${active ? "text-white" : "text-white/42 hover:text-white/75"} disabled:cursor-not-allowed disabled:opacity-25`}><span>{label}</span>{active && <span className={`absolute bg-[#a99bff] ${mobile ? "inset-x-5 top-0 h-0.5" : "inset-x-3 -bottom-[13px] h-0.5"}`} />}</button>;
  });
  return <><nav className="fixed inset-x-0 top-0 z-40 border-b border-white/[.06] bg-[#080812]/75 backdrop-blur-xl"><div className="mx-auto grid h-16 max-w-[1500px] grid-cols-[1fr_auto] items-center px-5 sm:h-18 sm:grid-cols-[1fr_auto_1fr] sm:px-8 lg:px-12"><button type="button" onClick={() => onNavigate("similar")} className="justify-self-start text-xl font-black tracking-[-.09em] text-[#b3a6ff] sm:text-2xl">CINEMATCH</button><div className="hidden items-center gap-2 sm:flex">{tabs()}</div><button type="button" onClick={onProfileClick} className="flex max-w-36 items-center gap-2 justify-self-end rounded-full border border-white/12 bg-white/[.06] px-2.5 py-1.5 text-[11px] text-white/65 transition hover:border-white/25 hover:text-white sm:max-w-48 sm:text-xs"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#7161bd] text-[10px] font-bold text-white">{profileName?.charAt(0).toUpperCase() || "?"}</span><span className="truncate">{profileName || "Crear perfil"}</span><span className="tabular-nums text-white/35">· {ratedCount}</span></button></div></nav><nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-[#0d0d18]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">{tabs(true)}</nav></>;
}

function SimilarMoviesView({ query, onQueryChange, movies, seed, results, catalog, loading, error, onSelect, onOpen }: { query: string; onQueryChange: (value: string) => void; movies: SimilarMovie[]; seed: SimilarMovie | null; results: Recommendation[]; catalog: Record<number, CatalogMovie>; loading: boolean; error: string; onSelect: (movie: SimilarMovie) => void; onOpen: (movie: Recommendation) => void }) {
  const matches = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("es");
    if (!search || seed) return [];
    return movies.filter((movie) => cleanTitle(movie.title).toLocaleLowerCase("es").includes(search)).slice(0, 7);
  }, [movies, query, seed]);
  return <section className="relative min-h-screen overflow-hidden px-5 pb-20 pt-28 sm:px-8 lg:px-12"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_15%,rgba(116,88,215,.26),transparent_28%),radial-gradient(circle_at_15%_70%,rgba(232,199,122,.1),transparent_25%)]" /><div className="relative mx-auto max-w-6xl"><div className="max-w-3xl"><p className="eyebrow">Proyecto de aplicación · Ítem–ítem</p><h1 className="mt-4 text-5xl font-semibold leading-[.9] tracking-[-.065em] sm:text-7xl">Parte de una película.<br /><span className="font-serif font-normal italic text-[#e8c77a]">Encuentra las siguientes.</span></h1><p className="mt-6 max-w-2xl text-base leading-7 text-white/62 sm:text-lg">Aquí podemos buscar una película directamente. CineMatch compara su patrón de valoraciones con el resto de MovieLens y devuelve las que más se le parecen.</p></div><div className="relative mt-10 max-w-2xl"><label htmlFor="similar-search" className="sr-only">Buscar película</label><div className="flex items-center gap-3 rounded-2xl border border-white/14 bg-[#121221]/90 p-2 shadow-[0_22px_80px_rgba(0,0,0,.35)] backdrop-blur"><input id="similar-search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Prueba con Toy Story, Star Wars…" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base text-white outline-none placeholder:text-white/30" /><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#8f7de8]/15 text-[#c8beff]"><Icon name="spark" className="h-5 w-5" /></span></div>{matches.length > 0 && <div className="absolute inset-x-0 z-20 mt-2 overflow-hidden rounded-2xl border border-white/12 bg-[#151522] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,.5)]">{matches.map((movie) => <button key={movie.id} type="button" onClick={() => onSelect(movie)} className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition hover:bg-white/[.06]"><span><span className="block text-sm font-semibold">{cleanTitle(movie.title)}</span><span className="mt-1 block text-xs text-white/40">★ {movie.rating} · {movie.count} valoraciones</span></span><Icon name="arrow" className="h-4 w-4 shrink-0 text-[#c8beff]" /></button>)}</div>}</div>{error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}{loading && <div className="mt-10 grid min-h-48 place-items-center rounded-2xl border border-white/10 bg-white/[.025] text-sm text-white/55">Comparando patrones de valoración…</div>}{seed && !loading && results.length > 0 && <div className="mt-14"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/8 pb-6"><div><p className="eyebrow">Película de partida</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">{cleanTitle(seed.title)}</h2><p className="mt-2 text-sm text-white/48">Las siguientes películas han recibido valoraciones parecidas por parte de la comunidad.</p></div><button type="button" onClick={() => { onQueryChange(""); }} className="secondary-action px-4">Buscar otra</button></div><div className="mt-10"><RecommendationRow title="Películas con un patrón parecido" subtitle="Ordenadas mediante similitud del coseno entre sus vectores de valoraciones" films={results} catalog={catalog} loading={false} onOpen={onOpen} /></div><div className="mt-10 rounded-2xl border border-[#a99bff]/16 bg-[#7161bd]/[.08] p-5 sm:p-6"><p className="eyebrow">Qué estamos comparando</p><p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">No utilizamos géneros ni sinopsis. Dos películas quedan cerca cuando las personas que han visto ambas tienden a puntuarlas de una forma parecida. Por eso este resultado es distinto de una búsqueda por temática.</p></div></div>}{!seed && !loading && <div className="mt-14 grid gap-4 sm:grid-cols-3"><article className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#e8c77a]">01</p><h2 className="mt-3 text-lg font-semibold">Elige una película</h2><p className="mt-2 text-sm leading-6 text-white/45">Escribe un título y selecciónalo en la lista.</p></article><article className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#e8c77a]">02</p><h2 className="mt-3 text-lg font-semibold">Comparamos sus notas</h2><p className="mt-2 text-sm leading-6 text-white/45">Tomamos el vector de valoraciones de esa película.</p></article><article className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#e8c77a]">03</p><h2 className="mt-3 text-lg font-semibold">Vemos las más cercanas</h2><p className="mt-2 text-sm leading-6 text-white/45">La similitud del coseno ordena los resultados.</p></article></div>}</div></section>;
}

function ProfileDialog({ profiles, activeProfile, hasLegacyRatings, onSelect, onCreate, onDelete, onClose }: { profiles: LocalProfile[]; activeProfile: LocalProfile | null; hasLegacyRatings: boolean; onSelect: (profile: LocalProfile) => void; onCreate: (name: string) => void; onDelete: (profile: LocalProfile) => void; onClose?: () => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2) return setError("Escribe al menos dos caracteres.");
    if (cleanName.length > 20) return setError("El nombre puede tener como máximo 20 caracteres.");
    if (profiles.some((profile) => profile.name.toLocaleLowerCase("es") === cleanName.toLocaleLowerCase("es"))) return setError("Ya existe un perfil con ese nombre.");
    onCreate(cleanName);
  }
  return <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-[#05050c]/90 p-4 backdrop-blur-xl" onMouseDown={(event) => { if (onClose && event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="profile-title" className="relative w-full max-w-lg rounded-3xl border border-white/12 bg-[#12121f] p-6 shadow-[0_30px_100px_rgba(0,0,0,.7)] sm:p-8">{onClose && <button type="button" onClick={onClose} aria-label="Cerrar perfiles" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/50 transition hover:text-white"><Icon name="close" className="h-4 w-4" /></button>}<p className="eyebrow">Perfiles locales</p><h2 id="profile-title" className="mt-3 text-3xl font-semibold tracking-[-.04em]">{activeProfile ? "¿Quién va a elegir?" : "Ponle nombre a tu perfil"}</h2><p className="mt-2 text-sm leading-6 text-white/50">Cada perfil conserva sus propias valoraciones, géneros y recomendaciones en este dispositivo.</p>{profiles.length > 0 && <div className="mt-6 grid grid-cols-2 gap-3">{profiles.map((profile) => <div key={profile.id} className={`relative overflow-hidden rounded-xl border transition ${profile.id === activeProfile?.id ? "border-[#a99bff]/60 bg-[#7161bd]/15" : "border-white/10 bg-white/[.03] hover:border-white/25"}`}><button type="button" onClick={() => onSelect(profile)} className="flex w-full items-center gap-3 p-3 pr-11 text-left"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8f7de8] to-[#47377f] text-sm font-bold">{profile.name.charAt(0).toUpperCase()}</span><span className="truncate text-sm font-semibold">{profile.name}</span></button><button type="button" onClick={() => onDelete(profile)} aria-label={`Eliminar perfil ${profile.name}`} title={`Eliminar perfil ${profile.name}`} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-white/30 transition hover:bg-rose-400/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"><Icon name="close" className="h-4 w-4" /></button></div>)}</div>}<div className={`${profiles.length ? "mt-6 border-t border-white/8 pt-6" : "mt-6"}`}><p className="text-xs font-semibold uppercase tracking-[.14em] text-white/35">{profiles.length ? "Crear otro perfil" : "Tu nombre"}</p><form onSubmit={submit} className="mt-3 flex gap-2"><input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="Por ejemplo, Carlos" maxLength={20} className="min-w-0 flex-1 rounded-full border border-white/12 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#a99bff]" /><button type="submit" className="primary-action shrink-0 px-5">Continuar</button></form>{error && <p role="alert" className="mt-2 text-xs text-rose-300">{error}</p>}{hasLegacyRatings && <p className="mt-3 text-xs leading-5 text-[#d6ca9b]">Tus valoraciones actuales se asignarán a este primer perfil.</p>}</div><p className="mt-6 text-[11px] leading-4 text-white/28">Los perfiles no se sincronizan entre navegadores ni dispositivos.</p></section></div>;
}

function GenreIntro({ selectedGenres, onToggle, onContinue }: { selectedGenres: string[]; onToggle: (genre: string) => void; onContinue: () => void }) {
  return <section className="relative flex min-h-screen items-end overflow-hidden px-5 pb-8 pt-24 sm:items-center sm:px-8 sm:py-28 lg:px-12"><div className="absolute inset-0 bg-cover bg-[68%_center] sm:bg-center" style={{ backgroundImage: "url('/images/cinematch-hero.png')" }} /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,14,.98)_0%,rgba(5,6,14,.88)_36%,rgba(5,6,14,.18)_78%),linear-gradient(0deg,#080812_0%,transparent_42%)] sm:bg-[linear-gradient(90deg,rgba(5,6,14,.98)_4%,rgba(5,6,14,.78)_48%,rgba(5,6,14,.08)_82%)]" /><div className="relative mx-auto grid w-full max-w-[1500px] items-end gap-8 lg:grid-cols-[minmax(0,680px)_minmax(360px,470px)] lg:gap-16"><div><p className="eyebrow">Caso práctico · Sistema de recomendación</p><h1 className="mt-4 max-w-3xl text-[clamp(3.2rem,7vw,6.8rem)] font-semibold leading-[.84] tracking-[-.075em]">Encuentra tu próxima<br /><span className="font-serif font-normal italic text-[#e8c77a]">película.</span></h1><p className="mt-6 max-w-lg text-base leading-7 text-white/62 sm:text-lg">Selecciona algunos géneros y valora las películas que conozcas. Con esas notas, CineMatch calculará una lista adaptada a tu perfil.</p></div><div className="rounded-[1.5rem] border border-white/12 bg-[#121221]/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,.45)] backdrop-blur-xl sm:p-7"><div className="flex items-center justify-between"><p className="eyebrow">Paso 1 · Géneros</p><span className="text-xs tabular-nums text-white/35">{selectedGenres.length} elegidos</span></div><h2 className="mt-3 text-2xl font-semibold tracking-[-.03em]">¿Qué géneros te gustan?</h2><p className="mt-2 text-sm leading-6 text-white/50">Elige al menos dos. Los usaremos para ordenar las primeras películas.</p><div className="mt-5 flex flex-wrap gap-2.5">{genres.map((genre) => { const selected = selectedGenres.includes(genre); return <button key={genre} type="button" aria-pressed={selected} onClick={() => onToggle(genre)} className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9adff] ${selected ? "border-[#a99bff] bg-[#7161bd]/70 text-white" : "border-white/13 bg-white/[.045] text-white/62 hover:border-white/35 hover:text-white"}`}>{selected && <Icon name="check" className="h-3.5 w-3.5" />}{genre}</button>; })}</div><button type="button" disabled={selectedGenres.length < 2} onClick={onContinue} className="primary-action mt-6 w-full">Empezar a valorar <Icon name="arrow" className="h-5 w-5" /></button></div></div></section>;
}

function MotorView({ ratedCount, recommendations, diagnostics, loading, onCalculate }: { ratedCount: number; recommendations: Recommendation[]; diagnostics: Diagnostics | null; loading: boolean; onCalculate: () => void }) {
  const enoughHistory = ratedCount >= 5;
  const weights = enoughHistory
    ? [{ label: "Películas similares", value: 55, color: "#9f8cff", detail: "Comparación ítem–ítem" }, { label: "Usuarios similares", value: 35, color: "#69c7dd", detail: "Comparación usuario–usuario" }, { label: "Popularidad", value: 10, color: "#e8c77a", detail: "Mantiene una señal general" }]
    : [{ label: "Popularidad", value: 45, color: "#e8c77a", detail: "Tiene más peso con pocas notas" }, { label: "Películas similares", value: 40, color: "#9f8cff", detail: "Compara las primeras valoraciones" }, { label: "Usuarios similares", value: 15, color: "#69c7dd", detail: "Todavía hay pocos datos del perfil" }];
  return <section className="min-h-screen bg-[radial-gradient(circle_at_75%_8%,rgba(104,78,190,.16),transparent_28%),#080812] px-5 pb-20 pt-28 sm:px-8 lg:px-12">
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 border-b border-white/8 pb-10 lg:grid-cols-[1fr_360px] lg:items-end"><div><div className="flex items-center gap-3"><p className="eyebrow">Cómo funciona el modelo</p><span className="rounded-full border border-[#e8c77a]/25 bg-[#e8c77a]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#e8c77a]">Ampliación de la web</span></div><h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[.95] tracking-[-.055em] sm:text-6xl">Cómo funciona <span className="font-serif font-normal italic text-[#b9adff]">CineMatch.</span></h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">CineMatch combina tres métodos distintos: popularidad, películas similares y usuarios con gustos parecidos. Cada vez que añadimos una valoración se vuelve a calcular el ranking, dando más peso a la información del perfil cuando ya tenemos suficiente historial.</p></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[.15em] text-white/40">Estado del perfil</span><span className={`h-2 w-2 rounded-full ${enoughHistory ? "bg-emerald-400 shadow-[0_0_12px_#34d399]" : "bg-[#e8c77a]"}`} /></div><p className="mt-4 text-3xl font-semibold">{ratedCount} <span className="text-base font-normal text-white/35">películas</span></p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-[#8f7de8] to-[#e8c77a] transition-[width]" style={{ width: `${Math.min(100, ratedCount / 5 * 100)}%` }} /></div><p className="mt-3 text-xs leading-5 text-white/40">{enoughHistory ? "Con cinco o más valoraciones, las dos señales colaborativas tienen más peso que popularidad." : `Faltan ${5 - ratedCount} valoraciones para calcular el primer ranking personalizado.`}</p></div></div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_1fr]"><article className="order-2 rounded-2xl border border-white/10 bg-[#11111d] p-6 sm:p-7"><p className="eyebrow">02 · Pesos utilizados</p><h2 className="mt-3 text-2xl font-semibold">Cómo se combinan los métodos</h2><div className="mt-7 space-y-6">{weights.map((weight) => <div key={weight.label}><div className="mb-2 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold">{weight.label}</p><p className="mt-0.5 text-xs text-white/35">{weight.detail}</p></div><span className="text-xl font-semibold tabular-nums" style={{ color: weight.color }}>{weight.value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/7"><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${weight.value}%`, backgroundColor: weight.color }} /></div></div>)}</div><div className="mt-7 overflow-hidden rounded-xl border border-white/8 bg-black/15 text-[10px] sm:text-xs"><div className="grid grid-cols-[1.35fr_repeat(3,.75fr)] gap-2 border-b border-white/8 px-3 py-2.5 text-center text-white/30"><span className="text-left">Valoraciones</span><span>Popularidad</span><span>Películas</span><span>Usuarios</span></div><div className={`grid grid-cols-[1.35fr_repeat(3,.75fr)] gap-2 px-3 py-3 text-center ${!enoughHistory ? "bg-white/[.055] text-white" : "text-white/40"}`}><span className="text-left font-semibold">1–4 notas</span><span className="text-[#e8c77a]">45%</span><span className="text-[#b9adff]">40%</span><span className="text-[#69c7dd]">15%</span></div><div className={`grid grid-cols-[1.35fr_repeat(3,.75fr)] gap-2 border-t border-white/6 px-3 py-3 text-center ${enoughHistory ? "bg-white/[.055] text-white" : "text-white/40"}`}><span className="text-left font-semibold">5 o más</span><span className="text-[#e8c77a]">10%</span><span className="text-[#b9adff]">55%</span><span className="text-[#69c7dd]">35%</span></div></div><p className="mt-3 text-xs leading-5 text-white/35">La fila resaltada muestra los pesos que se están utilizando.</p></article>

        <article className="order-1 rounded-2xl border border-white/10 bg-[#11111d] p-6 sm:p-7"><p className="eyebrow">01 · Métodos del notebook</p><h2 className="mt-3 text-2xl font-semibold">Los tres métodos de recomendación</h2><div className="mt-7 grid gap-3 sm:grid-cols-3"><SignalCard number="A" title="Popularidad" text="Ordena las películas según el número de valoraciones recibidas." color="#e8c77a" /><SignalCard number="B" title="Ítem–ítem" text="Busca películas parecidas a las que el usuario ha valorado bien." color="#9f8cff" /><SignalCard number="C" title="Usuario–usuario" text="Compara el perfil con hasta 25 usuarios de MovieLens con gustos parecidos." color="#69c7dd" /></div><div className="mt-5 flex items-center gap-3 rounded-xl border border-[#a99bff]/15 bg-[#7161bd]/10 p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#8f7de8]/20 text-[#c8beff]"><Icon name="spark" className="h-4 w-4" /></span><p className="text-xs leading-5 text-white/48">El notebook estudia los tres métodos por separado. Como ampliación, la web combina sus primeros 20 resultados para construir un único ranking.</p></div></article></div>

      <article className="mt-6 rounded-2xl border border-white/10 bg-[#11111d] p-6 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">03 · Cálculo de un resultado</p><h2 className="mt-3 text-2xl font-semibold">Aporte de cada método</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-white/38">El aporte se calcula multiplicando el <strong className="text-white/60">peso del método por un factor de posición</strong>. El primer resultado recibe el factor 1,00 y el número 20 recibe 0,05.</p></div>{diagnostics && <div className="flex gap-5 text-right"><div><p className="text-lg font-semibold">{diagnostics.neighbours}</p><p className="text-[10px] uppercase tracking-wider text-white/30">Vecinos utilizados</p></div><div><p className="text-lg font-semibold">{recommendations.length}</p><p className="text-[10px] uppercase tracking-wider text-white/30">Resultados finales</p></div></div>}</div>
        {recommendations.length ? <div className="mt-7 grid gap-4 md:grid-cols-3">{recommendations.slice(0, 3).map((movie, index) => <RecommendationBreakdown key={movie.id} movie={movie} position={index + 1} />)}</div> : <div className="mt-7 rounded-xl border border-dashed border-white/12 p-8 text-center"><p className="text-sm text-white/45">{enoughHistory ? "Calcula las recomendaciones para ver aquí el aporte de cada método." : "Cuando alcances cinco valoraciones, aquí aparecerá el desglose de las primeras recomendaciones."}</p>{enoughHistory && <button type="button" onClick={onCalculate} disabled={loading} className="primary-action mt-5">{loading ? "Calculando…" : "Calcular recomendaciones"}</button>}</div>}
      </article>

      <div className="mt-6 grid gap-6 lg:grid-cols-2"><article className="rounded-2xl border border-white/10 bg-white/[.025] p-6"><p className="eyebrow">Qué ocurre al puntuar</p><ol className="mt-5 space-y-4">{["La nota se guarda en el perfil local y la película queda fuera de los candidatos.", "Tras 450 ms, el servidor recalcula similitudes con el historial actualizado.", "Los tres rankings se vuelven a ponderar y las tarjetas cambian de orden."].map((step, index) => <li key={step} className="flex gap-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#a99bff]/25 text-xs text-[#c8beff]">{index + 1}</span><p className="text-sm leading-6 text-white/50">{step}</p></li>)}</ol></article><article className="rounded-2xl border border-white/10 bg-white/[.025] p-6"><p className="eyebrow">Por qué una película queda fuera</p><ul className="mt-5 space-y-3 text-sm leading-6 text-white/50"><li>— Ya la has valorado: el motor la excluye.</li><li>— No alcanza evidencia mínima: 40 notas para popularidad o 15 para afinidad entre películas.</li><li>— No recibe apoyo suficiente de usuarios similares o queda fuera de los 20 primeros candidatos de cada señal.</li><li>— Su puntuación combinada no entra entre los 40 resultados finales.</li></ul></article></div>
    </div>
  </section>;
}

function SignalCard({ number, title, text, color }: { number: string; title: string; text: string; color: string }) {
  return <div className="rounded-xl border border-white/8 bg-white/[.03] p-4"><span className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-[#0b0b14]" style={{ backgroundColor: color }}>{number}</span><h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-white/38">{text}</p></div>;
}

function RecommendationBreakdown({ movie, position }: { movie: Recommendation; position: number }) {
  const rows: Array<{ key: "popular" | "item" | "users"; label: string; color: string }> = [{ key: "popular", label: "Popularidad", color: "#e8c77a" }, { key: "item", label: "Películas", color: "#9f8cff" }, { key: "users", label: "Usuarios", color: "#69c7dd" }];
  const contributions = rows.map(({ key }) => movie.signalDetails?.[key]?.contribution ?? movie.signals?.[key] ?? 0);
  return <div className="rounded-xl border border-white/8 bg-black/15 p-5"><div className="flex items-start gap-3"><span className="text-2xl font-semibold text-white/20">0{position}</span><div><h3 className="line-clamp-2 font-semibold leading-5">{cleanTitle(movie.title)}</h3><p className="mt-1 text-[11px] text-[#c8beff]">{movie.reason}</p></div></div><div className="mt-5 overflow-hidden rounded-lg border border-white/8">{rows.map((row) => { const detail = movie.signalDetails?.[row.key]; const contribution = detail?.contribution ?? movie.signals?.[row.key] ?? 0; return <div key={row.key} className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/6 px-3 py-2.5 last:border-0"><div><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: row.color }} /><span className="text-xs font-semibold">{row.label}</span></div><p className="mt-1 pl-3.5 text-[10px] text-white/30">{detail ? `puesto ${detail.rank} de 20` : "fuera del top 20"}</p></div><div className="text-right"><p className="font-mono text-[11px] text-white/50">{detail ? `${detail.weight.toFixed(2)} × ${detail.rankFactor.toFixed(2)}` : "—"}</p><p className="mt-1 font-mono text-xs font-semibold" style={{ color: row.color }}>= {contribution.toFixed(3)}</p></div></div>; })}</div><div className="mt-4 rounded-lg bg-white/[.035] p-3"><p className="text-[10px] uppercase tracking-wider text-white/30">Suma final</p><p className="mt-1 font-mono text-xs text-white/55">{contributions.map((value) => value.toFixed(3)).join(" + ")} <span className="text-white/25">=</span> <strong className="text-sm text-white">{movie.score.toFixed(3)}</strong></p></div></div>;
}

function RecommendationsView({ recommendations, catalog, ratings, loading, error, onRefresh, onOpen, onRate }: { recommendations: Recommendation[]; catalog: Record<number, CatalogMovie>; ratings: Record<number, number>; loading: boolean; error: string; onRefresh: () => void; onOpen: (movie: Recommendation) => void; onRate: (id: number, value: number) => void }) {
  const hero = recommendations[0];
  const heroMetadata = hero ? catalog[hero.id] : undefined;
  const heroView = hero ? { id: hero.id, title: cleanTitle(hero.title), genre: heroMetadata?.genres.join(" · ") || "Primera recomendación", blurb: heroMetadata?.overview || "Este título ocupa la primera posición del ranking calculado para tu perfil.", tint: fallbackTints[hero.id % fallbackTints.length], reason: hero.reason, communityRating: hero.rating, count: hero.count } : null;
  return <><section className="relative min-h-[620px] overflow-hidden px-5 pb-14 pt-28 sm:px-8 lg:px-12">{heroView && <>{heroMetadata?.backdropUrl ? <div className="absolute inset-0 sm:left-[30%]"><Image src={heroMetadata.backdropUrl} alt="" fill sizes="(max-width: 640px) 100vw, 70vw" priority className="object-cover object-center" /></div> : <div className="absolute right-[-10%] top-1/2 aspect-[2/3] w-[72vw] max-w-[330px] -translate-y-1/2 overflow-hidden rounded-[1.5rem] border border-white/10 opacity-35 shadow-[0_30px_90px_rgba(0,0,0,.55)] sm:right-[7%] sm:w-[min(30vw,360px)] sm:opacity-90"><Poster movie={heroView} metadata={heroMetadata} sizes="(max-width: 640px) 72vw, 360px" priority /></div>}<div className="absolute inset-0 bg-[linear-gradient(90deg,#080812_4%,rgba(8,8,18,.94)_34%,rgba(8,8,18,.12)_78%),linear-gradient(0deg,#080812_0%,transparent_50%)]" /></>}<div className="relative mx-auto flex min-h-[470px] max-w-[1500px] items-end"><div className="max-w-2xl"><p className="eyebrow">Primera recomendación</p><h1 className="mt-4 text-5xl font-semibold leading-[.9] tracking-[-.065em] sm:text-7xl">{heroView?.title || "Recomendaciones calculadas"}</h1>{hero && <div className="mt-5 flex flex-wrap items-center gap-3 text-xs"><span className="reason-badge"><Icon name="spark" className="h-3.5 w-3.5" />{hero.reason}</span><span className="text-white/45">★ {hero.rating} · {hero.count} valoraciones</span></div>}<p className="mt-5 line-clamp-3 max-w-xl text-sm leading-6 text-white/62 sm:text-base sm:leading-7">{heroView?.blurb}</p><div className="mt-7 flex flex-wrap gap-3">{hero && <button type="button" onClick={() => onOpen(hero)} className="primary-action px-6"><Icon name="info" className="h-5 w-5" /> Ver ficha</button>}<button type="button" onClick={onRefresh} disabled={loading} className="secondary-action px-5">{loading ? "Recalculando…" : "Volver a calcular"}</button></div>{error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}</div></div></section><section className="relative z-10 mx-auto -mt-2 max-w-[1500px] space-y-12 px-5 pb-20 sm:px-8 lg:px-12"><RecommendationRow title="Ranking combinado" subtitle="Resultado de combinar popularidad, películas similares y usuarios similares" films={recommendations.slice(0, 16)} catalog={catalog} loading={loading} onOpen={onOpen} /><RecommendationRow title="Otras recomendaciones" subtitle="Siguientes películas del ranking calculado para tu perfil" films={recommendations.slice(10, 28)} catalog={catalog} loading={loading} onOpen={onOpen} /><div className="border-t border-white/8 pt-10"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="eyebrow">Seguir ajustando el perfil</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">Valora más películas</h2><p className="mt-1 text-sm text-white/45">Cada nueva nota vuelve a calcular el orden de las recomendaciones.</p></div>{loading && <span className="hidden text-xs text-[#c1b6ff] sm:block">Recalculando…</span>}</div><div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 rail-scroll">{films.slice(0, 14).map((film) => <CompactFilmCard key={film.id} film={film} metadata={catalog[film.id]} rating={ratings[film.id]} onOpen={() => onOpen({ id: film.id, title: film.title, rating: 0, count: 0, score: 0, reason: "Esta valoración se añadirá a tu perfil", reasonType: "item" })} onRate={(value) => onRate(film.id, value)} />)}</div></div></section></>;
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

function RatingConfirmation({ title, rating }: { title: string; rating: number }) {
  return <div className="pointer-events-none fixed inset-0 z-[55] grid place-items-center bg-[#05050c]/32 p-5 backdrop-blur-[2px]" role="status" aria-live="polite"><div className="reward-confirmation w-full max-w-xl text-center"><div className="relative mx-auto flex min-h-32 items-center justify-center"><span className="absolute h-24 w-64 rounded-full bg-[#e8c77a]/10 blur-3xl" /><span className="reward-spark absolute left-[12%] top-2 text-xl text-[#e8c77a]" style={{ animationDelay: "40ms" }}>✦</span><span className="reward-spark absolute right-[14%] top-5 text-base text-[#b9adff]" style={{ animationDelay: "120ms" }}>✦</span><span className="reward-spark absolute bottom-3 right-[8%] text-2xl text-[#e8c77a]" style={{ animationDelay: "200ms" }}>✦</span><span className="reward-spark absolute bottom-0 left-[16%] text-sm text-[#b9adff]" style={{ animationDelay: "260ms" }}>✦</span><div className="relative flex justify-center gap-2">{Array.from({ length: rating }, (_, index) => <Icon key={index} name="star" className="reward-star h-10 w-10 text-[#e8c77a] drop-shadow-[0_0_16px_rgba(232,199,122,.55)] sm:h-12 sm:w-12" />)}</div></div><p className="eyebrow mt-2">Tu valoración</p><h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.045em] sm:text-4xl">{title}</h2><p className="mt-3 text-sm font-semibold text-[#e8c77a]">{rating} de 5 · Guardada</p></div></div>;
}

function MovieModal({ movie, metadata, rating, onRate, onClose }: { movie: MovieView; metadata?: CatalogMovie; rating?: number; onRate: (value: number) => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:grid sm:place-items-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><article role="dialog" aria-modal="true" aria-labelledby="movie-title" className="relative mx-auto my-4 grid max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/13 bg-[#11111d] shadow-[0_30px_100px_rgba(0,0,0,.65)] sm:my-0 sm:h-[min(620px,calc(100vh-3rem))] sm:grid-cols-[260px_1fr] sm:overflow-hidden"><div className="relative min-h-[260px] sm:min-h-0"><Poster movie={movie} metadata={metadata} sizes="(max-width: 640px) 100vw, 260px" priority /><div className="absolute inset-0 bg-gradient-to-t from-[#11111d] via-transparent to-black/15 sm:bg-gradient-to-r sm:from-transparent sm:to-[#11111d]/25" /></div><div className="relative flex flex-col p-5 sm:overflow-y-auto sm:p-7 lg:p-8"><button type="button" onClick={onClose} aria-label="Cerrar ficha" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-black/25 text-white/65 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9adff]"><Icon name="close" /></button><p className="eyebrow pr-12">{metadata?.year || "CineMatch"} {metadata?.genres.length ? `· ${metadata.genres.join(" · ")}` : `· ${movie.genre}`}</p><h2 id="movie-title" className="mt-3 text-3xl font-semibold leading-[.95] tracking-[-.05em] sm:text-4xl">{movie.title}</h2>{movie.reason && <div className="mt-4"><span className="reason-badge"><Icon name="spark" className="h-3.5 w-3.5" />{movie.reason}</span></div>}<p className="mt-4 text-sm leading-6 text-white/65">{metadata?.overview || movie.blurb}</p>{(movie.communityRating || movie.count) && <div className="mt-5 flex gap-6 border-y border-white/8 py-3"><div><p className="text-lg font-semibold text-[#e8c77a]">★ {movie.communityRating}</p><p className="mt-1 text-[10px] uppercase tracking-[.14em] text-white/35">Nota comunidad</p></div><div><p className="text-lg font-semibold">{movie.count}</p><p className="mt-1 text-[10px] uppercase tracking-[.14em] text-white/35">Valoraciones</p></div></div>}<div className="mt-5"><p className="text-xs font-semibold uppercase tracking-[.16em] text-white/45">Tu valoración</p><div className="mt-1"><RatingStars value={rating} onRate={onRate} large /></div><p className="mt-1 text-xs text-white/35">La nota se guarda en este dispositivo y se utiliza al volver a calcular el ranking.</p></div><div className="mt-5 rounded-xl border border-[#a99bff]/15 bg-[#8f7de8]/[.07] p-3.5"><div className="flex gap-3"><Icon name="spark" className="mt-0.5 h-4 w-4 shrink-0 text-[#b9adff]" /><div><p className="text-xs font-semibold text-[#d5cdff]">Motivo de la recomendación</p><p className="mt-1 text-xs leading-5 text-white/45">{movie.reason || "Esta película forma parte de la selección inicial y su valoración se añadirá al perfil."}</p></div></div></div></div></article></div>;
}
