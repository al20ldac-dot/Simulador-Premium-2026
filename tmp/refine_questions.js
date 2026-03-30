const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Dell', 'Desktop', 'app', 'src', 'data', 'official-questions.json');

try {
  const data = fs.readFileSync(filePath, 'utf8');
  let questions = JSON.parse(data);

  questions = questions.map(q => {
    // 1. Mejorar el enunciado
    // Si no tiene "ENUNCIADO:", se lo ponemos (pero solo si tiene más de 100 chars o es complejo)
    if (!q.pregunta.startsWith("ENUNCIADO:")) {
      q.pregunta = "ENUNCIADO:\n" + q.pregunta;
    }
    
    // 2. Dar aire a la pregunta final
    // Si la pregunta termina con un signo de interrogación, nos aseguramos de que haya un salto antes si hay mucho texto previo.
    const parts = q.pregunta.split('?');
    if (parts.length > 2) {
      // Re-unir con saltos
      q.pregunta = q.pregunta.replace(/\.\s+(¿|Cuál|Qué|En)/g, '.\n\n$1');
    }

    // 3. Formatear la justificación
    if (q.justificacion && q.justificacion.length > 150) {
      q.justificacion = q.justificacion.replace(/\.\s+([A-ZÁÉÍÓÚÑ])/g, '.\n\n$1');
    }

    // 4. Limpieza de opciones (asegurar que no tengan literales repetidos dentro del texto)
    Object.keys(q.opciones).forEach(key => {
      let val = q.opciones[key].trim();
      // Si el valor empieza con "A) ", "B) ", etc, se lo quitamos porque el componente ya pone el círculo
      val = val.replace(/^[A-D]\)\s*/, '');
      q.opciones[key] = val;
    });

    return q;
  });

  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
  console.log("JSON refinado con éxito. Se añadió formato 'ENUNCIADO' y saltos de línea inteligentes.");
} catch (err) {
  console.error("Error:", err);
  process.exit(1);
}
