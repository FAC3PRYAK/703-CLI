#!/usr/bin/env node
/**
 * F4STY - Selfbot Tool v2.0 (Node.js Edition)
 * Módulos: LootBox Reclaimer + Welcomes
 * Librería: discord.js-selfbot-v13
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Client } = require('discord.js-selfbot-v13');

// ─── Colores ANSI ─────────────────────────────────────────────────────────────
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const GREEN  = '\x1b[92m';
const YELLOW = '\x1b[93m';
const GRAY   = '\x1b[90m';
const CYAN   = '\x1b[96m';

const rgb = (r, g, b) => `\x1b[38;2;${r};${g};${b}m`;

const PURPLE = rgb(160, 80, 220);
const RED    = rgb(220, 50, 80);
const DIM    = rgb(100, 100, 100);
const PINK   = rgb(220, 100, 180);
const TEAL   = rgb(80, 200, 180);
const LIME   = rgb(120, 220, 80);

// ─── Log level → color ────────────────────────────────────────────────────────
const LEVEL_COLORS = {
    "READY"   : rgb(80,  200, 120),
    "SYSTEM"  : rgb(160, 80,  220),
    "LOOTBOX" : rgb(255, 180, 0),
    "SUCCESS" : rgb(80,  220, 100),
    "SKIP"    : rgb(150, 150, 150),
    "WARN"    : rgb(255, 200, 50),
    "ERROR"   : rgb(220, 50,  80),
    "WELCOME" : rgb(100, 180, 255),
    "LOGIN"   : rgb(80,  200, 180),
    "INFO"    : rgb(180, 180, 180),
    "DEBUG"   : rgb(120, 120, 120),
};

// ─── Paths ────────────────────────────────────────────────────────────────────
const BASE_DIR = __dirname;
const ENV_FILE = path.join(BASE_DIR, '.env');
const LOG_FILE = path.join(BASE_DIR, 'fasty_logs.txt');

// ─── Valores por Defecto ──────────────────────────────────────────────────────
const DEFAULT_WELCOME = (
    "⛧ Bienvenid@  {member} ⛧\n" +
    "Le invitamos a consultar la información del servidor en <#853479748700602378> para conocer las normas y directrices de la comunidad.\n" +
    "Si requiere asistencia o tiene alguna consulta, puede abrir un ticket en <#1015461275293204640>.\n" +
    "Le deseamos una agradable estancia."
);

const DEFAULT_LOOTBOX_BOT = "1149246035345035285";
const DEFAULT_GUILD_ID    = "853476944540336138";
const DEFAULT_CHANNEL_ID  = "1025583141743759431";

// ─── .env — leer / escribir todas las claves ──────────────────────────────────
function loadEnv() {
    const data = {};
    if (fs.existsSync(ENV_FILE)) {
        const content = fs.readFileSync(ENV_FILE, 'utf8');
        content.split(/\r?\n/).forEach(line => {
            if (line && line.includes('=') && !line.startsWith('#')) {
                const parts = line.split('=');
                const k = parts[0].trim();
                const v = parts.slice(1).join('=').trim();
                data[k] = v;
            }
        });
    }
    return data;
}

function saveEnv(data) {
    const lines = Object.entries(data).map(([k, v]) => `${k}=${v}`);
    fs.writeFileSync(ENV_FILE, lines.join('\n') + '\n', 'utf8');
}

function getEnv(key, defaultVal = "") {
    return loadEnv()[key] || defaultVal;
}

function setEnv(key, value) {
    const data = loadEnv();
    data[key] = value;
    saveEnv(data);
}

// ─── Utilidades ───────────────────────────────────────────────────────────────
function clear() {
    process.stdout.write('\x1Bc');
}

function log(msg, level = "INFO") {
    const ts = new Date().toLocaleTimeString('es-ES', { hour12: false });
    const color = LEVEL_COLORS[level] || GRAY;
    console.log(`  ${DIM}[${ts}]${RESET} ${color}[${level.padEnd(7)}]${RESET} ${msg}`);
    
    const plain = `[${new Date().toLocaleDateString('es-ES')} ${ts}] [${level}] ${msg.replace(/\x1b\[[^m]*m/g, '')}`;
    fs.appendFileSync(LOG_FILE, plain + '\n', 'utf8');
}

function stripAnsi(text) {
    return text.replace(/\x1b\[[^m]*m/g, '');
}

function getTerminalWidth() {
    return process.stdout.columns || 80;
}

function cprint(text, extraPad = 0) {
    const termW = getTerminalWidth();
    const visibleLen = stripAnsi(text).length;
    const pad = Math.max(0, Math.floor((termW - visibleLen) / 2)) + extraPad;
    console.log(' '.repeat(pad) + text + RESET);
}

function separator() {
    const termW = getTerminalWidth();
    const bar = '─'.repeat(44);
    const pad = Math.max(0, Math.floor((termW - bar.length) / 2));
    console.log(' '.repeat(pad) + GRAY + bar + RESET);
}

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans.trim());
    }));
}

async function cinput(promptText) {
    const termW = getTerminalWidth();
    const visible = stripAnsi(promptText).length;
    const pad = Math.max(0, Math.floor((termW - visible) / 2));
    return await askQuestion(' '.repeat(pad) + promptText);
}

// ─── Banner animado ───────────────────────────────────────────────────────────
const ASCII_LINES = [
    "  ███████╗██╗  ██╗███████╗████████╗██╗   ██╗",
    "  ██╔════╝██║  ██║██╔════╝╚══██╔══╝╚██╗ ██╔╝",
    "  █████╗  ███████║███████╗   ██║    ╚████╔╝ ",
    "  ██╔══╝  ╚════██║╚════██║   ██║     ╚██╔╝  ",
    "  ██║          ██║███████║   ██║      ██║   ",
    "  ╚═╝          ╚═╝╚══════╝   ╚═╝      ╚═╝   ",
];

function waveColor(i, offset) {
    const val = (Math.sin(i * 0.18 - offset) + 1) / 2;
    const r = Math.floor(220 * (1 - val) + 160 * val);
    const g = Math.floor(50  * (1 - val) + 80  * val);
    const b = Math.floor(80  * (1 - val) + 220 * val);
    return rgb(r, g, b);
}

function renderBanner(offset, termW) {
    let ci = 0;
    return ASCII_LINES.map(line => {
        let colored = "";
        for (const ch of line) {
            if (ch.trim()) {
                colored += waveColor(ci, offset) + ch;
                ci++;
            } else {
                colored += ch;
            }
        }
        const pad = Math.max(0, Math.floor((termW - line.length) / 2));
        return ' '.repeat(pad) + colored + RESET;
    }).join('\n');
}

function getSubline(termW) {
    const sub = "Tool F4STY v2.0";
    const by_ = "by FAC3PRYAK";
    const line = `${PURPLE}${sub}${RESET}  ${DIM}│${RESET}  ${rgb(180,100,240)}${by_}${RESET}`;
    const pad  = Math.max(0, Math.floor((termW - (sub.length + by_.length + 5)) / 2));
    return { line, pad };
}

async function animateBanner(frames = 28, fps = 18) {
    const frameDelay = 1000 / fps;
    for (let i = 0; i < frames; i++) {
        clear();
        const termW = getTerminalWidth();
        const art = renderBanner(i * 0.35, termW);
        const sub = getSubline(termW);
        process.stdout.write('\n' + art + '\n');
        process.stdout.write(' '.repeat(sub.pad) + sub.line + '\n');
        await new Promise(r => setTimeout(r, frameDelay));
    }
}

async function banner(animate = false) {
    if (animate) {
        await animateBanner();
        return;
    }
    clear();
    const termW = getTerminalWidth();
    const art = renderBanner(0.0, termW);
    const sub = getSubline(termW);
    console.log('\n' + art + '\n');
    console.log(' '.repeat(sub.pad) + sub.line + '\n');
}

// ─── Validación de token ──────────────────────────────────────────────────────
function isValidToken(token) {
    if (!token || /[\s\n\t\r]/.test(token)) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [p1, p2, p3] = parts;
    const b64 = /^[A-Za-z0-9_\-]+$/;
    if (!b64.test(p1) || p1.length < 20) return false;
    if (!b64.test(p2) || p2.length < 4 || p2.length > 10) return false;
    if (!b64.test(p3) || p3.length < 25) return false;
    return true;
}

async function promptToken(change = false) {
    while (true) {
        await banner();
        separator();
        const label = change ? "Cambiar token" : "Ingresa tu token de cuenta Discord";
        cprint(`${YELLOW}⚠  ${label}${RESET}`);
        separator();
        console.log();
        cprint(`${GRAY}Formato: xxxxxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxx${RESET}`);
        console.log();
        const token = await cinput(`${PURPLE}Token:${RESET} `);

        if (!token) {
            cprint(`${RED}✗ No ingresaste nada${RESET}`);
            await new Promise(r => setTimeout(r, 1200));
            continue;
        }

        if (!isValidToken(token)) {
            console.log();
            cprint(`${RED}✗ Token inválido — revisa que esté completo y sin espacios${RESET}`);
            cprint(`${GRAY}Debe tener 3 partes: parte1.parte2.parte3${RESET}`);
            console.log();
            await cinput(`${GRAY}Presiona Enter para intentar de nuevo...${RESET}`);
            continue;
        }

        setEnv("TOKEN", token);
        console.log();
        cprint(`${GREEN}✓ Token guardado${RESET}`);
        await new Promise(r => setTimeout(r, 1000));
        return token;
    }
}

// ─── Mensaje de bienvenida ────────────────────────────────────────────────────
function getWelcomeMsg() {
    const raw = getEnv("WELCOME_MSG", "");
    if (!raw) return DEFAULT_WELCOME;
    return raw.replace(/\\n/g, '\n');
}

async function promptWelcomeMsg() {
    await banner();
    separator();
    cprint(`${PURPLE}[Welcomes]${RESET} — Configurar mensaje`);
    separator();
    console.log();
    cprint(`${YELLOW}Tip:${RESET} usa {member} para mencionar al nuevo usuario`);
    cprint(`${GRAY}Escribe tu mensaje y finaliza escribiendo "FIN" en una línea nueva y presionando Enter${RESET}`);
    console.log();

    const termW = getTerminalWidth();
    const pad = Math.max(0, Math.floor((termW - 26) / 2));
    console.log(' '.repeat(pad) + `${PURPLE}Pega tu bienvenida aquí:${RESET}`);
    console.log(' '.repeat(pad) + `${GRAY}──────────────────────────${RESET}`);

    const lines = [];
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    await new Promise(resolve => {
        rl.on('line', (line) => {
            if (line.trim() === 'FIN') {
                rl.close();
                resolve();
                return;
            }
            lines.push(line);
        });
    });

    const msg = lines.length ? lines.join('\n') : DEFAULT_WELCOME;
    setEnv("WELCOME_MSG", msg.replace(/\n/g, "\\n"));
    console.log();
    cprint(`${GREEN}✓ Mensaje guardado${RESET}`);
    await new Promise(r => setTimeout(r, 1000));
}

async function configMenu() {
    while (true) {
        await banner();
        separator();
        cprint(`${PURPLE}[⚙  Configuración]${RESET}`);
        separator();
        console.log();

        const welcome = getWelcomeMsg().replace(/\n/g, "\\n");
        const wPreview = welcome.length > 50 ? welcome.slice(0, 50) + "..." : welcome;

        cprint(`${PURPLE}[1]${RESET} Mensaje bienvenida  ${GRAY}→${RESET} ${CYAN}${wPreview}${RESET}`);
        cprint(`${DIM}[0]${RESET} Volver al menú`);
        console.log();

        const choice = await cinput(`${PURPLE}Select:${RESET} `);

        if (choice === "1") {
            await promptWelcomeMsg();
        } else if (choice === "0") {
            return;
        } else {
            cprint(`${RED}✗ Opción inválida${RESET}`);
            await new Promise(r => setTimeout(r, 700));
        }
    }
}

// ─── Selector de tiempo ───────────────────────────────────────────────────────
async function selectDelay(moduleName) {
    while (true) {
        await banner();
        separator();
        cprint(`${PURPLE}[${moduleName}]${RESET} — Tiempo de espera antes de actuar`);
        separator();
        console.log();
        cprint(`${PURPLE}[1]${RESET} 1.5 segundos`);
        cprint(`${PURPLE}[2]${RESET} 2   segundos`);
        cprint(`${PURPLE}[3]${RESET} 3   segundos`);
        cprint(`${PURPLE}[4]${RESET} Personalizado`);
        cprint(`${DIM}[0]${RESET} Volver al menú`);
        console.log();
        const choice = await cinput(`${PURPLE}Selecciona:${RESET} `);
        const opts = { "1": 1.5, "2": 2.0, "3": 3.0 };
        if (choice === "0") {
            return null;
        } else if (choice in opts) {
            const delay = opts[choice];
            cprint(`${GREEN}✓ Delay: ${delay}s${RESET}`);
            await new Promise(r => setTimeout(r, 800));
            return delay;
        } else if (choice === "4") {
            try {
                const valStr = await cinput(`${PURPLE}Segundos (ej: 2.5):${RESET} `);
                const val = parseFloat(valStr);
                if (isNaN(val) || val <= 0) throw new Error();
                cprint(`${GREEN}✓ Delay: ${val}s${RESET}`);
                await new Promise(r => setTimeout(r, 800));
                return val;
            } catch (err) {
                cprint(`${RED}✗ Valor inválido${RESET}`);
                await new Promise(r => setTimeout(r, 700));
            }
        } else {
            cprint(`${RED}✗ Opción no válida${RESET}`);
            await new Promise(r => setTimeout(r, 700));
        }
    }
}

// ─── MÓDULO 1: LootBox Reclaimer ──────────────────────────────────────────────
async function runLootbox(token, delay) {
    const targetBot = getEnv("LOOTBOX_BOT", DEFAULT_LOOTBOX_BOT);
    
    await banner();
    separator();
    cprint(`${PURPLE}[🎁 LootBox Reclaimer]${RESET} — En vivo`);
    cprint(`${GRAY}Delay: ${delay}s  │  Escuchando bot: ${targetBot}${RESET}`);
    separator();
    console.log();
    cprint(`${YELLOW}Ctrl+C para detener y volver${RESET}`);
    console.log();

    const client = new Client({ checkUpdate: false });
    const processed = new Set();

    async function handle(message) {
        if (processed.has(message.id)) return;
        if (message.author.id !== targetBot) return;

        const embed = message.embeds?.[0];
        if (!embed) return;

        const raw = [
            embed.title || '',
            embed.description || '',
            embed.fields?.map(f => `${f.name} ${f.value}`).join('\n') || ''
        ].join('\n');

        const upper = raw.toUpperCase();
        if (
            upper.includes('RECLAMADA') ||
            upper.includes('YA HA SIDO RECLAMADA') ||
            upper.includes('RECOMPENSA OBTENIDA')
        ) {
            log("⛔ LootBox ya reclamada", "SKIP");
            processed.add(message.id);
            return;
        }

        const match = raw.match(/c[oó]digo[^A-Z0-9]*[`*"\']*([A-Z0-9]{4,20})[`*"\']*/i);
        if (!match) return;

        const codigo = match[1];
        log(`🎁 Detectada — código: ${rgb(255,220,50)}${codigo}${RESET}`, "LOOTBOX");
        processed.add(message.id);

        await new Promise(r => setTimeout(r, delay * 1000));
        try {
            await message.channel.send(codigo);
            log(`✅ Enviado: ${rgb(120,255,120)}${codigo}${RESET}`, "SUCCESS");
        } catch (err) {
            log(`Error enviando: ${err.message}`, "ERROR");
        }
    }

    client.on('ready', () => {
        log(`Conectado como ${rgb(180,100,255)}${client.user.tag}${RESET}`, "READY");
        log("🚀 LootBox Reclaimer activo", "SYSTEM");
    });

    client.on('messageCreate', handle);
    client.on('messageUpdate', (_, after) => handle(after));

    try {
        await client.login(token);
        await new Promise((_, reject) => {
            process.once('SIGINT', () => {
                client.destroy();
                reject(new Error("Detenido por el usuario"));
            });
        });
    } catch (err) {
        console.log();
        if (err.message !== "Detenido por el usuario") {
            cprint(`${RED}✗ Error: ${err.message}${RESET}`);
            await cinput(`${GRAY}Presiona Enter para volver...${RESET}`);
        }
    }
}

