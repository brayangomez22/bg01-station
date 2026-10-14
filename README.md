<div align="center">

# 🛰️ BG-01 · Space Station

**Un portafolio que no se visita. Se aborda.**

BG-01 es una estación espacial operativa habitada por un ingeniero de software.
Cada sección es un módulo real de la estación: navegas sus cubiertas, consultas su bitácora
y abres un canal de comunicaciones — todo con la sobriedad de un centro de control aeroespacial.

[![Deploy](https://github.com/brayangomez22/bg01-station/actions/workflows/deploy.yml/badge.svg)](https://github.com/brayangomez22/bg01-station/actions/workflows/deploy.yml)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![Motion](https://img.shields.io/badge/Motion-12-FFF42B?logo=framer&logoColor=black)](https://motion.dev)

**🟢 Estado: en órbita** · [**Acoplar con la estación →**](https://brayangomez.dev)

</div>

---

## 📸 Capturas

> _Telemetría visual en preparación. Las capturas de los módulos de la estación se publicarán próximamente._

<!--
| Puente de mando | Archivo de conocimiento |
| :---: | :---: |
| ![Puente](docs/screenshots/bridge.png) | ![Archivo](docs/screenshots/archive.png) |
-->

---

## ✨ Características

- **Experiencia inmersiva** — secuencia de arranque en la primera visita, HUD persistente, ciclo operativo que cambia con la hora local del visitante (turnos alfa, beta y nocturno) y ambiente sonoro sintetizado en tiempo real con Web Audio.
- **Navegación por módulos** — la estación se organiza en siete cubiertas; el dock de navegación, el mapa de la estación y las transiciones direccionales (ascenso/descenso) derivan de una única fuente de verdad.
- **Consola de comandos** — paleta global estilo control de misión (`Ctrl/Cmd + K`) para saltar entre módulos sin tocar el ratón.
- **Archivo de conocimiento** — blog técnico con búsqueda, filtros por sección y registros destacados.
- **Misiones** — proyectos presentados como expedientes de misión, con briefing, filtros y página de detalle.
- **Bitácora** — la trayectoria profesional como diario de vuelo.
- **Sistema de comunicaciones** — formulario de contacto con máquina de estados de transmisión y validación en vivo, entregado vía Web3Forms.
- **Centro de Control** — panel autenticado en `/control` para editar todo el contenido de la estación y publicarlo sin tocar el código.
- **Diseño responsivo** — del puente de mando en ultrawide a la consola de bolsillo en móvil.
- **Accesibilidad como sistema crítico** — sonido desactivado por defecto, respeto global a `prefers-reduced-motion`, capas decorativas ocultas a tecnologías de asistencia y cero rastreo (sin cookies ni analítica de terceros).

---

## 🧭 Arquitectura de BG-01

Cada ruta es una **cubierta** de la estación. La ficción es la interfaz, pero ningún visitante necesita descodificarla: cada módulo lleva su traducción a la vista.

| Cubierta | Módulo | Función | Ruta |
| :---: | --- | --- | --- |
| `00` | **Puente** | Inicio · centro de mando y visión general | `/` |
| `01` | **Piloto** | Sobre mí · perfil, manifiesto y estadísticas | `/pilot` |
| `02` | **Sistemas** | Tecnologías · stack y niveles de dominio | `/systems` |
| `03` | **Misiones** | Proyectos · expedientes con briefing y detalle | `/missions` |
| `04` | **Bitácora** | Experiencia · diario de vuelo profesional | `/logbook` |
| `05` | **Comunicaciones** | Contacto · canal de transmisión directo | `/comms` |
| `06` | **Archivo** | Blog técnico · registros de conocimiento | `/archive` |

Bajo el casco, el código sigue la misma disciplina que la estación:

- **`src/features/<cubierta>/`** — un módulo por ruta, con sus componentes y hooks locales. Cada cubierta se carga como chunk independiente.
- **`src/app/router/decks.ts`** — la única fuente de verdad ruta → cubierta; HUD, navegación y transiciones derivan de ella.
- **`src/content/`** — accesores tipados sobre el contenido; los datos llegan como JSON en `src/content/_generated/` desde el CMS (ver abajo).
- **`src/features/control/`** — el Centro de Control (`/control`): una rama del router aparte, fuera de las cubiertas.
- **`src/lib/`** — utilidades sin framework: motor de audio, variantes de movimiento, SEO, manifiesto de visitante y cliente del API de control.
- **`src/styles/tokens/`** — el sistema de diseño completo como custom properties de CSS.

---

## 🛠️ Tech Stack

| Tecnología | Versión | Rol en la estación |
| --- | :---: | --- |
| [React](https://react.dev) | 19 | Núcleo de la interfaz; metadatos de documento nativos para SEO |
| [TypeScript](https://www.typescriptlang.org) | 6 | Tipado estricto de extremo a extremo |
| [Vite](https://vite.dev) (rolldown) | 8 | Build y servidor de desarrollo |
| [React Router](https://reactrouter.com) | 7 | Navegación entre cubiertas con carga perezosa por módulo |
| [Motion](https://motion.dev) | 12 | Transiciones direccionales y coreografía del HUD |
| CSS Modules | — | Estilos aislados por componente con nomenclatura BEM |

Sin frameworks de UI, sin librerías de componentes, sin archivos de audio: la estética y el sonido de la estación están construidos a mano.

---

## 🚀 Instalación

Requisitos: **Node.js 22+** y **npm**.

```bash
git clone https://github.com/brayangomez22/bg01-station.git
cd bg01-station
npm install
```

## 🧑‍🚀 Desarrollo

```bash
npm run dev        # servidor de desarrollo (Vite)
npm run typecheck  # verificación de tipos sin emitir
npm run lint       # ESLint (typescript-eslint + react-hooks)
```

Para usar el Centro de Control en local, copia `.env.example` a `.env.local` y apunta
`VITE_API_BASE_URL` a una instancia de [bg01-api](https://github.com/brayangomez22/bg01-api).

## 📦 Build

```bash
npm run build      # typecheck + build + prerender de todas las rutas en dist/
npm run preview    # sirve el build de producción en local
```

## 🛰️ Contenido y CMS

El contenido de la estación no vive en este repositorio: su fuente de verdad es la base de datos de
[**bg01-api**](https://github.com/brayangomez22/bg01-api), un CMS en Go desplegado en Fly.io
(`https://api.brayangomez.dev`).

1. El contenido se edita en el **Centro de Control** (`/control`).
2. **Publicar estación** pide al API que dispare un `repository_dispatch` (`content-updated`) en este repo.
3. El workflow de despliegue ejecuta `npm run sync:content`, que descarga `/export` del API y regenera
   `src/content/_generated/*.json`, y después construye y publica el sitio.
4. Si el API no responde, la sincronización se omite sin fallar y el build usa la última instantánea commiteada.

> ⚠️ `src/content/_generated/` es salida generada: **no se edita a mano**. Cualquier cambio se
> sobrescribe en la siguiente publicación. Los cambios de contenido se hacen desde `/control`.

```bash
API_BASE=https://api.brayangomez.dev npm run sync:content   # refresca la instantánea local
```

## 🛸 Despliegue

El despliegue es continuo: cada push a `main` —o cada publicación desde el Centro de Control—
dispara el workflow de GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)),
que sincroniza el contenido, construye el proyecto y lo publica en **GitHub Pages** bajo el dominio
[brayangomez.dev](https://brayangomez.dev).

El build **prerenderiza** cada cubierta, misión y registro del archivo a su propio HTML
(`/pilot` → `pilot.html`), con el contenido real y los metadatos de la ruta en el HTML inicial:
cada URL responde 200 y React hidrata sobre ese marcado. También genera `sitemap.xml` y un
`404.html` real para las rutas que no existen.

---

## 🎨 Filosofía de diseño

> Elegante, profesional, creíble. Interstellar y The Expanse antes que neón y cliché hacker.

1. **El contenido manda sobre los efectos.** Cada animación, textura y sonido existe para reforzar la sensación de una estación viva; si no aporta, no embarca.
2. **La narrativa nunca perjudica la usabilidad.** Cada término diegético lleva su traducción (Misiones · Proyectos), el sonido es opt-in y la estación entera funciona con movimiento reducido.
3. **Diez segundos.** Un recruiter debe entender quién es el piloto y qué hace en menos de diez segundos, sin descodificar la ficción.

---

## ⚡ Rendimiento

La inmersión no se paga con segundos de carga:

- **HTML prerenderizado** — cada ruta llega con su contenido y metadatos desde el primer byte; React hidrata sin volver a pintar.
- **Un chunk por cubierta** — cada módulo se carga bajo demanda; React y Motion viajan en chunks de vendor independientes y cacheables.
- **Carga inicial intacta** — la pausa escénica del cargador de telemetría solo aplica en navegaciones posteriores, nunca en la primera impresión ni para visitantes con movimiento reducido.
- **SVG antes que imágenes pesadas** — avatar, insignias y portadas son vectoriales.
- **Tipografía autoalojada** — subconjuntos woff2 servidos desde el mismo origen, sin ida y vuelta a Google Fonts.
- **Audio sintetizado** — el ambiente sonoro se genera con Web Audio: cero descargas de archivos de audio.
- **Cero rastreo** — sin cookies ni analítica de terceros; solo un pulso anónimo por sesión al API propio para el contador de tráfico.

---

## 🗺️ Roadmap

- [ ] **Telemetría visual** — capturas y demo animada de los módulos en este README.
- [x] **Enlace de transmisión real** — el módulo de comunicaciones entrega vía Web3Forms.
- [ ] **Evidencia de misiones** — enlaces a repositorios y despliegues reales en cada expediente.
- [x] **Diagnósticos locales** — ESLint (typescript-eslint + react-hooks) con `npm run lint`.
- [ ] **Diagnósticos automáticos** — lint y suite de pruebas integrados en el pipeline.
- [ ] **Auditoría continua** — presupuesto Lighthouse verificado en CI.
- [ ] **Canal en inglés** — versión EN de la estación para tripulación internacional.

---

## 👨‍🚀 Autor

**Brayan Gómez** — Full Stack Developer

5+ años construyendo sistemas pensados para durar en producción: backend en **Go**,
interfaces en **React** y **Angular**, desplegados en **Azure**.

[![GitHub](https://img.shields.io/badge/GitHub-brayangomez22-181717?logo=github)](https://github.com/brayangomez22)
[![Portfolio](https://img.shields.io/badge/Estación-BG--01-0B3D91)](https://brayangomez.dev)

---

## 📄 Licencia

El **código** de este proyecto se publica bajo licencia [MIT](LICENSE): úsalo, estúdialo y adáptalo libremente.

El **contenido** (textos, identidad BG-01, avatar, CV y datos personales) es propiedad de Brayan Gómez y no puede reutilizarse sin permiso.

---

<div align="center">

`BG-01 · TRANSMISIÓN FINALIZADA`

</div>
