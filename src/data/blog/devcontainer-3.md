---
title: Vibe Coding im devcontainer Part 3
author: Tobias Geistert
pubDatetime: 2026-03-25T15:20:35Z
slug: vibe-coding-devcontainer-part-3
featured: false
draft: true
tags:
  - docker
  - devcontainer
  - dev
  - developing
  - vibecoding
description: Kurze Beschreibung des Posts

---

## Teil 3 — Zsh, Neovim, LazyVim & Claude Code — die fertige Umgebung

*Wir bauen jetzt die vollständige Konfiguration. Am Ende: ein `.devcontainer`-Ordner, den du in jedes Projekt kopieren kannst.*

**Tags:** Zsh · Neovim · LazyVim · Claude Code · Setup-Skript

### Die Strategie: Dockerfile statt nur Features

Features sind praktisch, aber für komplexere Setups (LazyVim, Zsh-Plugins, eigene Konfigurationen) ist ein eigenes `Dockerfile` flexibler. Wir kombinieren beides: Ein Basis-Image + ein Setup-Skript für alles weitere.

Das Endresultat:

```
.devcontainer/
  devcontainer.json   # Orchestrierung
  Dockerfile          # System-Tools
  setup.sh            # Zsh-Plugins, LazyVim, etc.
  .zshrc              # Shell-Konfiguration
```

### Das Dockerfile

```dockerfile
# .devcontainer/Dockerfile
FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bookworm

ENV DEBIAN_FRONTEND=noninteractive

# System-Abhaengigkeiten fuer Neovim und Zsh-Plugins
RUN apt-get update && apt-get install -y \
    curl wget git unzip zip \
    ripgrep fd-find fzf bat \
    zsh zsh-syntax-highlighting zsh-autosuggestions \
    build-essential cmake \
    && rm -rf /var/lib/apt/lists/*

# Neovim (aktuelle stabile Version direkt von GitHub)
RUN curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim-linux-x86_64.tar.gz \
    && tar xzf nvim-linux-x86_64.tar.gz -C /opt \
    && ln -sf /opt/nvim-linux-x86_64/bin/nvim /usr/local/bin/nvim \
    && rm nvim-linux-x86_64.tar.gz

# Nerd Font fuer Icons in Neovim
RUN mkdir -p /usr/share/fonts/nerd-fonts \
    && curl -LO https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip \
    && unzip -o JetBrainsMono.zip -d /usr/share/fonts/nerd-fonts && fc-cache -fv \
    && rm JetBrainsMono.zip

# Claude Code global installieren
RUN npm install -g @anthropic-ai/claude-code

# Zsh als Standard-Shell fuer den node-User setzen
RUN chsh -s /bin/zsh node
```

> **fd-find vs. fd:** Auf Debian/Ubuntu heißt das Paket `fd-find`, der Befehl aber `fdfind`. Neovim-Plugins erwarten `fd`. Das Setup-Skript legt einen Symlink an — das funktioniert problemlos.

### Das Setup-Skript

Das Dockerfile installiert System-Tools. Das Setup-Skript konfiguriert sie für den User und wird einmalig nach dem Container-Erstellen ausgeführt:

```bash
#!/usr/bin/env bash
# .devcontainer/setup.sh
set -e

# fd-Symlink (fuer Neovim-Plugins)
sudo ln -sf $(which fdfind) /usr/local/bin/fd 2>/dev/null || true

# Oh-My-Zsh installieren (falls noch nicht vorhanden)
if [ ! -d "$HOME/.oh-my-zsh" ]; then
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" \
    "" --unattended
fi

# Zsh-Plugin: zsh-autosuggestions
ZSH_CUSTOM="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"
if [ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ]; then
  git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions \
    "$ZSH_CUSTOM/plugins/zsh-autosuggestions"
fi

# Zsh-Plugin: zsh-syntax-highlighting
if [ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ]; then
  git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting \
    "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting"
fi

# Theme: powerlevel10k
if [ ! -d "$ZSH_CUSTOM/themes/powerlevel10k" ]; then
  git clone --depth=1 https://github.com/romkatv/powerlevel10k \
    "$ZSH_CUSTOM/themes/powerlevel10k"
fi

# Unsere .zshrc-Konfiguration einspielen
cp /workspaces/.devcontainer/.zshrc ~/.zshrc

# LazyVim installieren
if [ ! -d "$HOME/.config/nvim" ]; then
  echo "Installiere LazyVim..."
  git clone --depth=1 https://github.com/LazyVim/starter ~/.config/nvim
  # .git-Ordner loeschen, damit es deine eigene Konfiguration wird
  rm -rf ~/.config/nvim/.git
fi

echo "Setup abgeschlossen!"
```