// ─── MÓDULO 2: Welcomes ───────────────────────────────────────────────────────
async function runWelcomes(token, delay) {
    const guildId = getEnv("GUILD_ID", DEFAULT_GUILD_ID);
    const channelId = getEnv("CHANNEL_ID", DEFAULT_CHANNEL_ID);
    const welcomeTemplate = getWelcomeMsg();

    await banner();
    separator();
    cprint(`${PURPLE}[⛧ Welcomes]${RESET} — En vivo`);
    cprint(`${GRAY}Delay: ${delay}s  │  Canal: {channelId}${RESET}`);
    separator();
    console.log();
    cprint(`${YELLOW}Ctrl+C para detener y volver${RESET}`);
    console.log();

    const client = new Client({ checkUpdate: false });

    client.on('ready', () => {
        log(`Conectado como ${rgb(180,100,255)}${client.user.tag}${RESET}`, "READY");
        log("⛧ Welcomes activo", "SYSTEM");
    });

    client.on('guildMemberAdd', async (member) => {
        if (member.guild.id !== guildId) return;
        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel) return;
            await new Promise(r => setTimeout(r, delay * 1000));
            const msg = welcomeTemplate.replace(/{member}/g, `<@${member.id}>`);
            await channel.send(msg);
            log(`⛧ Bienvenida → ${rgb(100,180,255)}${member.user.tag}${RESET}`, "WELCOME");
        } catch (err) {
            log(`Error welcome: ${err.message}`, "ERROR");
        }
    });

    try {
        await client.login(token);
        await new Promise((_, reject) => {
            process.once('SIGINT', () => {
                client.destroy();
                reject(new Error("Detenido por el usuario"));
            });
        });
    } catch (err) {
        console.log();
        if (err.message !== "Detenido por el usuario") {
            cprint(`${RED}✗ Error: ${err.message}${RESET}`);
            await cinput(`${GRAY}Presiona Enter para volver...${RESET}`);
        }
    }
}

