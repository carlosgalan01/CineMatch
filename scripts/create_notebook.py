import json
from pathlib import Path


OUT = Path(__file__).resolve().parents[1] / "notebooks" / "Caso_Practico_RS_Carlos_Galan.ipynb"


def md(text):
    return {"cell_type": "markdown", "metadata": {}, "source": [text]}


def code(text):
    return {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": [text]}


cells = [
md("""# Caso Práctico 1: Motor de recomendación de películas

En este caso práctico vamos a construir tres sistemas de recomendación utilizando las valoraciones de MovieLens.

Primero veremos qué películas son las más populares. Después haremos filtrado colaborativo de dos formas: buscando usuarios con gustos parecidos y buscando películas que suelen recibir valoraciones similares. La idea es comparar los tres métodos y entender en qué situación tiene más sentido utilizar cada uno.
"""),
md("""## 1. Imports, carga y exploración de los datos

Para este ejercicio no necesitamos demasiadas librerías. Usaremos `pandas` para preparar los datos y calcular las recomendaciones, y `matplotlib` para representar los resultados.

Al ejecutar la siguiente celda seleccionamos a la vez `file.tsv` y `Movie_Id_Titles.csv`. Me parece más cómodo subir directamente los dos ficheros que tener que preparar antes un ZIP con una estructura concreta.
"""),
code("""import pandas as pd
import matplotlib.pyplot as plt
from google.colab import files

# Subimos directamente los dos ficheros que nos dan para el ejercicio.
files.upload()

valoraciones = pd.read_csv(
    'file.tsv',
    sep='\\t',
    names=['usuario_id', 'pelicula_id', 'rating', 'timestamp']
)
peliculas = pd.read_csv('Movie_Id_Titles.csv')

# Unimos valoraciones y títulos. La fecha no aporta nada a estos filtros.
datos = (valoraciones.drop(columns='timestamp')
         .merge(peliculas, left_on='pelicula_id', right_on='item_id', how='left')
         .drop(columns='item_id'))

print(f'Valoraciones: {len(datos):,}')
print(f'Usuarios: {datos.usuario_id.nunique():,}')
print(f'Películas: {datos.pelicula_id.nunique():,}')
print(f'Valores nulos: {datos.isna().sum().sum()}')
datos.head()
"""),
md("""El dataset contiene el identificador del usuario, la película y una puntuación de 1 a 5. No tenemos información sobre género, edad o tipo de película, así que las recomendaciones dependerán únicamente de las valoraciones.

Esto también significa que una celda vacía no equivale a una mala nota: simplemente no sabemos si ese usuario ha visto la película.
"""),
md("""## 2. Recomendación basada en popularidad

Empezamos por el método más sencillo. Consideraremos más popular la película que haya recibido más valoraciones, tal y como pide el enunciado.

También mostraremos la nota media para tener algo de contexto, pero no la utilizaremos para ordenar. Una película con muchos votos no tiene por qué ser la mejor valorada; simplemente es la que más usuarios han puntuado.
"""),
code("""popularidad = (datos.groupby(['pelicula_id', 'title']).rating
               .agg(num_valoraciones='count', nota_media='mean')
               .sort_values('num_valoraciones', ascending=False))

top_populares = popularidad.head(10)
display(top_populares)

mostrar = top_populares.sort_values('num_valoraciones')
plt.figure(figsize=(10, 6))
plt.barh(mostrar.index.get_level_values('title'), mostrar.num_valoraciones, color='#315B7D')
plt.title('Películas más populares')
plt.xlabel('Número de valoraciones')
plt.tight_layout()
plt.show()
"""),
md("""Este método funciona bien para un usuario nuevo porque no necesita saber nada sobre él. El problema es que devuelve prácticamente la misma lista para todo el mundo y favorece siempre a las películas más conocidas.
"""),
md("""## 3. Matriz usuario-película

Para los dos filtros colaborativos necesitamos convertir los datos en una matriz. Cada fila representa a un usuario, cada columna una película y cada celda contiene la valoración.

Vamos a mantener los valores vacíos como `NaN`. Rellenarlos con cero sería asumir que el usuario ha visto la película y le ha puesto la peor nota, y eso cambiaría completamente el significado de los datos.
"""),
code("""matriz_usuario_pelicula = datos.pivot_table(
    index='usuario_id',
    columns='title',
    values='rating'
)

porcentaje_vacio = matriz_usuario_pelicula.isna().mean().mean()
print('Dimensiones:', matriz_usuario_pelicula.shape)
print(f'Porcentaje sin valorar: {porcentaje_vacio:.2%}')
matriz_usuario_pelicula.iloc[:5, :8]
"""),
md("""## 4. Filtrado colaborativo basado en usuarios

En este caso buscamos usuarios que hayan puntuado de forma parecida. Usaremos correlación de Pearson porque está contemplada en el enunciado y `pandas` permite calcularla directamente.

La correlación se calcula solo sobre películas que ambos usuarios hayan valorado. Además, exigimos un mínimo de 20 coincidencias para no decidir que dos personas se parecen porque han puntuado igual una o dos películas. Nos quedaremos con los 20 vecinos más cercanos y combinaremos sus notas mediante una media ponderada.
"""),
code("""def recomendar_por_usuarios(usuario_id, top_n=10, minimo_comun=20):
    objetivo = matriz_usuario_pelicula.loc[usuario_id]

    # Buscamos correlaciones positivas y eliminamos al propio usuario.
    similitudes = (matriz_usuario_pelicula
                   .corrwith(objetivo, axis=1, min_periods=minimo_comun)
                   .drop(index=usuario_id, errors='ignore')
                   .dropna())
    vecinos = similitudes[similitudes > 0].sort_values(ascending=False).head(20)

    predicciones = []
    for titulo in objetivo[objetivo.isna()].index:
        notas = matriz_usuario_pelicula.loc[vecinos.index, titulo].dropna()
        pesos = vecinos.loc[notas.index]
        if len(notas) >= 2 and pesos.sum() > 0:
            predicciones.append({
                'title': titulo,
                'prediccion': (notas * pesos).sum() / pesos.sum(),
                'vecinos_que_la_valoran': len(notas)
            })

    return (pd.DataFrame(predicciones)
            .sort_values(['prediccion', 'vecinos_que_la_valoran'], ascending=False)
            .head(top_n)), vecinos

USUARIO_EJEMPLO = 196
recomendaciones_usuario, vecinos = recomendar_por_usuarios(USUARIO_EJEMPLO)

print(f'Vecinos utilizados: {len(vecinos)}')
display(recomendaciones_usuario)

mostrar = recomendaciones_usuario.sort_values('prediccion')
plt.figure(figsize=(10, 6))
plt.barh(mostrar.title, mostrar.prediccion, color='#D07A93')
plt.title(f'Recomendaciones para el usuario {USUARIO_EJEMPLO} basadas en usuarios similares')
plt.xlabel('Valoración estimada')
plt.xlim(0, 5)
plt.tight_layout()
plt.show()
"""),
md("""Ahora sí obtenemos una lista personalizada. Dos usuarios pueden recibir resultados diferentes porque sus vecinos también serán diferentes.

La principal limitación es que necesitamos suficientes películas en común para calcular una correlación fiable. Si el usuario acaba de llegar o tiene gustos muy poco habituales, puede que no encontremos vecinos útiles.
"""),
md("""## 5. Filtrado colaborativo basado en ítems

El tercer método compara películas en lugar de personas. La lógica es sencilla: si dos películas suelen recibir notas parecidas de los mismos usuarios, consideramos que están relacionadas.

Volvemos a usar Pearson y exigimos al menos 50 valoraciones comunes. Para construir la lista personalizada partimos de las películas que el usuario ha puntuado con 4 o 5 y buscamos títulos similares. Personalmente, este método me parece más fácil de explicar porque podemos decir directamente qué película del historial ha provocado cada recomendación.
"""),
code("""matriz_pelicula_usuario = matriz_usuario_pelicula.T

def peliculas_similares(titulo, top_n=100, minimo_comun=50):
    objetivo = matriz_pelicula_usuario.loc[titulo]
    similitudes = (matriz_pelicula_usuario
                   .corrwith(objetivo, axis=1, min_periods=minimo_comun)
                   .drop(index=titulo, errors='ignore')
                   .dropna())
    return similitudes[similitudes > 0].sort_values(ascending=False).head(top_n)

def recomendar_por_items(usuario_id, top_n=10):
    historial = matriz_usuario_pelicula.loc[usuario_id].dropna()
    favoritas = historial[historial >= 4]
    candidatos = {}

    # Cada película favorita aporta candidatos según su similitud.
    for titulo, rating in favoritas.items():
        for candidata, similitud in peliculas_similares(titulo).items():
            if candidata in historial.index:
                continue
            fila = candidatos.setdefault(
                candidata,
                {'suma': 0, 'peso': 0, 'porque': titulo, 'mejor_aporte': 0}
            )
            aporte = similitud * rating
            fila['suma'] += aporte
            fila['peso'] += similitud
            if aporte > fila['mejor_aporte']:
                fila['porque'] = titulo
                fila['mejor_aporte'] = aporte

    recomendaciones = [
        {
            'title': titulo,
            'score_item_item': fila['suma'] / fila['peso'],
            'porque': fila['porque']
        }
        for titulo, fila in candidatos.items()
        if fila['peso'] > 0
    ]
    return (pd.DataFrame(recomendaciones)
            .sort_values('score_item_item', ascending=False)
            .head(top_n))

recomendaciones_items = recomendar_por_items(USUARIO_EJEMPLO)
display(recomendaciones_items)

mostrar = recomendaciones_items.sort_values('score_item_item')
plt.figure(figsize=(10, 6))
plt.barh(mostrar.title, mostrar.score_item_item, color='#856084')
plt.title(f'Recomendaciones para el usuario {USUARIO_EJEMPLO} basadas en películas similares')
plt.xlabel('Score ítem-ítem')
plt.xlim(0, 5)
plt.tight_layout()
plt.show()
"""),
md("""La columna `porque` hace que el resultado sea bastante transparente: podemos ver qué película ya valorada ha tenido más influencia en cada sugerencia.

Este enfoque suele ser más estable que comparar usuarios, pero sigue dependiendo de que existan suficientes valoraciones comunes entre las películas. Los títulos menos conocidos van a tener más dificultades para aparecer.
"""),
md("""## 6. Comparación de los resultados

No existe un método que sea siempre mejor. Cada uno resuelve una parte distinta del problema, así que vamos a resumir qué hemos obtenido y dónde falla cada enfoque.
"""),
code("""comparacion = pd.DataFrame({
    'Método': ['Popularidad', 'Usuarios similares', 'Ítems similares'],
    '¿Personaliza?': ['No', 'Sí', 'Sí'],
    'Necesita historial': ['No', 'Sí, y coincidencias con otros usuarios', 'Sí, y películas con suficientes votos'],
    'Punto fuerte': [
        'Funciona desde la primera visita',
        'Aprovecha gustos de personas parecidas',
        'Es estable y permite explicar el motivo'
    ],
    'Limitación principal': [
        'Recomienda lo mismo a todo el mundo',
        'Sufre cuando hay pocas valoraciones comunes',
        'Favorece películas con bastante historial'
    ]
})

comparacion
"""),
md("""## 7. Conclusiones

En este caso práctico hemos implementado los tres métodos que pedía el enunciado utilizando `pandas`. El ranking de popularidad es el más sencillo y funciona bien para arrancar, aunque no tiene ninguna personalización. El filtrado por usuarios sí adapta el resultado, pero necesita suficientes coincidencias para encontrar vecinos fiables.

El filtrado basado en ítems es el que más me convence para este dataset. Además de personalizar, permite justificar cada resultado a partir de una película que el usuario ya ha valorado bien. Aun así, también tiene sesgo hacia los títulos con más información y no resuelve por sí solo el problema de un usuario completamente nuevo.

Como ampliación he desarrollado CineMatch, una web que representa visualmente estos tres enfoques. La aplicación añade una mezcla híbrida con pesos dinámicos: al principio se apoya más en popularidad y, cuando el perfil acumula valoraciones, da más peso a usuarios e ítems similares. También incorpora perfiles locales y metadatos de TMDB. Estas mejoras no sustituyen los tres filtros del ejercicio; simplemente los combinan y los presentan de una forma más cercana a una aplicación real.
"""),
]

notebook = {
    "cells": cells,
    "metadata": {
        "colab": {"name": "Caso_Practico_RS_Carlos_Galan.ipynb"},
        "kernelspec": {"display_name": "Python 3", "name": "python3"},
        "language_info": {"name": "python"},
    },
    "nbformat": 4,
    "nbformat_minor": 5,
}

OUT.parent.mkdir(exist_ok=True)
OUT.write_text(json.dumps(notebook, ensure_ascii=False, indent=1), encoding="utf-8")
print(OUT)
