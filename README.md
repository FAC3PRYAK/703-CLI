# F4STY

Selfbot tool para Discord en Node.js. Módulos: **LootBox Reclaimer** y **Welcomes**.

## Requisitos

* Node.js v16+
* npm
* discord.js-selfbot-v13 (Se instala ejecutando: npm install)

## Instalación de dependencias

```bash
npm install
```

## Ejecución

```bash
npm start
```
o
```bash
node fasty.js
```

Al iniciar por primera vez pedirá tu token de Discord y lo guardará en `.env`.
El mensaje de bienvenida se puede configurar en la opción `[4] ⚙ Configuración`.

## .env esperado

El archivo `.env` se crea y edita automáticamente por la CLI:

```env
TOKEN=tu_token_aqui
WELCOME_MSG=tu_mensaje_de_bienvenida_aqui
```