// ─── MÓDULO 3: Wel-Box (LootBox + Welcomes simultáneos) ───────────────────────────
async function runWelbox(token, delayBox, delayWelcome) {
    const targetBot = getEnv("LOOTBOX_BOT", DEFAULT_LOOTBOX_BOT);
    const guildId = getEnv("GUILD_ID", DEFAULT_GUILD_ID);
    const channelId = getEnv("CHANNEL_ID", DEFAULT_CHANNEL_ID);
    const welcomeTemplate = getWelcomeMsg();

    await banner();
    separator();
    cprint(`${PURPLE}[🎁⛧ Wel-Box]${RESET} — Ambos módulos en vivo`);
    cprint(`${GRAY}LootBox delay: ${delayBox}s  │  Welcome delay: ${delayWelcome}s${RESET}`);
    separator();
    console.log();
    cprint(`${YELLOW}Ctrl+C para detener y volver${RESET}`);
    console.log();

    const client = new Client({ checkUpdate: false });
    const processed = new Set();

    async function handleLootbox(message) {
        if (processed.has(message.id)) return;
        if (message.author.id !== targetBot) return;

        const embed = message.embeds?.[0];
        if (!embed) return;

        const raw = [
            embed.title || '',
            embed.description || '',
            embed.fields?.map(f => `${f.name} ${f.value}`).join('\n') || ''
        ].join('\n');

        const upper = raw.toUpperCase();
        if (
            upper.includes('RECLAMADA') ||
            upper.includes('YA HA SIDO RECLAMADA') ||
            upper.includes('RECOMPENSA OBTENIDA')
        ) {
            log("⛔ LootBox ya reclamada", "SKIP");
            processed.add(message.id);
            return;
        }

        const match = raw.match(/c[oó]digo[^A-Z0-9]*[`*"\']*([A-Z0-9]{4,20})[`*"\']*/i);
        if (!match) return;

        const codigo = match[1];
        log(`🎁 Detectada — código: ${rgb(255,220,50)}${codigo}${RESET}`, "LOOTBOX");
        processed.add(message.id);

        await new Promise(r => setTimeout(r, delayBox * 1000));
        try {
            await message.channel.send(codigo);
            log(`✅ Enviado: ${rgb(120,255,120)}${codigo}${RESET}`, "SUCCESS");
        } catch (err) {
            log(`Error enviando código: ${err.message}`, "ERROR");
        }
    }

    client.on('ready', () => {
        log(`Conectado como ${rgb(180,100,255)}${client.user.tag}${RESET}`, "READY");
        log("🎁 LootBox Reclaimer activo", "SYSTEM");
        log("⛧ Welcomes activo", "SYSTEM");
    });

    client.on('messageCreate', handleLootbox);
    client.on('messageUpdate', (_, after) => handleLootbox(after));

    client.on('guildMemberAdd', async (member) => {
        if (member.guild.id !== guildId) return;
        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel) return;
            await new Promise(r => setTimeout(r, delayWelcome * 1000));
            const msg = welcomeTemplate.replace(/{member}/g, `<@${member.id}>`);
            await channel.send(msg);
            log(`⛧ Bienvenida → ${rgb(100,180,255)}${member.user.tag}${RESET}`, "WELCOME");
        } catch (err) {
            log(`Error welcome: ${err.message}`, "ERROR");
        }
    });

    try {
        await client.login(token);
        await new Promise((_, reject) => {
            process.once('SIGINT', () => {
                client.destroy();
                reject(new Error("Detenido por el usuario"));
            });
        });
    } catch (err) {
        console.log();
        if (err.message !== "Detenido por el usuario") {
            cprint(`${RED}✗ Error: ${err.message}${RESET}`);
            await cinput(`${GRAY}Presiona Enter para volver...${RESET}`);
        }
    }
}

