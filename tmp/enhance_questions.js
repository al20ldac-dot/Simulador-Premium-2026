const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Dell', 'Desktop', 'app', 'src', 'data', 'official-questions.json');

try {
  const data = fs.readFileSync(filePath, 'utf8');
  let questions = JSON.parse(data);

  questions = questions.map(q => {
    // 1. Separar "Enunciado:" si existe
    if (q.pregunta.includes("Enunciado:")) {
      q.pregunta = q.pregunta.replace("Enunciado:", "ENUNCIADO:\n");
    }
    
    // 2. Dar aire a párrafos largos (punto seguido de Mayúscula)
    // Buscamos un punto seguido de un espacio y una letra mayúscula
    q.pregunta = q.pregunta.replace(/\.\s+([A-ZÁÉÍÓÚÑ])(?![a-z])/g, '.\n\n$1');

    // 3. Limpiar opciones
    Object.keys(q.opciones).forEach(key => {
      q.opciones[key] = q.opciones[key].trim();
    });

    return q;
  });

  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
  console.log("JSON actualizado con éxito (100 preguntas procesadas).");
} catch (err) {
  console.error("Error procesando JSON:", err);
  process.exit(1);
}
