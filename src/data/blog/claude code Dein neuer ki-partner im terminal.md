---
title: "Claude Code: Dein neuer KI-Partner im Terminal"
author: Tobias Geistert
pubDatetime: 2026-04-07T15:20:35Z
slug: vibe-coding-devcontainer-part-2
featured: true
draft: false
tags:
  - devcontainer
  - dev
  - developing
  - vibecoding
  - Claude
  - Terminal
  - CLI
  - Blog
description: "Der ultimative Guide zu Claude Code: Installation, Setup und wie du dein bestehendes Claude Pro-Abo direkt im Terminal nutzt."
---

## Claude Code: Dein neuer KI-Partner im Terminal

Der ultimative Guide zu Claude Code: Installation, Setup und wie du dein bestehendes Claude Pro-Abo direkt im Terminal nutzt.

**Tags:** Installation · CLI · Konfiguration · Linux · Claude · Terminal · dev

---

Hey Leute! Wer viel im Terminal unterwegs ist, weiß: Kontextwechsel sind der Produktivitäts-Killer Nummer eins. Anthropic hat mit **Claude Code** ein Tool rausgehauen, das dieses Problem löst. Und das Beste? Seit Kurzem kannst du deinen ganz normalen **Claude Pro Account** dafür nutzen!

In diesem Artikel schauen wir uns an, wie du das CLI-Tool einrichtest und warum die Wahl zwischen API und Abo dein Portemonnaie ordentlich entlasten kann.

## Was ist Claude Code eigentlich?

Claude Code ist ein „agentisches“ CLI-Tool. Das heißt, es ist kein simpler Chatbot, sondern ein Assistent, der:

- Deine Codebase versteht (indem er Dateien scannt).
    
- Befehle wie `npm test` oder `pytest` selbstständig ausführt.
    
- Bugs direkt im Code fixt und die Änderungen via Git committet.
    

---

## 1. Voraussetzungen & Kontomodelle

Bevor wir installieren, kurz zur Strategie. Du hast 2026 zwei Möglichkeiten, Claude Code zu füttern:

- **Claude Pro / Max Abo:** Wenn du die $20/Monat (Pro) oder die Max-Pläne nutzt, ist Claude Code inklusive. Der Riesenvorteil: **Prompt Caching** ist hier oft "flat" mit drin, was bei großen Projekten massiv Geld spart.
    
- **Anthropic Console (API):** "Pay-as-you-go". Du zahlst pro Token. Super für Gelegenheitsnutzer, kann aber bei intensiven Refactorings teurer werden als das Abo.
    

**Was du sonst noch brauchst:**

- **Node.js** (v18+)
    
- Ein Betriebssystem deiner Wahl (macOS, Linux, WSL)
    

## 2. Installation: In Sekunden startklar

Die Installation erfolgt klassisch über npm:

Bash

```
npm install -g @anthropic-ai/claude-code
```

Ein kurzer Check mit `claude --version` verrät dir, ob alles geklappt hat.

## 3. Einrichtung: Abo oder API?

Hier trennt sich die Spreu vom Weizen. Je nachdem, wie du zahlen willst, loggst du dich ein:

### Weg A: Mit deinem Claude Pro / Max Abo (Empfohlen)

Tippe einfach:

Bash

```
claude auth login
```

Es öffnet sich ein Browser-Tab. Logge dich mit deinem ganz normalen Account ein, den du auch auf `claude.ai` nutzt. Sobald du die Verbindung bestätigt hast, nutzt das Terminal dein monatliches Kontingent.

### Weg B: Über den API-Key

Falls du kein Abo willst, kannst du deinen API-Key in der Shell exportieren:

Bash

```
export ANTHROPIC_API_KEY='dein-key-hier'
claude
```

---

## 4. Claude Code in der Praxis

Navigiere in dein Projektverzeichnis und starte die Session mit `claude`. Hier ein paar Szenarien, die du direkt testen kannst:

### Der "Fix-it"-Workflow

Stell dir vor, deine CI-Pipeline brennt. Du sagst einfach:

> _"Führe die Tests aus und behebe alle Probleme in der `auth.ts`, die den Fehler verursachen."_

Claude wird die Tests starten, den Output lesen, den Code korrigieren und die Tests erneut laufen lassen.

### Code-Reviews & Refactoring

Du kannst Claude bitten, ganze Verzeichnisse zu analysieren:

> _"Prüfe alle Dateien im Ordner `/utils` auf Sicherheitslücken und schlage Verbesserungen vor."_

### Nützliche Commands in der Session

- `/stats`: Zeigt dir, wie viel von deinem Abo-Kontingent oder API-Budget du gerade verbraucht hast.
    
- `/compact`: Wenn der Chat zu lang wird, fasst Claude den Kontext zusammen, um Token zu sparen.
    
- `/logout`: Falls du zwischen Privat-Abo und Firmen-API wechseln musst.
    

---

## 5. Warum das Abo (Pro/Max) oft der bessere Deal ist

2026 ist das Caching-Modell von Anthropic extrem effizient. Wenn Claude deine gesamte Codebase einliest (was bei jedem Start passiert), entstehen viele Input-Token.

- **Im Abo** sind diese Wiederholungen oft durch die Fair-Use-Policy abgedeckt.
    
- **Über die API** zahlst du jedes Mal (wenn auch reduziert durch Caching-Rabatte).
    

Für Vollzeit-Entwickler, die den CLI-Assistenten täglich nutzen, amortisieren sich die $20 für den Pro-Plan meist schon in der ersten Woche.

---

## Fazit & Ausblick

Claude Code macht die Brücke zwischen Denken und Tippen schmaler. Dass Anthropic den Zugang über die normalen Pro-Accounts erlaubt, macht das Tool für die breite Masse an Entwicklern endlich massentauglich. Kein Hantieren mit API-Limits mehr – einfach einloggen und loslegen.

**Nutzt du schon KI-Tools im Terminal oder ist dir die IDE-Integration lieber? Und vor allem: Reicht dir das Pro-Limit aus? Schreib’s mir in die Kommentare!**