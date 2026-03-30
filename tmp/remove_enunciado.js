const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Dell', 'Desktop', 'app', 'src', 'data', 'official-questions.json');

try {
  const data = fs.readFileSync(filePath, 'utf8');
  let questions = JSON.parse(data);

  questions = questions.map(q => {
    // Eliminar el prefijo ENUNCIADO:\n que añadimos antes
    if (q.pregunta.startsWith("ENUNCIADO:\n")) {
      q.pregunta = q.pregunta.replace("ENUNCIADO:\n", "");
    }
    // Caso por si acaso se nos fue sin el salto
    if (q.pregunta.startsWith("ENUNCIADO: ")) {
      q.pregunta = q.pregunta.replace("ENUNCIADO: ", "");
    }
    
    // Mantener los saltos de línea internos para legibilidad, pero sin el título gigante
    return q;
  });

  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
  console.log("Palabra 'ENUNCIADO' eliminada de las 100 preguntas.");
} catch (err) {
  console.error("Error:", err);
  process.exit(1);
}
