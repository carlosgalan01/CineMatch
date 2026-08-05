import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "data-source", "Ficheros");
const ratings = fs
  .readFileSync(path.join(source, "file.tsv"), "utf8")
  .trim()
  .split("\n")
  .map((line) => line.split("\t").slice(0, 3).map(Number));

const movies = fs
  .readFileSync(path.join(source, "Movie_Id_Titles.csv"), "utf8")
  .trim()
  .split("\n")
  .slice(1)
  .map((line) => {
    const separator = line.indexOf(",");
    return [Number(line.slice(0, separator)), line.slice(separator + 1).replace(/^"|"$/g, "")];
  });

fs.mkdirSync(path.join(root, "src", "data"), { recursive: true });
fs.writeFileSync(
  path.join(root, "src", "data", "movielens.json"),
  JSON.stringify({ movies, ratings }),
);
console.log(`Generated ${movies.length} movies and ${ratings.length} ratings.`);
