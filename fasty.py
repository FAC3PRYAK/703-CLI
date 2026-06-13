#!/usr/bin/env python3
"""
F4STY - Selfbot Tool  v2.0
Módulos: LootBox Reclaimer + Welcomes
"""

import os
import sys
import time
import math
import asyncio
import shutil
import re
from pathlib import Path
from datetime import datetime

# ─── Colores ANSI ─────────────────────────────────────────────────────────────
RESET  = '\033[0m'
BOLD   = '\033[1m'
GREEN  = '\033[92m'
YELLOW = '\033[93m'
GRAY   = '\033[90m'
CYAN   = '\033[96m'

def rgb(r, g, b): return f'\033[38;2;{r};{g};{b}m'

PURPLE = rgb(160, 80, 220)
RED    = rgb(220, 50, 80)
DIM    = rgb(100, 100, 100)
PINK   = rgb(220, 100, 180)
TEAL   = rgb(80, 200, 180)
LIME   = rgb(120, 220, 80)

# ─── Log level → color ────────────────────────────────────────────────────────
LEVEL_COLORS = {
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
}

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
ENV_FILE = BASE_DIR / ".env"
LOG_FILE = BASE_DIR / "fasty_logs.txt"

# ─── Utilidades ───────────────────────────────────────────────────────────────

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')


def log(msg: str, level: str = "INFO"):
    """Log con colores en terminal + archivo plano."""
    ts    = datetime.now().strftime("%H:%M:%S")
    color = LEVEL_COLORS.get(level, GRAY)
    # Timestamp dim, corchete de nivel coloreado, mensaje
    print(f"  {DIM}[{ts}]{RESET} {color}[{level:<7}]{RESET} {msg}")
    # Al archivo sin escapes ANSI
    plain = f"[{datetime.now().strftime('%d/%m/%Y %H:%M:%S')}] [{level}] {msg}"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(plain + "\n")


def strip_ansi(text: str) -> str:
    return re.sub(r'\033\[[^m]*m', '', text)


