---
title: "Claude Code Hooks: Deterministische Kontrolle über deinen KI-Workflow"
author: Tobias Geistert
pubDatetime: 2026-04-07T08:00:00Z
slug: claude-code-hooks-workflow-automatisierung
featured: true
draft: false
tags:
  - claude-code
  - ai
  - automatisierung
  - developer-tools
  - shell
description: Claude Code Hooks verwandeln unzuverlässige KI-Hinweise in garantierte Automatisierungen. Was sie sind, wie sie funktionieren – und drei konkrete Beispiele die du sofort einsetzen kannst.
---

# Claude Code Hooks: Deterministische Kontrolle über deinen KI-Workflow

Du kennst das Gefühl: Du sagst Claude Code, es soll nach dem Schreiben von Dateien immer den Linter laufen lassen. Manchmal tut es das. Manchmal nicht. Du schreibst es ins `CLAUDE.md`, wiederholst es im Prompt – und trotzdem ist es letztendlich eine Bitte, keine Garantie.

Genau dafür gibt es **Hooks**. Sie wurden Mitte 2025 eingeführt und sind seitdem eines der mächtigsten Features von Claude Code. Hooks verwandeln unzuverlässige KI-Empfehlungen in deterministische, immer ausgeführte Automatisierungen – wie Git Hooks, aber für jeden Schritt des KI-Workflows.

In diesem Artikel zeige ich dir, was Hooks sind, wie die Konfiguration funktioniert, und drei Praxisbeispiele die du heute noch einsetzen kannst.

![Devontainer abstrakt](@/assets/images/hooks1.png) 

---

## Was sind Hooks – und warum brauchst du sie?

Ein Hook ist nichts anderes als ein **Shell-Befehl, ein HTTP-Endpoint oder ein LLM-Prompt**, der automatisch an einem bestimmten Punkt im Claude Code Lebenszyklus ausgeführt wird.

Der entscheidende Unterschied zu `CLAUDE.md` oder Prompt-Anweisungen: Hooks sind keine Vorschläge. Claude Code führt sie **immer** aus – unabhängig davon, ob die KI gerade "im Flow" ist oder nicht.

Der Kernsatz, der alles erklärt:

> **Hooks geben dir deterministischen Kontrolle über ein probabilistisches System.**

Statt zu hoffen, dass Claude Code daran denkt, Prettier nach dem Speichern auszuführen, macht ein `PostToolUse`-Hook es zur Pflicht.

---

## Die Architektur: Lifecycle Events & Matcher

Bevor wir in die Konfiguration einsteigen, musst du zwei Konzepte verstehen: **Events** und **Matcher**.

### Hook Events

Claude Code feuert Hooks an spezifischen Punkten im Lebenszyklus. Die wichtigsten sind:

| Event | Wann es feuert | Blockierbar? |
|---|---|---|
| `PreToolUse` | Bevor Claude ein Tool ausführt | ✅ Ja |
| `PostToolUse` | Nachdem ein Tool ausgeführt wurde | ❌ Nein |
| `UserPromptSubmit` | Wenn du einen Prompt absendest | ✅ Ja |
| `Stop` | Wenn Claude fertig ist | ✅ Ja (mit Vorsicht!) |
| `SessionStart` | Beim Start oder Wiederaufnehmen einer Session | ❌ Nein |
| `Notification` | Bei Permission-Prompts und Idle-Zuständen | ❌ Nein |

`PreToolUse` und `PostToolUse` sind die mit Abstand häufigsten Events. Pre ist ideal für Validierung und Sicherheit, Post für Cleanup-Tasks wie Formatierung oder Tests.

### Matcher

Der `matcher` ist ein **Regex-String**, der filtert, wann ein Hook innerhalb eines Events ausgelöst wird. Bei Tool-Events matcht er gegen den Tool-Namen:

```json
"matcher": "Edit|Write"      // Feuert bei Edit oder Write
"matcher": "Bash"            // Nur bei Bash-Befehlen
"matcher": "Notebook.*"      // Alle Notebook-Tools
"matcher": ""                // Immer (match-all)
```

Events wie `UserPromptSubmit`, `Stop` oder `SessionStart` unterstützen keinen Matcher – sie feuern immer.

---

## Konfiguration: Wo und wie

Hooks werden in `settings.json` Dateien definiert. Es gibt drei Ebenen:

```
~/.claude/settings.json          # Globale User-Einstellungen (alle Projekte)
.claude/settings.json            # Projekt-Einstellungen (ins Repo committen)
.claude/settings.local.json      # Lokale Projekt-Einstellungen (nicht committen)
```

Claude Code lädt alle passenden Dateien und feuert jeden matchenden Hook. Das Grundschema sieht so aus:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "/pfad/zum/skript.sh"
          }
        ]
      }
    ]
  }
}
```

Die Struktur ist dreistufig: **Event** → **Matcher-Gruppe** → **Hook-Handler**.

### Exit Codes: Wie Hooks kommunizieren

Dein Hook-Skript kommuniziert mit Claude Code über Exit Codes:

| Exit Code | Bedeutung |
|---|---|
| `0` | Alles gut, weitermachen |
| `2` | **Blockieren** (nur `PreToolUse`) – Fehlermeldung aus `stderr` geht an Claude |
| Jeder andere Wert | Nicht-blockierender Fehler, wird dem User angezeigt |

Der Schlüssel: Bei Exit Code 2 liest Claude Code die `stderr`-Ausgabe deines Skripts und passt sein Verhalten entsprechend an.

---

## Drei Praxisbeispiele

### Beispiel 1: Auto-Formatierung nach jedem Edit

Der Klassiker – und für die meisten Projekte der erste Hook, den du einrichten solltest. Nach jedem Schreiben oder Bearbeiten einer Datei läuft Prettier automatisch.

Trage das in `.claude/settings.json` ein:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\""
          }
        ]
      }
    ]
  }
}
```

