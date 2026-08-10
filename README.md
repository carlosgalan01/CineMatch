# CineMatch

CineMatch es la demostración web del caso práctico **Motores de recomendación de películas**. El trabajo principal está desarrollado en el notebook y utiliza las 100.003 valoraciones de MovieLens para comparar tres métodos:

- Recomendación por popularidad.
- Filtrado colaborativo basado en usuarios.
- Filtrado colaborativo basado en ítems.

La web lleva estas ideas a una aplicación sencilla en la que podemos crear perfiles, valorar películas y obtener recomendaciones. Como ampliación, combina los tres rankings mediante pesos dinámicos: con poco historial se apoya más en popularidad y, a partir de cinco valoraciones, da más importancia a películas y usuarios similares.

## Archivos de la entrega

- [`Caso_Practico_RS_Carlos_Galan.ipynb`](notebooks/Caso_Practico_RS_Carlos_Galan.ipynb): desarrollo principal del caso práctico.
- [`Informe_Caso_Practico_RS_Carlos_Galan.docx`](notebooks/Informe_Caso_Practico_RS_Carlos_Galan.docx): informe breve con el planteamiento, los resultados y la comparación de los métodos.
- [`Informe_Caso_Practico_RS_Carlos_Galan.md`](notebooks/Informe_Caso_Practico_RS_Carlos_Galan.md): versión editable del informe.
- [`src/app/page.tsx`](src/app/page.tsx): interfaz de CineMatch.
- [`src/app/api/recommend/route.ts`](src/app/api/recommend/route.ts): motor utilizado por la web.

## Ejecutar CineMatch

El proyecto necesita Node.js 20.9 o superior. Después de descargarlo:

```bash
npm install
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

Los pósteres y las sinopsis proceden de TMDB. Para mostrarlos en local hay que crear un archivo `.env.local` a partir de `.env.example` y añadir un token de lectura:

```env
TMDB_API_TOKEN=tu_token_de_lectura_de_tmdb
```

Sin este token el recomendador sigue funcionando, pero utiliza fondos alternativos y no carga los metadatos de TMDB.

La versión desplegada puede consultarse en [CineMatch en Vercel](https://cine-match-primera-version-2026-08.vercel.app/).