def cprint(text: str, extra_pad: int = 0):
    """Imprime texto centrado en la terminal."""
    term_w = shutil.get_terminal_size((80, 24)).columns
    visible_len = len(strip_ansi(text))
    pad = max(0, (term_w - visible_len) // 2) + extra_pad
    print(f"{' ' * pad}{text}{RESET}")


def separator():
    term_w = shutil.get_terminal_size((80, 24)).columns
    bar = '─' * 44
    pad = max(0, (term_w - len(bar)) // 2)
    print(f"{' ' * pad}{GRAY}{bar}{RESET}")


def cinput(prompt: str) -> str:
    """Input centrado en la terminal."""
    term_w  = shutil.get_terminal_size((80, 24)).columns
    visible = len(strip_ansi(prompt))
    pad     = max(0, (term_w - visible) // 2)
    return input(f"{' ' * pad}{prompt}").strip()


# ─── Banner animado ───────────────────────────────────────────────────────────
ASCII_LINES = [
    "  ███████╗██╗  ██╗███████╗████████╗██╗   ██╗",
    "  ██╔════╝██║  ██║██╔════╝╚══██╔══╝╚██╗ ██╔╝",
    "  █████╗  ███████║███████╗   ██║    ╚████╔╝ ",
    "  ██╔══╝  ╚════██║╚════██║   ██║     ╚██╔╝  ",
    "  ██║          ██║███████║   ██║      ██║   ",
    "  ╚═╝          ╚═╝╚══════╝   ╚═╝      ╚═╝   ",
]


def wave_color(i: int, offset: float) -> str:
    val = (math.sin(i * 0.18 - offset) + 1) / 2
    r = int(220 * (1 - val) + 160 * val)
    g = int(50  * (1 - val) + 80  * val)
    b = int(80  * (1 - val) + 220 * val)
    return rgb(r, g, b)


def render_banner(offset: float, term_w: int) -> str:
    lines_out, ci = [], 0
    for line in ASCII_LINES:
        colored = ""
        for ch in line:
            if ch.strip():
                colored += wave_color(ci, offset) + ch
                ci += 1
            else:
                colored += ch
        pad = max(0, (term_w - len(line)) // 2)
        lines_out.append(" " * pad + colored + RESET)
    return "\n".join(lines_out)


def _subline(term_w: int) -> tuple[str, int]:
    sub = "Tool F4STY v2.0"
    by_ = "by FAC3PRYAK"
    line = f"{PURPLE}{sub}{RESET}  {DIM}│{RESET}  {rgb(180,100,240)}{by_}{RESET}"
    pad  = max(0, (term_w - len(sub) - len(by_) - 5) // 2)
    return line, pad


def animate_banner(frames: int = 28, fps: float = 18):
    term_w = shutil.get_terminal_size((80, 24)).columns
    subline, subpad = _subline(term_w)
    for i in range(frames):
        art = render_banner(i * 0.35, term_w)
        sys.stdout.write("\033[H")
        sys.stdout.write("\n" + art + "\n")
        sys.stdout.write(" " * subpad + subline + "\n")
        sys.stdout.flush()
        time.sleep(1 / fps)


def banner(animate: bool = False):
    clear()
    term_w = shutil.get_terminal_size((80, 24)).columns
    if animate:
        animate_banner()
        return
    subline, subpad = _subline(term_w)
    print()
    print(render_banner(0.0, term_w))
    print(" " * subpad + subline + "\n")


# ─── .env — leer / escribir todas las claves ──────────────────────────────────

def load_env() -> dict:
    """Devuelve todas las claves del .env como dict."""
    data = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                data[k.strip()] = v.strip()
    return data


def save_env(data: dict):
    """Escribe el dict completo en el .env."""
    lines = [f"{k}={v}" for k, v in data.items()]
    ENV_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")


def get_env(key: str, default: str = "") -> str:
    return load_env().get(key, default)


def set_env(key: str, value: str):
    data = load_env()
    data[key] = value
    save_env(data)


# ─── Validación de token ──────────────────────────────────────────────────────

def is_valid_token(token: str) -> bool:
    """
    Validación estricta de token Discord.
    Estructura: <user_id_b64>.<timestamp_b64>.<hmac>
      Parte 1 ≥ 20 chars | Parte 2: 4-10 chars | Parte 3 ≥ 25 chars
    Solo base64url: A-Z a-z 0-9 _ -
    """
    if not token or any(c in token for c in (' ', '\n', '\t', '\r')):
        return False
    parts = token.split('.')
    if len(parts) != 3:
        return False
    p1, p2, p3 = parts
    b64 = re.compile(r'^[A-Za-z0-9_\-]+$')
    if not b64.fullmatch(p1) or len(p1) < 20:       return False
    if not b64.fullmatch(p2) or not (4 <= len(p2) <= 10): return False
    if not b64.fullmatch(p3) or len(p3) < 25:       return False
    return True


def prompt_token(change: bool = False) -> str:
    """Pide y valida el token; no avanza hasta tener uno correcto."""
    while True:
        banner()
        separator()
        label = "Cambiar token" if change else "Ingresa tu token de cuenta Discord"
        cprint(f"{YELLOW}⚠  {label}{RESET}")
        separator()
        print()
        cprint(f"{GRAY}Formato: xxxxxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxx{RESET}")
        print()
        token = cinput(f"{PURPLE}Token:{RESET} ")

        if not token:
            cprint(f"{RED}✗ No ingresaste nada{RESET}")
            time.sleep(1.2)
            continue

        if not is_valid_token(token):
            print()
            cprint(f"{RED}✗ Token inválido — revisa que esté completo y sin espacios{RESET}")
            cprint(f"{GRAY}Debe tener 3 partes: parte1.parte2.parte3{RESET}")
            print()
            cinput(f"{GRAY}Presiona Enter para intentar de nuevo...{RESET}")
            continue

        set_env("TOKEN", token)
        print()
        cprint(f"{GREEN}✓ Token guardado{RESET}")
        time.sleep(1)
        return token


# ─── Configuración de Guild/Channel ──────────────────────────────────────────

def config_menu():
    """Configuración: solo mensaje de bienvenida."""
    while True:
        banner()
        separator()
        cprint(f"{PURPLE}[⚙  Configuración]{RESET}")
        separator()
        print()

        welcome = get_env("WELCOME_MSG", "No configurado")
        w_preview = (welcome[:50] + "...") if len(welcome) > 50 else welcome

        cprint(f"{PURPLE}[1]{RESET} Mensaje bienvenida  {GRAY}→{RESET} {CYAN}{w_preview}{RESET}")
        cprint(f"{DIM}[0]{RESET} Volver al menú")
        print()

        choice = cinput(f"{PURPLE}Select:{RESET} ")

        if choice == "1":
            prompt_welcome_msg()
        elif choice == "0":
            return
        else:
            cprint(f"{RED}✗ Opción inválida{RESET}"); time.sleep(0.7)


# ─── Mensaje de bienvenida ────────────────────────────────────────────────────

def prompt_welcome_msg():
    """Pide el mensaje de bienvenida, lo guarda en .env."""
    banner()
    separator()
    cprint(f"{PURPLE}[Welcomes]{RESET} — Configurar mensaje")
    separator()
    print()
    cprint(f"{YELLOW}Tip:{RESET} usa {{member}} para mencionar al nuevo usuario")
    cprint(f"{GRAY}Termina con una línea vacía (Enter dos veces){RESET}")
    print()

    term_w = shutil.get_terminal_size((80, 24)).columns
    pad = max(0, (term_w - 26) // 2)
    print(f"{' ' * pad}{PURPLE}Pega tu bienvenida aquí:{RESET}")
    print(f"{' ' * pad}{GRAY}{'─' * 26}{RESET}")

    lines = []
    while True:
        line = input()
        if line == "" and lines:
            break
        lines.append(line)

    msg = "\n".join(lines) if lines else "⛧ Bienvenid@ {member} ⛧"
    # Guardar en .env escapando saltos de línea con \n literal
    set_env("WELCOME_MSG", msg.replace("\n", "\\n"))
    print()
    cprint(f"{GREEN}✓ Mensaje guardado{RESET}")
    time.sleep(1)


def get_welcome_msg() -> str:
    """Lee el mensaje del .env y restaura los saltos de línea."""
    raw = get_env("WELCOME_MSG", "")
    if not raw:
        return "⛧ Bienvenid@ {member} ⛧"
    return raw.replace("\\n", "\n")


# ─── Selector de tiempo ───────────────────────────────────────────────────────

def select_delay(module_name: str) -> float | None:
    """Retorna float con el delay, o None si el usuario elige volver."""
    while True:
        banner()
        separator()
        cprint(f"{PURPLE}[{module_name}]{RESET} — Tiempo de espera antes de actuar")
        separator()
        print()
        cprint(f"{PURPLE}[1]{RESET} 1.5 segundos")
        cprint(f"{PURPLE}[2]{RESET} 2   segundos")
        cprint(f"{PURPLE}[3]{RESET} 3   segundos")
        cprint(f"{PURPLE}[4]{RESET} Personalizado")
        cprint(f"{DIM}[0]{RESET} Volver al menú")
        print()
        choice = cinput(f"{PURPLE}Selecciona:{RESET} ")
        opts = {"1": 1.5, "2": 2.0, "3": 3.0}
        if choice == "0":
            return None
        elif choice in opts:
            delay = opts[choice]
            cprint(f"{GREEN}✓ Delay: {delay}s{RESET}"); time.sleep(0.8)
            return delay
        elif choice == "4":
            try:
                val = float(cinput(f"{PURPLE}Segundos (ej: 2.5):{RESET} "))
                if val <= 0: raise ValueError
                cprint(f"{GREEN}✓ Delay: {val}s{RESET}"); time.sleep(0.8)
                return val
            except ValueError:
                cprint(f"{RED}✗ Valor inválido{RESET}"); time.sleep(0.7)
        else:
            cprint(f"{RED}✗ Opción no válida{RESET}"); time.sleep(0.7)


# ─── MÓDULO 1: LootBox Reclaimer ──────────────────────────────────────────────

def run_lootbox(token: str, delay: float):
    try:
        import discord
    except ImportError:
        cprint(f"{RED}✗ Instala: pip install discord.py-self{RESET}")
        cinput(f"{GRAY}Enter para volver...{RESET}"); return

    target_bot = get_env("LOOTBOX_BOT", "1149246035345035285")

    banner()
    separator()
    cprint(f"{PURPLE}[🎁 LootBox Reclaimer]{RESET} — En vivo")
    cprint(f"{GRAY}Delay: {delay}s  │  Escuchando bot: {target_bot}{RESET}")
    separator()
    print()
    cprint(f"{YELLOW}Ctrl+C para detener{RESET}")
    print()

    processed = set()

    async def handle(message):
        if message.id in processed:
            return
        if str(message.author.id) != target_bot:
            return

        embed = message.embeds[0] if message.embeds else None
        if not embed:
            return

        raw = "\n".join([
            embed.title or "",
            embed.description or "",
            "\n".join(f"{f.name} {f.value}" for f in (embed.fields or []))
        ])

        upper = raw.upper()
        if any(k in upper for k in ["RECLAMADA", "YA HA SIDO RECLAMADA", "RECOMPENSA OBTENIDA"]):
            log("⛔ LootBox ya reclamada", "SKIP")
            processed.add(message.id)
            return

        match = re.search(r'c[oó]digo[^A-Z0-9]*[`*"\']*([A-Z0-9]{4,20})[`*"\']*', raw, re.IGNORECASE)
        if not match:
            return

        codigo = match.group(1)
        log(f"🎁 Detectada — código: {rgb(255,220,50)}{codigo}{RESET}", "LOOTBOX")
        processed.add(message.id)

        await asyncio.sleep(delay)
        try:
            await message.channel.send(codigo)
            log(f"✅ Enviado: {rgb(120,255,120)}{codigo}{RESET}", "SUCCESS")
        except Exception as e:
            log(f"Error enviando: {e}", "ERROR")

    client = discord.Client()

    @client.event
    async def on_ready():
        log(f"Conectado como {rgb(180,100,255)}{client.user}{RESET}", "READY")
        log("🚀 LootBox Reclaimer activo", "SYSTEM")

    @client.event
    async def on_message(message):
        await handle(message)

    @client.event
    async def on_message_edit(_, after):
        await handle(after)

    try:
        client.run(token, bot=False)
    except KeyboardInterrupt:
        pass
    except Exception as e:
        print()
        cprint(f"{RED}✗ Error: {e}{RESET}")
        cinput(f"{GRAY}Enter para volver...{RESET}")


# ─── MÓDULO 2: Welcomes ───────────────────────────────────────────────────────

def run_welcomes(token: str, delay: float):
    try:
        import discord
    except ImportError:
        cprint(f"{RED}✗ Instala: pip install discord.py-self{RESET}")
        cinput(f"{GRAY}Enter para volver...{RESET}"); return

    guild_id   = get_env("GUILD_ID",   "853476944540336138")
    channel_id = get_env("CHANNEL_ID", "1025583141743759431")

    # Si no hay mensaje guardado, pedirlo ahora
    welcome_template = get_welcome_msg()
    if welcome_template == "⛧ Bienvenid@ {member} ⛧" and not get_env("WELCOME_MSG"):
        welcome_template = (prompt_welcome_msg() or welcome_template)
        welcome_template = get_welcome_msg()

    banner()
    separator()
    cprint(f"{PURPLE}[⛧ Welcomes]{RESET} — En vivo")
    cprint(f"{GRAY}Delay: {delay}s  │  Canal: {channel_id}{RESET}")
    separator()
    print()
    cprint(f"{YELLOW}Ctrl+C para detener{RESET}")
    print()

    client = discord.Client()

    @client.event
    async def on_ready():
        log(f"Conectado como {rgb(180,100,255)}{client.user}{RESET}", "READY")
        log("⛧ Welcomes activo", "SYSTEM")

    @client.event
    async def on_member_join(member):
        if str(member.guild.id) != guild_id:
            return
        try:
            channel = client.get_channel(int(channel_id)) \
                      or await client.fetch_channel(int(channel_id))
            if not channel:
                return
            await asyncio.sleep(delay)
            msg = welcome_template.replace("{member}", member.mention)
            await channel.send(msg)
            log(f"⛧ Bienvenida → {rgb(100,180,255)}{member}{RESET}", "WELCOME")
        except Exception as e:
            log(f"Error: {e}", "ERROR")

    try:
        client.run(token, bot=False)
    except KeyboardInterrupt:
        pass
    except Exception as e:
        print()
        cprint(f"{RED}✗ Error: {e}{RESET}")
        cinput(f"{GRAY}Enter para volver...{RESET}")


# ─── Menú principal ───────────────────────────────────────────────────────────

def main_menu(token: str, first_run: bool = False):
    first = first_run
    while True:
        banner(animate=first)
        first = False
        separator()
        cprint(f"{PURPLE}[1]{RESET} 🎁  LootBox Reclaimer")
        cprint(f"{PURPLE}[2]{RESET} ⛧   Welcomes")
        cprint(f"{PURPLE}[3]{RESET} ⚙   Configuración")
        cprint(f"{PURPLE}[4]{RESET} 🔑  Cambiar token")
        cprint(f"{PURPLE}[0]{RESET} ✕   Salir")
        separator()
        cprint(f"{DIM}Token: {token[:20]}...{RESET}")
        print()

        choice = cinput(f"{PURPLE}Select an option:{RESET} ")

        if choice == "1":
            delay = select_delay("LootBox Reclaimer")
            if delay is not None:
                run_lootbox(token, delay)

        elif choice == "2":
            delay = select_delay("Welcomes")
            if delay is not None:
                run_welcomes(token, delay)

        elif choice == "3":
            config_menu()

        elif choice == "4":
            token = prompt_token(change=True)

        elif choice == "0":
            clear()
            print()
            cprint(f"{PURPLE}F4STY{RESET} — Hasta luego ⛧")
            print()
            sys.exit(0)

        else:
            cprint(f"{RED}✗ Opción inválida{RESET}")
            time.sleep(0.7)


# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if os.name == 'nt':
        os.system('color')

    token = get_env("TOKEN")
    if not token:
        token = prompt_token()

    main_menu(token, first_run=True)
