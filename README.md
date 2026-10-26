# Español - Pokémon Violet PC

**Adaptación para PC a partir de una copia original proporcionada por el usuario.**

Pokémon Violet PC es un proyecto orientado a adaptar la ejecución de Pokémon Violet al entorno de PC. Su propósito es traducir y adaptar la copia original aportada por el usuario, utilizando los archivos y recursos procedentes de esa misma copia.

> [!IMPORTANT]
> **Arquitectura basada en ScarletNX: recompilación a código nativo con componentes de emulación.**
>
> ScarletNX recompila el código ARM64 del juego para la CPU del PC. Su flujo principal utiliza recompilación anticipada (AOT), y un compilador JIT puede traducir durante la ejecución el código que no quedó cubierto en esa preparación.
>
> El juego utiliza además un entorno de ejecución que reproduce los servicios de Nintendo Switch mediante emulación de alto nivel (HLE) y adapta las operaciones gráficas de la GPU Maxwell para renderizarlas con Vulkan.
>
> **La base técnica combina código recompilado nativo con emulación de servicios y gráficos. El entorno de ejecución de ScarletNX sigue siendo necesario.**

Referencias del proyecto base: [arquitectura de ScarletNX](https://github.com/scarletnx/ScarletNX/blob/main/docs/ARCHITECTURE.md) y [compilación JIT](https://github.com/scarletnx/ScarletNX/blob/main/docs/DEPRECATIONS.md).

## Requisitos recomendados

### Para instalar y ejecutar

Además de una copia original del juego aportada por el usuario, se recomienda la siguiente configuración:

| Componente | Requisito recomendado |
| --- | --- |
| Sistema operativo | Windows 10. |
| Procesador | Intel Core i5; modelo y generación por especificar. |
| Memoria RAM | 16 GB. |
| Tarjeta gráfica | Tarjeta gráfica y controlador compatibles con **Vulkan 1.3**. Modelo y memoria de vídeo recomendados: por especificar. |
| Almacenamiento | 10 GB de espacio libre. |

## Instalación y primer inicio

1. **Obtener el programa.** Descarga la versión correspondiente de Pokémon Violet PC desde el canal de distribución del proyecto.
2. **Extraer los datos del juego.** Extrae los contenidos de **ExeFS** y **RomFS** de tu copia original en formato **`.nsp`**, utilizando las funciones de extracción de Ryujinx. Conserva las carpetas resultantes como `exefs` y `romfs`.
3. **Preparar los archivos.** Utiliza las carpetas extraídas en el procedimiento de importación y preparación de Pokémon Violet PC, y completa el proceso de traducción correspondiente a la versión instalada.
4. **Configurar e iniciar.** Selecciona los ajustes de gráficos y controles disponibles e inicia el juego.

## Gráficos y pantalla

Pokémon Violet PC utiliza **Vulkan 1.3** como API de renderizado, de acuerdo con su base ScarletNX, y ofrece las siguientes opciones de gráficos y pantalla:

| Apartado | Especificación |
| --- | --- |
| API gráfica | **Vulkan 1.3**. Actualmente es la única API de renderizado indicada para esta versión. |
| Resoluciones | **720p (HD)**, **1080p (Full HD)**, **2K (reescalado)** y **4K (reescalado)**. |
| Formato de pantalla | **16:9**, **26:9** y **automático**. |
| Modos de visualización | **Pantalla completa** y **modo ventana**. |
| Fotogramas por segundo | Opciones de **30 FPS** y **60 FPS**. |

## Controles

**Soporte de entrada: teclado y mando (joystick).**

| Apartado | Descripción |
| --- | --- |
| Dispositivos | Teclado y mando. |

## Opción Extra

La opción **Extra** se habilita en cuanto el usuario dispone de una **partida guardada**. Una vez disponible, permite acceder a dos secciones: **Objetos** y **Pokédex**.

### Objetos

Muestra el catálogo de todos los objetos que se pueden obtener en el juego y permite gestionar sus cantidades en el inventario:

- **Agregar objetos**, incluso si todavía no se han obtenido durante la partida.
- **Aumentar o disminuir la cantidad** de los objetos.

### Pokédex

Muestra la lista de Pokémon que ya se han registrado en la **Pokédex de la partida guardada**.

## Demo

[Ver la demo de Pokémon Violet PC en YouTube](https://www.youtube.com/watch?v=tIAnTTgj0dI)

## Proyecto base y atribuciones

**Pokémon Violet PC utiliza [ScarletNX](https://github.com/scarletnx/ScarletNX) como base de desarrollo.**

Agradecemos a los autores y colaboradores de **ScarletNX** por el trabajo que sirve como punto de partida para Pokémon Violet PC.

La licencia declarada por ScarletNX es **GPL-3.0-or-later**. Sus componentes de terceros se detallan en la documentación de [licencias y créditos](https://github.com/scarletnx/ScarletNX/blob/main/docs/CREDITS.md).

- **Repositorio de origen:** [scarletnx/ScarletNX](https://github.com/scarletnx/ScarletNX).

## Aviso importante sobre los archivos del juego

> [!IMPORTANT]
> **Este repositorio no contiene, almacena ni distribuye copias de Pokémon Violet ni de otros videojuegos.**
>
> El proyecto proporciona el software cuya finalidad es traducir y adaptar para PC una copia original aportada por el propio usuario. Los archivos y recursos necesarios deben proceder de esa copia: no se incluyen con el programa ni se suministran para su descarga desde este repositorio.
>
> El usuario debe proporcionar los archivos originales requeridos para utilizar la herramienta. La distribución del programa no sustituye la adquisición del juego ni concede derechos sobre su código, sus recursos o sus contenidos.
>
> Pokémon y las demás marcas, nombres y contenidos mencionados pertenecen a sus respectivos titulares. Pokémon Violet PC es un proyecto independiente y no está afiliado, patrocinado ni respaldado por los titulares del juego original.

# English - Pokémon Violet PC

**PC adaptation using an original copy provided by the user.**

Pokémon Violet PC is a project designed to adapt Pokémon Violet to run on PC. Its purpose is to translate and adapt the original copy supplied by the user, using the files and assets from that same copy.

> [!IMPORTANT]
> **ScarletNX-based architecture: recompilation to native code with emulation components.**
>
> ScarletNX recompiles the game's ARM64 code for the PC's CPU. Its primary workflow uses ahead-of-time (AOT) compilation, while a just-in-time (JIT) compiler can translate previously uncovered code during execution.
>
> The game also uses a runtime that reproduces Nintendo Switch services through high-level emulation (HLE) and adapts Maxwell GPU graphics operations for rendering with Vulkan.
>
> **The underlying architecture combines natively recompiled code with service and graphics emulation. The ScarletNX runtime is still required.**

Base project references: [ScarletNX architecture](https://github.com/scarletnx/ScarletNX/blob/main/docs/ARCHITECTURE.md) and [JIT compilation](https://github.com/scarletnx/ScarletNX/blob/main/docs/DEPRECATIONS.md).

## Recommended System Requirements

### Installation and Execution

In addition to an original copy of the game provided by the user, the following configuration is recommended:

| Component | Recommended Requirement |
| --- | --- |
| Operating system | Windows 10. |
| Processor | Intel Core i5; model and generation to be specified. |
| RAM | 16 GB. |
| Graphics card | Graphics card and driver compatible with **Vulkan 1.3**. Recommended GPU model and video memory: to be specified. |
| Storage | 10 GB of free disk space. |

## Installation and First Launch

1. **Download the program.** Download the appropriate version of Pokémon Violet PC from the project's distribution channel.
2. **Extract the game data.** Extract the contents of **ExeFS** and **RomFS** from your original copy in **`.nsp`** format using Ryujinx's extraction features. Keep the resulting folders named `exefs` and `romfs`.
3. **Prepare the files.** Use the extracted folders in Pokémon Violet PC's import and setup process, and complete the code translation process required by the installed version.
4. **Configure and launch.** Select the available graphics and control settings, then launch the game.

## Graphics and Display

Pokémon Violet PC uses **Vulkan 1.3** as its rendering API, in line with its ScarletNX foundation, and provides the following graphics and display options:

| Setting | Specification |
| --- | --- |
| Graphics API | **Vulkan 1.3**. Currently the only rendering API specified for this version. |
| Resolutions | **720p (HD)**, **1080p (Full HD)**, **2K (upscaled)**, and **4K (upscaled)**. |
| Aspect ratio | **16:9**, **26:9**, and **automatic**. |
| Display modes | **Fullscreen** and **windowed mode**. |
| Frame rate | **30 FPS** and **60 FPS** options. |

## Controls

**Input support: keyboard and controller (joystick).**

| Category | Description |
| --- | --- |
| Devices | Keyboard and controller. |

## Extra Option

The **Extra** option becomes available once the user has a **saved game**. It provides access to two sections: **Items** and **Pokédex**.

### Items

Displays the catalog of all items obtainable in the game and allows users to manage their quantities in the inventory:

- **Add items**, even if they have not yet been obtained during the playthrough.
- **Increase or decrease item quantities.**

### Pokédex

Displays the Pokémon already registered in the **saved game's Pokédex**.

## Demo

[Watch the Pokémon Violet PC demo on YouTube](https://www.youtube.com/watch?v=tIAnTTgj0dI)

## Base Project and Attribution

**Pokémon Violet PC is based on [ScarletNX](https://github.com/scarletnx/ScarletNX).**

We thank the authors and contributors of **ScarletNX** for the work that serves as the foundation for Pokémon Violet PC.

ScarletNX is licensed under **GPL-3.0-or-later**. Its third-party components are detailed in the [licenses and credits documentation](https://github.com/scarletnx/ScarletNX/blob/main/docs/CREDITS.md).

- **Upstream repository:** [scarletnx/ScarletNX](https://github.com/scarletnx/ScarletNX).

## Important Notice Regarding Game Files

> [!IMPORTANT]
> **This repository does not contain, store, or distribute copies of Pokémon Violet or any other video games.**
>
> The project provides software intended to translate and adapt a user-provided original copy for PC. The required files and assets must come from that copy: they are not included with the program or made available for download through this repository.
>
> Users must supply the original files required to use the tool. Distribution of the software does not replace purchasing the game or grant rights to its code, assets, or content.
>
> Pokémon and all other trademarks, names, and content mentioned belong to their respective owners. Pokémon Violet PC is an independent project and is not affiliated with, sponsored by, or endorsed by the original game's rights holders.