Die Umgebungsvariable `$CLAUDE_TOOL_INPUT_FILE_PATH` wird von Claude Code automatisch gesetzt und enthält den Pfad der gerade bearbeiteten Datei. Kein Skript nötig – ein Einzeiler reicht.

---

### Beispiel 2: Gefährliche Bash-Befehle blockieren

Hier zeigt sich die wahre Stärke von `PreToolUse`. Das folgende Skript blockt destruktive Befehle bevor Claude Code sie ausführt und erklärt Claude Code via `stderr`, warum.

Erstelle `.claude/hooks/pre-bash-firewall.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# JSON-Input aus stdin lesen
INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Liste der verbotenen Muster
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "DROP TABLE"
  "git push.*--force"
  "> /dev/sda"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$CMD" | grep -qiE "$pattern"; then
    echo "Gefährlicher Befehl blockiert: '$pattern' erkannt." >&2
    echo "Bitte verwende eine sicherere Alternative." >&2
    exit 2  # Blockiert die Ausführung, Claude liest stderr
  fi
done

exit 0  # Alles ok
```

Skript ausführbar machen:

```bash
chmod +x .claude/hooks/pre-bash-firewall.sh
```

Und in `.claude/settings.json` registrieren:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/pre-bash-firewall.sh"
          }
        ]
      }
    ]
  }
}
```

Wenn Claude Code nun versucht, einen der gesperrten Befehle auszuführen, blockt der Hook die Ausführung und Claude bekommt die Fehlermeldung – und versucht automatisch, einen sichereren Weg zu finden.

---

### Beispiel 3: Desktop-Notification wenn Claude fertig ist

Kennst du das? Du startest einen längeren Claude-Task, schaust kurz weg – und weißt nicht mehr, ob er fertig ist. Ein `Stop`-Hook löst das elegant mit einer nativen Linux-Benachrichtigung.

Erstelle `~/.claude/hooks/notify-done.sh`:

```bash
#!/usr/bin/env bash

# Verhindert Endlosschleifen im Stop-Hook
INPUT=$(cat)
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi

# Desktop-Notification mit notify-send (libnotify)
notify-send \
  --icon=dialog-information \
  --urgency=normal \
  "Claude Code" \
  "Task abgeschlossen ✓"

exit 0
```

Auf MX Linux ist `notify-send` Teil des `libnotify-bin`-Pakets:

```bash
sudo apt install libnotify-bin
chmod +x ~/.claude/hooks/notify-done.sh
```

In `~/.claude/settings.json` (global, da für alle Projekte sinnvoll):

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/notify-done.sh"
          }
        ]
      }
    ]
  }
}
```

Der Schlüssel hier ist der `stop_hook_active`-Check: Wenn ein `Stop`-Hook mit Exit Code ungleich 0 zurückkommt, würde Claude Code sonst in eine Endlosschleife geraten. Der Check verhindert das.

---

## Hooks debuggen

Wenn ein Hook nicht feuert, hilft dieses Mini-Debugging-Pattern. Schreibe einen einfachen Logger-Hook, der alle Events und Tool-Inputs in eine Datei schreibt:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "cat >> /tmp/claude-hooks.log"
          }
        ]
      }
    ]
  }
}
```

Dann kannst du mit `tail -f /tmp/claude-hooks.log` in Echtzeit sehen, was Claude Code tut – und welchen JSON-Input deine Hooks empfangen. Gerade für die Entwicklung eigener Skripte ist das Gold wert.

---

## Hooks vs. CLAUDE.md: Was gehört wohin?

| | CLAUDE.md | Hooks |
|---|---|---|
| Typ | Richtlinie (Vorschlag) | Regel (garantiert) |
| Beispiel | "Bevorzuge `pnpm` statt `npm`" | "Führe immer `pnpm lint` nach Edits aus" |
| Fehlschlag | Claude ignoriert es manchmal | Wird immer ausgeführt |
| Geeignet für | Code-Stil, Präferenzen, Konventionen | Sicherheit, Formatierung, Pflicht-Checks |

Die Faustregel: Alles, was du mit "muss immer" beschreiben würdest, gehört in einen Hook – nicht ins `CLAUDE.md`.

---

## Fazit & Ausblick

Claude Code Hooks sind kein Nice-to-have – sie sind das Feature, das aus einer cleveren KI ein verlässliches Werkzeug macht. Ob Auto-Formatierung, Sicherheits-Firewall oder Desktop-Benachrichtigungen: Hooks geben dir die Kontrolle zurück, ohne den KI-Workflow zu bremsen.

Mein Tipp für den Einstieg: Fang mit einem einzigen `PostToolUse`-Hook für Prettier an. Sobald du siehst, wie nahtlos das funktioniert, wirst du anfangen, jeden manuellen Schritt in deinem Workflow zu hinterfragen – und ihn zu automatisieren.

Welche Hooks nutzt du bereits, oder welche hast du dir schon überlegt? Ich bin gespannt.
