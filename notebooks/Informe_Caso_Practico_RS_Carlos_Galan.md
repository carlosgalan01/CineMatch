# Caso Práctico 1: Motor de recomendación de películas

## Objetivo y preparación de los datos

El objetivo de este caso práctico es construir y comparar tres sistemas de recomendación: uno basado en popularidad, otro basado en usuarios similares y otro basado en películas similares. Para ello utilizamos los ficheros `file.tsv` y `Movie_Id_Titles.csv`, que contienen las valoraciones de MovieLens y la relación entre los identificadores y los títulos de las películas.

En primer lugar cargamos ambos ficheros con `pandas`, eliminamos la fecha porque no interviene en ninguno de los métodos y unimos las tablas. El resultado contiene 100.003 valoraciones de 944 usuarios. Después construimos una matriz usuario-película de 944 × 1.664. Aproximadamente el 93,65 % de sus celdas están vacías, algo lógico porque ningún usuario ha visto todo el catálogo. Hemos mantenido esos huecos como valores desconocidos: rellenarlos con cero habría sido equivalente a considerar que una película no vista tiene la peor nota.

## Métodos implementados

El primer recomendador ordena las películas por número de valoraciones. Es el método más sencillo y coloca *Star Wars (1977)* en primera posición. Su principal ventaja es que funciona desde la primera visita, cuando todavía no conocemos al usuario. El problema es bastante evidente: todo el mundo recibe la misma lista y los títulos menos conocidos apenas tienen posibilidades de aparecer.

Para el filtrado colaborativo basado en usuarios hemos comparado Pearson y coseno. Explicado de forma sencilla, Pearson se fija en si dos usuarios siguen un patrón parecido aunque uno puntúe normalmente más alto que otro. El coseno comprueba si sus valoraciones apuntan en una dirección similar y suele funcionar bien cuando hay muchos huecos en la matriz. En ambos casos exigimos al menos 20 películas en común para que la comparación tenga una base suficiente.

Para generar las recomendaciones finales hemos elegido coseno. No quiere decir que sea siempre mejor que Pearson, pero encaja bien con un dataset tan disperso y nos permite mantener el mismo criterio en el notebook y en CineMatch. Después seleccionamos los 20 vecinos más cercanos y calculamos las recomendaciones mediante una media ponderada por su similitud.

El tercer enfoque compara películas. Usamos también coseno, pero esta vez transponemos la matriz y exigimos al menos 50 usuarios en común. Partimos de los títulos que el usuario ha valorado con 4 o 5 y, para cada candidata, conservamos la relación más fuerte encontrada. La tabla y la gráfica se ordenan por esa similitud, mientras que la columna `porque` muestra la película del historial que la ha provocado. He preferido mantener este método sencillo porque permite entender directamente de dónde sale cada recomendación.

## Comparación de los resultados

Los tres métodos sirven para situaciones diferentes. Popularidad es útil cuando todavía no tenemos ninguna valoración, pero devuelve prácticamente la misma lista a todos los usuarios. El filtrado usuario-usuario ya tiene en cuenta el historial, aunque necesita suficientes coincidencias para encontrar vecinos fiables. El filtrado ítem-ítem también personaliza y, además, permite explicar cada resultado a partir de una película que el usuario ya conoce. Su principal limitación es que los títulos con pocas valoraciones tienen más dificultades para aparecer.

Las gráficas del notebook permiten comparar las películas generadas por cada sistema. No debemos interpretar sus valores como si estuvieran en la misma escala: el primer gráfico relaciona número de votos y nota media, el segundo muestra una valoración estimada y el tercero representa la similitud coseno con la película favorita más relacionada.

## CineMatch como ampliación visual

Como parte adicional he desarrollado CineMatch, una web que permite crear un perfil, valorar películas y ver cómo cambian las recomendaciones. La aplicación parte de las mismas tres ideas del notebook —popularidad, usuarios similares e ítems similares—, pero las adapta a un escenario interactivo.

En la web un perfil puede empezar con solo cinco valoraciones, por lo que no tendría sentido exigir las 20 coincidencias utilizadas en el análisis académico. La versión online usa también similitud coseno, pero con umbrales menos restrictivos. En el filtro ítem–ítem no conserva solo la mejor relación: utiliza todas las valoraciones del perfil y calcula para cada candidata una media ponderada por sus similitudes. Así obtiene una valoración estimada entre 1 y 5. Después combina este ranking con usuarios similares y popularidad mediante pesos dinámicos. La web añade también perfiles locales, explicaciones de cada recomendación y metadatos de TMDB.

Esta capa híbrida no sustituye el ejercicio. El notebook contiene por separado los tres filtros solicitados y la web enseña cómo podríamos combinarlos si quisiéramos llevar la misma idea a una aplicación real.

## Conclusión

Con este caso podemos ver el paso desde una recomendación general hasta una personalizada. Si tuviera que escoger un único método colaborativo para este dataset, me quedaría con el basado en ítems porque es estable y podemos justificar fácilmente de dónde sale cada resultado. En una plataforma real usaría popularidad para los perfiles nuevos y combinaría después varias señales, que es precisamente lo que he intentado representar con CineMatch.
