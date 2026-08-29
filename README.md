# CineMatch

CineMatch es mi caso práctico de sistemas de recomendación de películas. La parte principal del trabajo está en el notebook, donde utilizo las 100.003 valoraciones de MovieLens para comparar tres métodos:

- Recomendación basada en popularidad.
- Filtrado colaborativo usuario–usuario.
- Filtrado colaborativo ítem–ítem.

Como ampliación he desarrollado una web para enseñar estos métodos de una forma más visual. La aplicación permite crear perfiles locales, valorar películas y obtener un ranking que combina popularidad, películas similares y usuarios con gustos parecidos. Los perfiles se guardan únicamente en el navegador y no se sincronizan entre dispositivos.

La versión actual añade también un modo independiente de películas similares. Podemos buscar un título sin crear un perfil y obtener las películas con el patrón de valoraciones más cercano, calculado mediante similitud del coseno. Esta parte sirve como demostración interactiva del Proyecto de Aplicación.

## Enlaces de la entrega

- [Informe en PDF](notebooks/Informe_Caso_Practico_RS_Carlos_Galan.pdf)
- [Notebook del Caso Práctico 1](https://colab.research.google.com/github/carlosgalan01/CineMatch/blob/main/notebooks/Caso_Practico_RS_Carlos_Galan.ipynb)
- [Notebook del Proyecto de Aplicación](https://colab.research.google.com/github/carlosgalan01/CineMatch/blob/main/notebooks/Proyecto_Aplicacion_RS_Carlos_Galan.ipynb)
- [Probar CineMatch](https://cine-match-primera-version-2026-08.vercel.app/)

El notebook del primer caso estudia los tres métodos por separado. La web mantiene ese motor combinado y añade una segunda forma de explorar el catálogo: partir de una película concreta y buscar sus vecinas mediante filtrado colaborativo ítem–ítem.

## Ejecutar la web en local (opcional)

Esta parte no es necesaria para revisar la entrega. La dejo únicamente por si alguien quiere descargar y probar el proyecto en su ordenador.

Se necesita Node.js 20.9 o superior:

```bash
npm install
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

Para cargar los carteles, las sinopsis y los géneros hay que copiar `.env.example` como `.env.local` y añadir un token de lectura de TMDB:

```env
TMDB_API_TOKEN=tu_token_de_lectura_de_tmdb
```

Sin ese token el motor de recomendación sigue funcionando, pero la web no puede cargar los metadatos de TMDB.
