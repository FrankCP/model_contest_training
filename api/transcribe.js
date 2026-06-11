// /api/transcribe — recibe el audio/video, llama a Groq Whisper con la clave oculta.
// La clave vive en process.env.GROQ_API_KEY (variable de entorno en Vercel), nunca en el navegador.

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // Contraseña simple de la app
  const appPass = process.env.APP_PASSWORD || '';
  if (appPass && req.headers['x-app-pass'] !== appPass) {
    return res.status(401).json({ error: 'Contraseña de la app incorrecta.' });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'Falta configurar GROQ_API_KEY en el servidor.' });

  try {
    // Reenviar el cuerpo (multipart) tal cual a Groq
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const buf = Buffer.concat(chunks);

    const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': req.headers['content-type'], // conserva el boundary del multipart
      },
      body: buf,
    });

    const text = await r.text();
    if (!r.ok) return res.status(r.status).json({ error: 'Groq transcripción ' + r.status, detail: text.slice(0, 300) });
    return res.status(200).json(JSON.parse(text));
  } catch (e) {
    return res.status(500).json({ error: 'Error al transcribir', detail: String(e).slice(0, 200) });
  }
}
