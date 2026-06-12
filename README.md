<div align="center">

# 🛰️ BG-01 · Space Station

**Un portafolio que no se visita. Se aborda.**

BG-01 es una estación espacial operativa habitada por un ingeniero de software.
Cada sección es un módulo real de la estación: navegas sus cubiertas, consultas su bitácora
y abres un canal de comunicaciones — todo con la sobriedad de un centro de control aeroespacial.

[![Deploy](https://github.com/brayangomez22/brayangomez22.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/brayangomez22/brayangomez22.github.io/actions/workflows/deploy.yml)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![Motion](https://img.shields.io/badge/Motion-12-FFF42B?logo=framer&logoColor=black)](https://motion.dev)

**🟢 Estado: en órbita** · [**Acoplar con la estación →**](https://brayangomez22.github.io/)

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
- **Sistema de comunicaciones** — formulario de contacto con máquina de estados de transmisión y validación en vivo.
- **Diseño responsivo** — del puente de mando en ultrawide a la consola de bolsillo en móvil.
- **Accesibilidad como sistema crítico** — sonido desactivado por defecto, respeto global a `prefers-reduced-motion`, capas decorativas ocultas a tecnologías de asistencia y cero rastreo (sin cookies ni llamadas externas).

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
- **`src/content/`** — todo el contenido (piloto, misiones, experiencia, archivo) como constantes tipadas, separado de la presentación.
- **`src/lib/`** — utilidades sin framework: motor de audio, variantes de movimiento, SEO y manifiesto de visitante.
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
git clone https://github.com/brayangomez22/brayangomez22.github.io.git
cd brayangomez22.github.io
npm install
```

## 🧑‍🚀 Desarrollo

```bash
npm run dev        # servidor de desarrollo (Vite)
npm run typecheck  # verificación de tipos sin emitir
```

## 📦 Build

```bash
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve el build de producción en local
```

## 🛸 Despliegue

El despliegue es continuo: cada push a `main` dispara el workflow de GitHub Actions
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)), que construye el proyecto
y lo publica en **GitHub Pages**. El workflow copia `index.html` como `404.html` para que
los enlaces profundos de la SPA (`/missions/...`, `/archive/...`) arranquen el router
en lugar de fallar.

---

## 🎨 Filosofía de diseño

> Elegante, profesional, creíble. Interstellar y The Expanse antes que neón y cliché hacker.

1. **El contenido manda sobre los efectos.** Cada animación, textura y sonido existe para reforzar la sensación de una estación viva; si no aporta, no embarca.
2. **La narrativa nunca perjudica la usabilidad.** Cada término diegético lleva su traducción (Misiones · Proyectos), el sonido es opt-in y la estación entera funciona con movimiento reducido.
3. **Diez segundos.** Un recruiter debe entender quién es el piloto y qué hace en menos de diez segundos, sin descodificar la ficción.

---

## ⚡ Rendimiento

La inmersión no se paga con segundos de carga:

- **Un chunk por cubierta** — cada módulo se carga bajo demanda; React y Motion viajan en chunks de vendor independientes y cacheables.
- **Carga inicial intacta** — la pausa escénica del cargador de telemetría solo aplica en navegaciones posteriores, nunca en la primera impresión ni para visitantes con movimiento reducido.
- **SVG antes que imágenes pesadas** — avatar, insignias y portadas son vectoriales.
- **Tipografía autoalojada** — subconjuntos woff2 servidos desde el mismo origen, sin ida y vuelta a Google Fonts.
- **Audio sintetizado** — el ambiente sonoro se genera con Web Audio: cero descargas de archivos de audio.
- **Cero rastreo** — sin cookies, sin analítica externa, sin peticiones a terceros.

---

## 🗺️ Roadmap

- [ ] **Telemetría visual** — capturas y demo animada de los módulos en este README.
- [ ] **Enlace de transmisión real** — conectar el módulo de comunicaciones a un proveedor de entrega (hoy la transmisión se simula).
- [ ] **Evidencia de misiones** — enlaces a repositorios y despliegues reales en cada expediente.
- [ ] **Diagnósticos automáticos** — ESLint y suite de pruebas integrados en el pipeline.
- [ ] **Auditoría continua** — presupuesto Lighthouse verificado en CI.
- [ ] **Canal en inglés** — versión EN de la estación para tripulación internacional.

---

## 👨‍🚀 Autor

**Brayan Gómez** — Backend Developer · Arquitecto de Sistemas

Especializado en sistemas robustos y escalables con **Go**, **NestJS**, **MongoDB** y **AWS**.

[![GitHub](https://img.shields.io/badge/GitHub-brayangomez22-181717?logo=github)](https://github.com/brayangomez22)
[![Portfolio](https://img.shields.io/badge/Estación-BG--01-0B3D91)](https://brayangomez22.github.io/)

---

## 📄 Licencia

El **código** de este proyecto se publica bajo licencia [MIT](LICENSE): úsalo, estúdialo y adáptalo libremente.

El **contenido** (textos, identidad BG-01, avatar, CV y datos personales) es propiedad de Brayan Gómez y no puede reutilizarse sin permiso.

---

<div align="center">

`BG-01 · TRANSMISIÓN FINALIZADA`

</div>