### Die .zshrc Konfiguration

```bash
# .devcontainer/.zshrc

export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="powerlevel10k/powerlevel10k"

plugins=(
  git
  node
  npm
  zsh-autosuggestions
  zsh-syntax-highlighting
)

source $ZSH/oh-my-zsh.sh

# Aliases
alias v="nvim"
alias ll="ls -la"
alias bat="batcat"  # Debian nennt es batcat

# Workspace-Kuerzel
alias ws="cd /workspaces"

# fzf Keybindings aktivieren
[ -f /usr/share/doc/fzf/examples/key-bindings.zsh ] && \
  source /usr/share/doc/fzf/examples/key-bindings.zsh
```

### Die vollständige devcontainer.json

```jsonc
// .devcontainer/devcontainer.json
{
  "name": "Dev-Umgebung",

  // Eigenes Dockerfile statt eines fertigen Images
  "build": {
    "dockerfile": "Dockerfile",
    "context": "."
  },

  // Konfigurationen persistent halten (ueberleben Rebuilds)
  "mounts": [
    "source=claude-config-${devcontainerId},target=/home/node/.claude,type=volume",
    "source=nvim-data-${devcontainerId},target=/home/node/.local/share/nvim,type=volume"
  ],

  "containerEnv": {
    "CLAUDE_CONFIG_DIR": "/home/node/.claude",
    "EDITOR": "nvim"
  },

  // Als non-root User arbeiten (Sicherheit)
  "remoteUser": "node",

  // Setup einmalig nach Container-Erstellung ausfuehren
  "postCreateCommand": "bash .devcontainer/setup.sh",

  "forwardPorts": [3000, 5432]
}
```

### Claude Code einrichten

Claude Code's OAuth-Flow braucht einen Browser — den gibt es im Container nicht. Die saubere Lösung: einmalig auf dem **Host** einen langlebigen Token generieren, diesen in einer `.env`-Datei speichern, und den Container daraus lesen lassen. Credentials liegen damit nie im Code.

**Schritt 1 — Token auf dem Host generieren** (einmalig, mit Browser):

```bash
# Auf dem HOST ausführen (nicht im Container)
claude setup-token
```

Der Befehl öffnet den Browser, du loggst dich ein, und bekommst einen Token zurück — gültig für 1 Jahr. Er sieht aus wie `sk-ant-oat01-...`.

**Schritt 2 — Token in einer `.env`-Datei speichern:**

```bash
# Im Projektordner eine .env anlegen
echo "CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-dein-token-hier" >> .env
```

**Schritt 3 — `.env` aus Git ausschließen:**

```bash
# In .gitignore eintragen — Credentials gehören nicht ins Repo
echo ".env" >> .gitignore
```

> **Wichtig:** Niemals den Token committen. Die `.env` bleibt lokal auf deiner Maschine.

**Schritt 4 — Token in der `devcontainer.json` einbinden:**

Die Devcontainer-Spec unterstützt `.env`-Dateien direkt:

```jsonc
// .devcontainer/devcontainer.json
{
  "name": "Dev-Umgebung",
  "build": {
    "dockerfile": "Dockerfile",
    "context": "."
  },

  // .env aus dem Projektordner einlesen (liegt eine Ebene höher als .devcontainer/)
  "runArgs": ["--env-file", "${localWorkspaceFolder}/.env"],

  "mounts": [
    "source=nvim-data-${devcontainerId},target=/home/node/.local/share/nvim,type=volume"
  ],

  "containerEnv": {
    "EDITOR": "nvim"
  },

  "remoteUser": "node",
  "postCreateCommand": "bash .devcontainer/setup.sh",
  "forwardPorts": [3000, 5432]
}
```

Das Claude-Config-Volume aus dem vorherigen Schritt ist jetzt nicht mehr nötig — der Token kommt direkt aus der Umgebungsvariable.

**Testen:**

```bash
devcontainer up --workspace-folder .
devcontainer exec --workspace-folder . zsh

# Im Container: Token prüfen
echo $CLAUDE_CODE_OAUTH_TOKEN   # sollte sk-ant-oat01-... zeigen

# Claude Code starten
claude "Hallo, funktioniert das?"
```