// ─── Menú principal ───────────────────────────────────────────────────────────
async function mainMenu(token, firstRun = false) {
    let first = firstRun;
    while (true) {
        await banner(first);
        first = false;
        separator();
        cprint(`${PURPLE}[1]${RESET} 🎁  LootBox Reclaimer`);
        cprint(`${PURPLE}[2]${RESET} ⛧   Welcomes`);
        cprint(`${PURPLE}[3]${RESET} 🎁⛧  Wel-Box  ${GRAY}(ambos a la vez)${RESET}`);
        cprint(`${PURPLE}[4]${RESET} ⚙   Configuración`);
        cprint(`${PURPLE}[5]${RESET} 🔑  Cambiar token`);
        cprint(`${PURPLE}[0]${RESET} ✕   Salir`);
        separator();
        cprint(`${DIM}Token: ${token.slice(0, 20)}...${RESET}`);
        console.log();

        const choice = await cinput(`${PURPLE}Select an option:${RESET} `);

        if (choice === "1") {
            const delay = await selectDelay("LootBox Reclaimer");
            if (delay !== null) {
                await runLootbox(token, delay);
            }
        } else if (choice === "2") {
            const delay = await selectDelay("Welcomes");
            if (delay !== null) {
                await runWelcomes(token, delay);
            }
        } else if (choice === "3") {
            await banner();
            separator();
            cprint(`${PURPLE}[🎁⛧ Wel-Box]${RESET} — Configurar tiempos`);
            separator();
            console.log();
            cprint(`${GRAY}Primero configura el delay de la LootBox${RESET}`);
            console.log();
            const delayBox = await selectDelay("LootBox");
            if (delayBox === null) continue;
            cprint(`${GRAY}Ahora el delay de la Bienvenida${RESET}`);
            console.log();
            const delayWelcome = await selectDelay("Welcomes");
            if (delayWelcome === null) continue;
            await runWelbox(token, delayBox, delayWelcome);
        } else if (choice === "4") {
            await configMenu();
        } else if (choice === "5") {
            token = await promptToken(true);
        } else if (choice === "0") {
            clear();
            console.log();
            cprint(`${PURPLE}F4STY${RESET} — Hasta luego ⛧`);
            console.log();
            process.exit(0);
        } else {
            cprint(`${RED}✗ Opción inválida${RESET}`);
            await new Promise(r => setTimeout(r, 700));
        }
    }
}

// ─── Entry Point ──────────────────────────────────────────────────────────────
async function main() {
    let token = getEnv("TOKEN");
    if (!token) {
        token = await promptToken();
    }
    await mainMenu(token, true);
}

main().catch(err => {
    console.error("Error crítico en ejecución:", err);
});
