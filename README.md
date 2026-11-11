<div align="center">

# 🧱 ARKANOID 🏓

### El clásico juego de romper bloques, hecho con **HTML + CSS + JavaScript puro**

![HTML5](https://img.shields.io/badge/HTML5-canvas-e34f26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-estilos-1572b6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20modules-f7df1e?logo=javascript&logoColor=black)
![Dependencias](https://img.shields.io/badge/dependencias-0-brightgreen)
![Build](https://img.shields.io/badge/build-ninguno-blueviolet)
![Spec-driven](https://img.shields.io/badge/dise%C3%B1o-spec--driven-orange)

**Cero dependencias · Sin build · Sin gestor de paquetes**

</div>

---

## 🎮 ¿Qué es esto?

Un Arkanoid completo y jugable directamente en el navegador. Mueve la paleta, rebota la pelota, rompe todos los bloques y sobrevive a niveles cada vez más difíciles. Se juega en un `<canvas>` de 800×600 con sprites, explosiones y sonido.

## ✨ Características

- 🏓 **Paleta y pelota** con ángulo de rebote según el punto de impacto.
- 🧱 **Bloques de colores** con animación de explosión al romperse.
- ♾️ **Niveles infinitos** en ciclos de 7: cada nivel añade una fila de color.
- 🔥 **Dificultad progresiva**: en cada ciclo nuevo la paleta se acorta, la pelota se acelera y los bloques aguantan más golpes (hasta 5).
- ❤️ **3 vidas**, puntuación y HUD con el nivel actual.
- 🔊 **Efectos de sonido** de rebote y rotura, con botón de silencio que recuerda tu preferencia.
- 🖱️ **Control con teclado o ratón.**

## 🕹️ Controles

| Acción | Tecla / gesto |
| --- | --- |
| Mover la paleta | `←` `→` o `A` `D` · o mover el ratón |
| Lanzar la pelota | `Espacio` o clic |
| Continuar / reiniciar | `Espacio`, `Enter` o clic |
| Silenciar / activar sonido | `M` o el botón 🔊 de la esquina superior izquierda |

## 🚀 Cómo jugar en local

No hay nada que instalar. Solo sirve la carpeta de forma estática (los módulos ES no cargan desde `file://`):

```bash
python3 -m http.server
```

Y abre <http://localhost:8000>.

> 🌐 Cada push a `main` se publica automáticamente en **GitHub Pages** mediante `.github/workflows/static.yml`.

## 🗂️ Estructura del proyecto

```
arkanoid/
├── index.html            # canvas 800×600 y carga de scripts
├── style.css             # escalado del canvas
├── src/
│   ├── config.js         # constantes del juego
│   ├── main.js           # bucle principal
│   ├── game.js           # lógica y estado (sin DOM)
│   ├── input.js          # teclado y ratón
│   ├── render.js         # dibujo en canvas
│   └── audio.js          # sonido con Web Audio
├── assets/
│   ├── spritesheet-breakout.png
│   ├── spritesheet.js    # atlas de sprites (globales)
│   └── sounds/           # rebote y rotura
├── specs/                # specs numeradas del proyecto
└── .claude/skills/       # skills /spec y /spec-impl
```

## 📐 Desarrollo spec-driven

Este proyecto se construye con **diseño guiado por specs**: primero se escribe un contrato claro (`specs/NN-slug.md`) y solo después se implementa contra él.

```
/spec <idea>  →  revisión humana (Aprobado)  →  /spec-impl NN-slug  →  PR  →  Implementado
```

| Spec | Qué añadió | Estado |
| --- | --- | --- |
| [01](specs/01-mvp-jugable.md) | MVP jugable: paleta, pelota, bloques, vidas y puntos | ✅ Implementado |
| [02](specs/02-animacion-destruccion-bloques.md) | Animación de destrucción de bloques | ✅ Implementado |
| [03](specs/03-sonidos-rebote-y-rotura.md) | Sonidos de rebote y rotura con silencio alternable | ✅ Implementado |
| [04](specs/04-niveles-de-dificultad.md) | Niveles infinitos y dificultad progresiva | ✅ Implementado |

Más detalles sobre las skills en [`.claude/skills/README.md`](.claude/skills/README.md).

## 🧠 Decisiones de diseño

- **Lógica separada del dibujo y del audio**: `game.js` solo modifica el estado; `main.js` reproduce los sonidos y `render.js` dibuja.
- **Una sola fuente de constantes** en `config.js`.
- **Un único atlas de sprites** para todo lo visual.

---

<div align="center">

Hecho con 💙 y muchos rebotes · ¡Que no se te caiga la pelota! 🏓

</div>