> **Token läuft ab:** Der Token ist 1 Jahr gültig. Danach einmalig `claude setup-token` auf dem Host wiederholen und die `.env` aktualisieren.

### LazyVim beim ersten Start

Beim ersten Öffnen von Neovim lädt LazyVim automatisch alle Plugins herunter. Das dauert 1–2 Minuten:

```bash
# Neovim oeffnen (LazyVim laedt alle Plugins)
nvim

# Warte bis "Done" erscheint, dann mit q schliessen
# Naechster Start ist sofort schnell
```

Innerhalb von Neovim stehen diese Befehle bereit:

```
:Lazy   -> Plugin-Manager oeffnen
:Mason  -> LSP-Server installieren
```

Für JavaScript-Projekte empfehle ich, beim ersten Start die LSP-Server manuell zu installieren:

```vim
:MasonInstall typescript-language-server
:MasonInstall eslint-lsp
:MasonInstall prettier
```

### Täglicher Workflow — Zusammenfassung

```bash
# 1. Zum Projektordner gehen
cd ~/projekte/mein-projekt

# 2. Container bauen und starten (erste Male ~5 Min.)
devcontainer up --workspace-folder .

# 3. Zsh-Shell oeffnen
devcontainer exec --workspace-folder . zsh

# Jetzt in der Umgebung:
nvim src/index.js              # Neovim oeffnen
claude "Was macht diese Funktion?"  # Claude Code nutzen

# Container spaeter stoppen
exit
docker stop $(docker ps -q --filter name=mein-projekt)
```

### Dotfiles-Strategie: für mehrere Projekte

Wenn du dieselbe Umgebung in mehreren Projekten nutzen möchtest, gibt es zwei Ansätze:

**Ansatz 1 — .devcontainer kopieren**  
Den kompletten `.devcontainer`-Ordner in jedes Projekt kopieren. Einfach, aber Änderungen musst du überall machen.

**Ansatz 2 — Dotfiles-Repository** *(empfohlen)*  
Zsh-Konfiguration, LazyVim-Config und Setup-Skripte in einem eigenen Git-Repo verwalten. Der Container klont es beim Start. Änderungen einmal machen, überall aktuell.

Erstelle ein Repository (z.B. `github.com/dein-name/dotfiles`) und passe `setup.sh` an:

```bash
# In setup.sh — Dotfiles-Repository einbinden
if [ ! -d "$HOME/dotfiles" ]; then
  git clone https://github.com/dein-name/dotfiles.git ~/dotfiles
  ln -sf ~/dotfiles/.zshrc ~/.zshrc
  ln -sf ~/dotfiles/nvim ~/.config/nvim
fi
```

### Troubleshooting: häufige Probleme

#### Container startet nicht

```bash
docker ps -a
docker logs <container-id>
docker system prune
```

#### Neovim-Icons werden als Fragezeichen angezeigt

Das Terminal auf dem **Host** braucht eine Nerd Font. Lade dir "JetBrains Mono Nerd Font" oder "FiraCode Nerd Font" von [nerdfonts.com](https://www.nerdfonts.com) herunter und stelle sie als Terminal-Font ein (meistens unter Einstellungen → Erscheinungsbild → Schrift).

#### Claude Code fragt bei jedem Start nach Login

Das Mount für `~/.claude` fehlt oder hat einen falschen Pfad. Prüfe, ob `remoteUser` in `devcontainer.json` korrekt ist (`node`, nicht `root` oder `vscode`).

#### npm install schlägt fehl

Der `postCreateCommand` läuft, bevor du eingeloggt bist. Bei Problemen manuell ausführen:

```bash
devcontainer exec --workspace-folder . bash -c "npm install"
```

### Zusammenfassung Teil 3 — und der ganzen Serie

- Dockerfile für System-Tools + Setup-Skript für User-Konfiguration ist die flexibelste Kombination
- LazyVim wird über das offizielle Starter-Repo installiert und bei erstem Neovim-Start initialisiert
- Claude-Config in einem Docker Volume persistieren → Login bleibt über Rebuilds erhalten
- Zsh-Plugins (autosuggestions, syntax-highlighting, powerlevel10k) machen die Shell produktiv
- Das komplette `.devcontainer`-Setup ist in Git versioniert und in Sekunden in neuen Projekten einsatzbereit
- Nächster Schritt: Dotfiles-Repository anlegen und Setup-Skript darauf zeigen lassen
