# Pasarela — Entrenamiento de respuestas

PWA para que candidatas practiquen respuestas de certamen, con grabación de video,
análisis de lenguaje corporal en el navegador y devolución de un jurado IA.
La clave de Groq queda OCULTA en el servidor; las candidatas solo usan una contraseña de la app.

## Desplegar en Vercel (gratis)

1. Crea una cuenta en https://vercel.com (puedes usar tu GitHub).
2. Sube esta carpeta: o bien la conectas como repositorio de GitHub,
   o instalas la CLI (`npm i -g vercel`) y corres `vercel` dentro de la carpeta.
3. En el panel del proyecto, ve a Settings → Environment Variables y crea DOS variables:
   - `GROQ_API_KEY`  → tu clave de https://console.groq.com/keys
   - `APP_PASSWORD`  → la contraseña que repartirás a las candidatas
4. Redespliega (Deployments → Redeploy) para que tome las variables.
5. Abre la URL que te da Vercel. Cada candidata ingresa la contraseña una vez.

## Cómo se usa
- Elige categoría y pulsa "Nueva pregunta".
- Modo directo: graba y recibe la devolución al terminar.
- Modo revisión: graba, revisa tu toma las veces que quieras y pulsa "Pedir devolución".
- También puedes subir un video grabado con el celular (en ese caso solo se evalúa el contenido).

## Notas
- Requiere HTTPS para usar la cámara (Vercel ya lo da).
- El análisis corporal corre 100% en el navegador (MediaPipe); el video no se sube.
- Límites del plan gratuito de Groq: ~1.000 evaluaciones y ~2.000 transcripciones al día, compartidas.
