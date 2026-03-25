---
title: Vibe Coding im Devcontainer Part 1
author: Tobias Geistert
pubDatetime: 2026-03-24T15:20:35Z
slug: vibe-coding-devcontainer-part-1
featured: true
draft: false
tags:
  - docker
  - devcontainer
  - dev
  - developing
  - vibecoding
description: Kurze Beschreibung des Posts
---

## Teil 1 — Was ist ein Devcontainer und warum willst du einen?

_Das Konzept verstehen, bevor wir irgendetwas installieren. Keine Angst vor Docker-Grundlagen._

**Tags:** Konzepte · Docker · Grundlagen

### Das Problem, das Devcontainer lösen

Stell dir vor: Du hast Node.js in Version 18 auf deinem Rechner. Ein Projekt braucht Version 20, das andere Version 16. Du jonglierst mit `nvm`, `asdf`, oder einem Dutzend anderer Tools, damit nichts kollidiert. Und dann kommt Claude Code dazu — ein globales npm-Paket, das einfach überall drauf liegt.

Devcontainer lösen das grundlegend anders: **Die gesamte Entwicklungsumgebung lebt im Container.** Dein Hostsystem bleibt sauber. Kein Node.js, kein npm, keine Claude-Installation auf dem Host nötig. Alles läuft isoliert.

> **Wichtiger Punkt:** Ein Devcontainer ist _kein_ Produktions-Container. Es ist eine vollständige Entwicklungsumgebung — mit Editor, Shell, Linter, Debugger und allem, was du brauchst — verpackt in ein reproduzierbares Rezept.

### Wie das Konzept funktioniert

In jedem Projekt gibt es einen Ordner `.devcontainer/`. Darin liegt die Konfiguration — meistens eine `devcontainer.json` und optional ein `Dockerfile`. Wenn du den Container startest, baut Docker daraus ein Image, mountet deinen Projektordner hinein, und du entwickelst direkt im Container.

```
mein-projekt/
  .devcontainer/
    devcontainer.json   # Hauptkonfiguration
    Dockerfile          # optional: eigenes Image
    setup.sh            # optional: Setup-Skript
  src/
  package.json
  ...
```

Dein Code liegt weiterhin auf deinem Host-Rechner (unter `~/projekte/mein-projekt`). Der Container sieht ihn über einen sogenannten _Bind Mount_ — eine Brücke zwischen Host und Container. Änderungen in Neovim oder einem Terminal im Container sind sofort auf dem Host sichtbar.

### Devcontainer vs. einfach Docker

|               | Normaler Docker-Container                         | Devcontainer (die Spec)                                | VS Code Remote       |
| ------------- | ------------------------------------------------- | ------------------------------------------------------ | -------------------- |
| **Aufwand**   | Alles manuell: Ports, Volumes, Netzwerk, User-IDs | JSON-Konfiguration — die Spec kümmert sich um den Rest | Eingebaut in VS Code |
| **Für wen**   | Produktions-Deployments                           | Entwicklungsumgebungen                                 | VS-Code-Nutzer       |
| **CLI nötig** | `docker`                                          | `@devcontainers/cli`                                   | VS Code Extension    |

### Was steckt in einer devcontainer.json?

Schauen wir uns eine minimalistische Konfiguration an, um das Prinzip zu verstehen:

```jsonc
// .devcontainer/devcontainer.json
{
  "name": "Mein Node-Projekt",

  // Welches Docker-Image soll als Basis dienen?
  "image": "mcr.microsoft.com/devcontainers/node:20",

  // Features sind fertige Pakete, die ins Image installiert werden
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
  },

  // Wird einmalig nach dem Erstellen des Containers ausgefuehrt
  "postCreateCommand": "npm install",

  // Port-Weiterleitung: Container-Port 3000 -> Host-Port 3000
  "forwardPorts": [3000],
}
```

> **Wo gibt es Vorlagen?** Microsoft pflegt eine große Sammlung offizieller Templates unter [github.com/devcontainers/templates](https://github.com/devcontainers/templates). Dort findest du fertige Konfigurationen für Node.js, Python, Go, Rust und viele mehr. In Teil 2 schauen wir uns das genau an.

### Features: der Baukasten-Ansatz

Das Beste an der Devcontainer-Spec sind die sogenannten _Features_. Das sind fertige, getestete Pakete, die du einfach per JSON in dein Setup einbindest — ohne selbst apt-get-Befehle schreiben zu müssen.

```jsonc
"features": {
  // Zsh mit Oh-My-Zsh
  "ghcr.io/devcontainers/features/common-utils:2": {
    "installZsh": true,
    "configureZshAsDefaultShell": true
  },
  // Node.js in einer bestimmten Version
  "ghcr.io/devcontainers/features/node:1": {
    "version": "20"
  },
  // Claude Code von Anthropic
  "ghcr.io/anthropics/devcontainer-features/claude-code:1.0": {}
}
```

Auf [containers.dev/features](https://containers.dev/features) gibt es einen durchsuchbaren Index aller öffentlichen Features.

### Warum besonders mit Claude Code?

Claude Code ist ein KI-Agent, der in deinem Terminal läuft — er kann Dateien lesen, Code schreiben, Befehle ausführen. Das ist mächtig, aber auch ein Sicherheitsaspekt: Im Container ist der mögliche Schaden begrenzt. Claude hat nur Zugriff auf das gemountete Verzeichnis. Dein Home-Ordner, deine SSH-Keys, deine persönlichen Dokumente — alles unerreichbar.

> **Unser Ziel:** Am Ende dieser Serie hast du einen Devcontainer, der beim Start automatisch Zsh (mit sinnvollen Plugins), Neovim mit LazyVim-Konfiguration und Claude Code enthält. Du tippst einen Befehl, der Container startet, und du landest in einer vollständigen, produktiven Entwicklungsumgebung.

### Zusammenfassung Teil 1

- Ein Devcontainer ist eine reproduzierbare Entwicklungsumgebung in Docker
- Die Konfiguration liegt im Projektordner unter `.devcontainer/devcontainer.json`
- Features sind fertige Bausteine, die man einfach per JSON einbindet
- Der Code liegt auf dem Host, der Container sieht ihn per Bind Mount
- Mit Claude Code im Container schützt man das Hostsystem vor ungewollten Änderungen
