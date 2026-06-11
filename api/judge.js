// /api/judge — recibe transcripción + métricas corporales, pide la devolución al LLM con la clave oculta.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const appPass = process.env.APP_PASSWORD || '';
  if (appPass && req.headers['x-app-pass'] !== appPass) {
    return res.status(401).json({ error: 'Contraseña de la app incorrecta.' });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'Falta configurar GROQ_API_KEY en el servidor.' });

  try {
    const { transcript = '', question = '', body = null } = req.body || {};

    let bodyText;
    if (body) {
      bodyText = `Métricas de lenguaje corporal (0-100), medidas automáticamente mientras hablaba:
- Contacto visual: ${Math.round(body.eye * 100)}
- Estabilidad/postura: ${Math.round(body.pose * 100)}
- Expresión/sonrisa: ${Math.round(body.smile * 100)}
- Gesticulación de manos: ${Math.round(body.hand * 100)}`;
    } else {
      bodyText = 'No hay datos de lenguaje corporal (video subido externamente). Evalúa solo el contenido y no inventes observaciones físicas.';
    }

    const sys = `Eres un jurado experto de certámenes de belleza y coach de oratoria. Evalúas a candidatas que practican respuestas. Eres cálido pero honesto y específico. Respondes SIEMPRE en español. Devuelve EXCLUSIVAMENTE un objeto JSON válido, sin texto extra ni markdown, con esta forma:
{"puntaje": <0-100>, "resumen": "<1-2 frases>", "contenido": ["<observación>", ...], "corporal": ["<observación>", ...], "mejoras": ["<acción concreta>", ...], "respuesta_modelo": "<una versión ejemplar y breve, 2-3 frases>"}`;

    const user = `Pregunta del certamen: "${question}"

Transcripción de la respuesta de la candidata: "${transcript}"

${bodyText}

Evalúa estructura, claridad, contenido, autenticidad y conexión emocional. Si hay métricas corporales, interprétalas con tacto. Sé concreto y útil.`;

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.6,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
      }),
    });

    const text = await r.text();
    if (!r.ok) return res.status(r.status).json({ error: 'Groq jurado ' + r.status, detail: text.slice(0, 300) });
    const j = JSON.parse(text);
    const content = j.choices[0].message.content.replace(/```json|```/g, '').trim();
    return res.status(200).json({ feedback: JSON.parse(content) });
  } catch (e) {
    return res.status(500).json({ error: 'Error al generar la devolución', detail: String(e).slice(0, 200) });
  }
}
