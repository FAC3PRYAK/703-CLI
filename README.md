# F4STY

Selfbot tool para Discord. Módulos: **LootBox Reclaimer** y **Welcomes**.

## Setup

```bash
pip install discord.py-self
python fasty.py
```

Al iniciar por primera vez pedirá tu token y lo guardará en `.env`.  
Configura Guild ID, Channel ID y Bot ID desde el menú `[3] ⚙ Configuración`.

## .env esperado

```env
TOKEN=tu_token_aqui
GUILD_ID=id_del_servidor
CHANNEL_ID=id_canal_bienvenidas
LOOTBOX_BOT=id_del_bot_lootbox
WELCOME_MSG=tu mensaje aqui, usa {member} para mencionar
```

> ⚠️ Nunca subas el `.env` al repo. Ya está en `.gitignore`.
