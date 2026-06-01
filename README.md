# FocusPal

Aplicación móvil de productividad basada en la **técnica Pomodoro**, construida con React Native + Expo. Inspirada en apps como [Pomodoro Timer](https://play.google.com/store/apps/details?id=com.pomodrone.app).

Alterna sesiones de concentración y descanso, organiza tus tareas, sigue tu progreso diario y mantén el foco con notificaciones, sonido y vibración.

## Características

- **Temporizador Pomodoro** con fases de concentración, descanso corto y descanso largo, y autociclado configurable.
- **Conteo exacto basado en marcas de tiempo** (`endTimestamp`): el contador no se desfasa aunque minimices la app, y al terminar dispara la notificación programada (evita el típico bug de "segundos en negativo").
- **Lista de tareas** con estimación de pomodoros, tarea activa y conteo de pomodoros completados por tarea.
- **Tipos de tarea predefinidos** (Clásico 25/5, Concentración profunda 50/10, Estudio 45/15, Sprint corto 15/3, Escritura, Lectura, o Personalizado): al activar una tarea, el temporizador adopta automáticamente sus tiempos y ciclos.
- **Ajustes** de duraciones, ciclos antes del descanso largo, objetivo diario, auto-inicio, sonido, vibración y mantener pantalla encendida.
- **Estadísticas**: objetivo diario, foco de hoy, gráfica de los últimos 7 días y totales acumulados.
- **Temas de color** (16 paletas) y modo claro / oscuro / sistema.
- **Notificación continua en la pantalla de bloqueo** mostrando la fase activa y la hora de fin (solo en development build; ver notas).
- **Notificaciones locales**, sonido (chime generado) y vibración al terminar cada fase.
- Todo se guarda localmente con persistencia (AsyncStorage).

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (probado con Node 22).
- La app **Expo Go** instalada en tu teléfono (Android o iOS), o un emulador.

## Cómo ejecutarla

```bash
npm install
npx expo start
```

Escanea el código QR que aparece en la terminal con la app **Expo Go** (Android) o con la cámara (iOS). La app se abrirá al instante y se recargará en caliente al guardar cambios.

Otros comandos:

```bash
npm run android   # abrir en emulador/dispositivo Android
npm run ios       # abrir en simulador iOS (requiere macOS)
npm run web       # abrir en el navegador
```

## Estructura del proyecto

```
src/
  app/
    _layout.tsx            Layout raíz: tema, notificaciones, sonido
    (tabs)/
      _layout.tsx          Barra de pestañas
      index.tsx            Pantalla del temporizador
      tasks.tsx            Lista de tareas
      stats.tsx            Estadísticas
      settings.tsx         Ajustes
  components/
    AnimatedClock.tsx      Reloj SVG (cronómetro) con círculo que se vacía
    BarChart.tsx           Gráfica de barras semanal
    ui.tsx                 Card, Row, Stepper, Segmented...
  lib/
    notifications.ts       Notificaciones locales
    sound.ts               Reproducción del chime
    time.ts                Utilidades de formato y fechas
  store/
    timerStore.ts          Lógica del temporizador (timestamps, fases)
    tasksStore.ts          Tareas
    settingsStore.ts       Ajustes
    statsStore.ts          Estadísticas
  theme/
    themes.ts              Paletas de color
    useTheme.ts            Hook de tema
assets/
  sounds/chime.wav         Sonido de fin de fase (ver scripts/gen-chime.js)
```

## Notas técnicas

- El sonido `assets/sounds/chime.wav` se genera con `node scripts/gen-chime.js` (un tono PCM corto), sin assets binarios externos.
- `expo-notifications` se carga de forma diferida y se desactiva automáticamente dentro de **Expo Go** (donde fue removido a partir de SDK 53), por lo que la app funciona en Expo Go usando sonido + vibración. En un **development build** se activan tanto las notificaciones de fin de fase como la **notificación continua (sticky) en la pantalla de bloqueo** con el temporizador. La lógica basada en marcas de tiempo garantiza que el contador sea correcto al reabrir la app.
- Para generar instaladores nativos (APK/IPA) usa [EAS Build](https://docs.expo.dev/build/introduction/).

## Tecnologías

React Native · Expo SDK 56 · Expo Router · TypeScript · Zustand · expo-notifications · expo-audio · expo-haptics · expo-keep-awake · react-native-svg
