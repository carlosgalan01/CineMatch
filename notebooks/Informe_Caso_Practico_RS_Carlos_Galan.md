# Caso Práctico 1: Motor de recomendación de películas

## Objetivo y preparación de los datos

El objetivo de este caso práctico es construir y comparar tres sistemas de recomendación: uno basado en popularidad, otro basado en usuarios similares y otro basado en películas similares. Para ello utilizamos los ficheros `file.tsv` y `Movie_Id_Titles.csv`, que contienen las valoraciones de MovieLens y la relación entre los identificadores y los títulos de las películas.

En primer lugar cargamos ambos ficheros con `pandas`, eliminamos la fecha porque no interviene en ninguno de los métodos y unimos las tablas. El resultado contiene 100.003 valoraciones de 944 usuarios. Después construimos una matriz usuario-película de 944 × 1.664. Aproximadamente el 93,65 % de sus celdas están vacías, algo lógico porque ningún usuario ha visto todo el catálogo. Hemos mantenido esos huecos como valores desconocidos: rellenarlos con cero habría sido equivalente a considerar que una película no vista tiene la peor nota.

## Métodos implementados

El primer recomendador ordena las películas por número de valoraciones. Es el método más sencillo y coloca *Star Wars (1977)* en primera posición. Su principal ventaja es que funciona desde la primera visita, cuando todavía no conocemos al usuario. El problema es bastante evidente: todo el mundo recibe la misma lista y los títulos menos conocidos apenas tienen posibilidades de aparecer.

Para el filtrado colaborativo basado en usuarios usamos correlación de Pearson. Calculamos la similitud entre el usuario 196 y el resto, exigiendo al menos 20 películas en común para evitar correlaciones poco fiables. Nos quedamos con los 20 vecinos más parecidos y estimamos cada valoración mediante una media ponderada por la correlación. En la ejecución obtenemos diez recomendaciones y *High Noon (1952)* aparece en primer lugar. Este método ya personaliza, aunque depende de encontrar personas con suficiente historial compartido.

El tercer enfoque compara películas. Volvemos a utilizar Pearson, pero esta vez transponemos la matriz y exigimos al menos 50 usuarios en común. Partimos de los títulos que el usuario ha valorado con 4 o 5, buscamos películas similares y ponderamos el resultado por su nota. La primera recomendación para el usuario de ejemplo es *Swingers (1996)*. Además, guardamos qué película del historial ha aportado más a cada resultado. Personalmente, esta explicación tipo “te recomendamos esto porque te gustó aquello” me parece una de las mayores ventajas del método.

## Comparación de los resultados

Los tres métodos sirven para situaciones diferentes. Popularidad es útil cuando todavía no tenemos ninguna valoración, pero devuelve prácticamente la misma lista a todos los usuarios. El filtrado usuario-usuario ya tiene en cuenta el historial, aunque necesita suficientes coincidencias para encontrar vecinos fiables. El filtrado ítem-ítem también personaliza y, además, permite explicar cada resultado a partir de una película que el usuario ya conoce. Su principal limitación es que los títulos con pocas valoraciones tienen más dificultades para aparecer.

Las gráficas del notebook permiten comparar las películas generadas por cada sistema. Aun así, no debemos interpretar sus puntuaciones como si estuvieran en la misma escala: el primer gráfico representa número de votos, el segundo una valoración estimada y el tercero un score calculado a partir de similitudes.

## CineMatch como ampliación visual

Como parte adicional he desarrollado CineMatch, una web que permite crear un perfil, valorar películas y ver cómo cambian las recomendaciones. La aplicación parte de las mismas tres ideas del notebook —popularidad, usuarios similares e ítems similares—, pero las adapta a un escenario interactivo.

En la web un perfil puede empezar con solo cinco valoraciones, por lo que no tendría sentido exigir las 20 coincidencias utilizadas en el análisis académico. Por eso la versión online usa similitud coseno y umbrales menos restrictivos. Después combina los tres rankings con pesos dinámicos: durante el arranque da más importancia a popularidad y, cuando existe más historial, aumenta el peso de las dos señales colaborativas. La web añade también perfiles locales, explicaciones de cada recomendación y metadatos de TMDB.

Esta capa híbrida no sustituye el ejercicio. El notebook contiene por separado los tres filtros solicitados y la web enseña cómo podríamos combinarlos si quisiéramos llevar la misma idea a una aplicación real.

## Conclusión

Con este caso podemos ver el paso desde una recomendación general hasta una personalizada. Si tuviera que escoger un único método colaborativo para este dataset, me quedaría con el basado en ítems porque es estable y podemos justificar fácilmente de dónde sale cada resultado. En una plataforma real usaría popularidad para los perfiles nuevos y combinaría después varias señales, que es precisamente lo que he intentado representar con CineMatch.
