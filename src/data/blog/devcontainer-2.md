---
title: Vibe Coding im Devcontainer Part 2
author: Tobias Geistert
pubDatetime: 2026-03-25T15:20:35Z
slug: vibe-coding-devcontainer-part-2
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

## Teil 2 — Devcontainer CLI installieren & erste Konfiguration

_Von null zum ersten laufenden Container — Schritt für Schritt. Kein VS Code erforderlich._

**Tags:** Installation · CLI · Konfiguration · Linux

### Voraussetzungen prüfen

> **Host-Terminal:** Du brauchst ein modernes Terminal mit Nerd Font-Unterstützung (z.B. Kitty, Alacritty oder WezTerm), damit Icons in Neovim korrekt angezeigt werden. Die Konfiguration deines Host-Terminals ist nicht Teil dieser Serie.

Für diesen Teil brauchst du Docker auf deinem Linux-System. Falls noch nicht installiert:

```bash
# Docker installieren (Debian/Ubuntu-basiert)
sudo apt update
sudo apt install docker.io docker-compose

# Deinen User zur Docker-Gruppe hinzufügen (damit kein sudo nötig ist)
sudo usermod -aG docker $USER

# WICHTIG: Danach ausloggen und neu einloggen, damit die Gruppe aktiv wird
# Dann testen:
docker run hello-world
```

> **Nach dem usermod:** Du musst dich vollständig aus- und wieder einloggen (oder das Terminal neustarten), damit die Gruppenzugehörigkeit aktiv wird. `newgrp docker` hilft temporär, aber ein kompletter Re-Login ist sicherer.

### Devcontainer CLI installieren

Die Devcontainer CLI ist das offizielle Tool von Microsoft, um Devcontainer ohne VS Code zu benutzen. Es ist ein npm-Paket:

```bash
# Node.js muss auf dem HOST installiert sein (nur fuer die CLI)
node --version  # sollte v18+ zeigen

# CLI global installieren
npm install -g @devcontainers/cli

# Testen
devcontainer --version
```

> **Nur die CLI braucht Node.js auf dem Host.** Das `@devcontainers/cli`-Paket ist in Node.js geschrieben und muss auf dem Host laufen, um Container zu starten. Die Node.js-Version _in deinem Container_ ist komplett unabhängig davon.

### Schritt für Schritt: Ein Template als Ausgangspunkt

Statt alles von Hand zu schreiben, nutzen wir ein offizielles Template:

1. Projektordner anlegen
2. Template initialisieren — die CLI lädt das Template und erstellt den `.devcontainer`-Ordner
3. Konfiguration anpassen — die `devcontainer.json` ist der Startpunkt
4. Container starten — mit einem einzigen Befehl wird das Image gebaut

```bash
# Projektordner anlegen
mkdir ~/projekte/mein-devcontainer
cd ~/projekte/mein-devcontainer

# Verfuegbare Templates anzeigen
devcontainer templates search node

# Template fuer Node.js initialisieren
devcontainer templates apply \
  --template-id ghcr.io/devcontainers/templates/javascript-node:3 \
  --workspace-folder .

# Ergebnis anschauen
ls .devcontainer/
```

Alternativ kannst du auch direkt auf GitHub schauen: [github.com/devcontainers/templates](https://github.com/devcontainers/templates) zeigt alle offiziellen Templates mit Vorschau. Du kannst die Dateien auch manuell kopieren.

### Das generierte Template verstehen

Das Node.js-Template erzeugt in etwa diese Konfiguration:

```jsonc
{
  "name": "Node.js",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:1-20-bookworm",

  // VS Code-spezifisch — fuer uns irrelevant, aber nicht stoerend
  "customizations": {
    "vscode": {
      "extensions": ["dbaeumer.vscode-eslint"],
    },
  },

  "forwardPorts": [3000],
  "postCreateCommand": "npm install",
}
```

### Den Container zum ersten Mal starten

```bash
# Container bauen und starten (dauert beim ersten Mal einige Minuten)
devcontainer up --workspace-folder .

# Zsh-Shell im Container öffnen
devcontainer exec --workspace-folder . zsh

# Jetzt bist du IM Container — testen:
node --version
pwd       # sollte /workspaces/mein-devcontainer o.ae. sein
whoami
```

> **Container-Workflow:** `devcontainer up` baut das Image und startet den Container im Hintergrund. `devcontainer exec` öffnet dann eine Shell darin. Mit `exit` verlässt du die Shell — der Container läuft weiter. `docker stop <id>` beendet ihn.

### Features hinzufügen: der einfache Weg

Jetzt erweitern wir die Konfiguration. Öffne `.devcontainer/devcontainer.json` und erweitere es:

```jsonc
{
  "name": "Mein Node.js Dev-Container",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:1-20-bookworm",

  "features": {
    // Zsh als Standard-Shell + Oh-My-Zsh + nuetzliche Tools
    "ghcr.io/devcontainers/features/common-utils:2": {
      "installZsh": true,
      "configureZshAsDefaultShell": true,
      "installOhMyZsh": true,
      "upgradePackages": true,
    },

    // Claude Code (offizielles Anthropic-Feature)
    "ghcr.io/anthropics/devcontainer-features/claude-code:1.0": {},

    // Neovim (aktuellere Version als apt)
    "ghcr.io/devcontainers-community/features/neovim:1": {
      "version": "stable",
    },
  },

  // Claude-Konfiguration in einem Volume persistieren
  // (damit du dich nicht bei jedem Rebuild neu einloggen musst)
  "mounts": [
    "source=claude-config-${devcontainerId},target=/home/node/.claude,type=volume",
  ],

  "containerEnv": {
    "CLAUDE_CONFIG_DIR": "/home/node/.claude",
  },

  "forwardPorts": [3000],
  "postCreateCommand": "npm install",
}
```

### Container neu bauen

Nach jeder Änderung an `devcontainer.json` oder `Dockerfile` muss der Container neu gebaut werden:

```bash
# Container stoppen
docker ps
docker stop <container-id>

# Neu bauen und starten
devcontainer up --workspace-folder . --build-no-cache

# Zsh-Shell oeffnen
devcontainer exec --workspace-folder . zsh
```

> **`--build-no-cache`:** Docker cached aggressiv. Wenn ein Feature nicht wie erwartet installiert wird, hilft dieses Flag. Dauert länger, aber macht sicher.

### Nützliche CLI-Befehle im Überblick

```bash
# Container starten
devcontainer up --workspace-folder .

# Shell oeffnen
devcontainer exec --workspace-folder . zsh

# Einzelnen Befehl ausfuehren (ohne interaktive Shell)
devcontainer exec --workspace-folder . npm test

# Image neu bauen ohne Cache
devcontainer up --workspace-folder . --build-no-cache

# Alle laufenden Container anzeigen
docker ps

# Container stoppen
docker stop <container-id>

# Container und Image vollstaendig loeschen
docker rm -f <container-id>
docker rmi <image-id>
```

### Zusammenfassung Teil 2

- Die Devcontainer CLI (`@devcontainers/cli`) läuft auf dem Host und steuert Docker
- Offizielle Templates von `github.com/devcontainers/templates` sind ein schneller Einstieg
- Features werden in `devcontainer.json` per URL eingebunden — keine apt-Befehle nötig
- Claude-Code-Konfiguration in einem Docker Volume persistieren, damit der Login erhalten bleibt
- `devcontainer up` → `devcontainer exec ... zsh` ist der tägliche Workflow
