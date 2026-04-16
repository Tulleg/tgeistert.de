---
title: Claude Skills – KI-Verhalten gezielt steuern und erweitern
author: Tobias Geistert
pubDatetime: 2026-04-07T15:20:35Z
slug: claude-skills-erklaert featured
featured: true
draft: false
tags:
  - ki
  - Claude
  - automatisierung
  - prompt-engineering
  - chatbot
  - Blog
  - Post
description: Claude Skills sind wiederverwendbare Anweisungsdateien, die Claude gezielt auf bestimmte Aufgaben trainieren – ohne Fine-Tuning, ohne API-Magie. Wie das funktioniert und wie du eigene Skills erstellst, erfährst du hier.
---


# Claude Skills – KI-Verhalten gezielt steuern und erweitern

Stell dir vor, du könntest Claude beibringen, Blogartikel immer im gleichen Stil zu schreiben, Jira-Tickets nach deinem eigenen Schema zu formulieren oder Bash-Skripte mit deinen persönlichen Konventionen zu generieren – und das reproduzierbar, ohne jedes Mal einen langen System-Prompt zu tippen. Genau das leisten **Claude Skills**.

Skills sind im Grunde Markdown-Dateien mit Anweisungen, die Claude automatisch liest, bevor es eine bestimmte Aufgabe angeht. Klingt simpel – und ist es auch. Aber die Konsequenzen sind mächtig.

## Was sind Skills überhaupt?

Ein Skill ist eine Datei namens `SKILL.md`, die in einem definierten Verzeichnis liegt und zwei Dinge enthält:

1. **Metadaten im YAML-Frontmatter** – Name, Beschreibung und Trigger-Bedingungen
2. **Den eigentlichen Anweisungstext** – alles, was Claude wissen muss, um die Aufgabe richtig auszuführen

Claude erhält beim Start einer Konversation eine Liste aller verfügbaren Skills (deren Namen und Beschreibungen). Wenn deine Anfrage zu einem Skill passt – entweder weil du einen Trigger-Befehl nutzt oder weil Claude die Beschreibung als passend erkennt –, liest Claude die vollständige `SKILL.md` und folgt deren Anweisungen.

Das Schöne daran: Skills funktionieren ohne API-Zugang, ohne Fine-Tuning, ohne Deployments. Es ist pures Prompt-Engineering – aber gut strukturiert und wiederverwendbar.

## Die Anatomie einer SKILL.md

Eine Skill-Datei hat immer denselben Grundaufbau:

```yaml
---
name: mein-skill
description: >
  Erkläre hier genau, wann Claude diesen Skill verwenden soll.
  Je präziser du Trigger-Situationen beschreibst, desto zuverlässiger
  erkennt Claude, ob dieser Skill relevant ist.
---
```

Nach dem Frontmatter folgt der eigentliche Inhalt – normales Markdown. Hier kannst du:

- Schritt-für-Schritt-Prozesse beschreiben
- Ausgabeformate vorgeben (z. B. ein konkretes YAML-Schema)
- Stilregeln definieren
- Qualitätschecklisten anhängen
- Beispiele für gute und schlechte Ausgaben zeigen

Der Skill kann so kurz oder lang sein, wie du es brauchst. Claude liest ihn komplett, bevor es antwortet.

## Wie Skill-Erkennung funktioniert

Die Beschreibung im Frontmatter ist das Herzstück der Erkennung. Claude vergleicht deine Anfrage semantisch mit allen Skill-Beschreibungen und entscheidet, welcher Skill – wenn überhaupt einer – relevant ist.

Das bedeutet: **Die Beschreibung ist kein Kommentar, sondern ein Routing-Mechanismus.** Schreib sie so, als würdest du einem Kollegen erklären, bei welchen Aufgaben er dieses Dokument aufschlagen soll.

Konkrete Trigger-Patterns funktionieren besonders gut:

```yaml
description: >
  Nutze diesen Skill wenn der User Begriffe wie "Blogpost", "Artikel",
  "Beitrag" verwendet, oder wenn er mit "/tech-blogger" beginnt.
  Auch bei Themen wie "erkläre mir X für meinen Blog" sofort triggern.
```

Du kannst auch explizite Slash-Befehle einbauen – wie `/tech-blogger` oder `/jira-ticket` –, die du am Anfang einer Nachricht tippst. Claude erkennt das als starken Trigger.

## Einen eigenen Skill erstellen – Schritt für Schritt

Angenommen, du möchtest einen Skill, der dir immer Git-Commit-Messages nach dem Conventional-Commits-Schema formuliert.

**Schritt 1: Verzeichnis anlegen**

Skills liegen typischerweise unter `/mnt/skills/user/` (für eigene Skills) oder `/mnt/skills/public/` (für geteilte). Leg einen Ordner an:

```bash
mkdir -p /mnt/skills/user/git-commits
```

**Schritt 2: SKILL.md erstellen**

```bash
touch /mnt/skills/user/git-commits/SKILL.md
```

**Schritt 3: Inhalt schreiben**

```markdown
---
name: git-commits
description: >
  Verwende diesen Skill wenn der User Git-Commit-Messages,
  Changelogs oder Commit-Beschreibungen erstellen möchte.
  Trigger: "/git-commit", "schreib mir einen Commit", "Commit-Message".
---

# Git Commit Message Generator

Erstelle Commit-Messages strikt nach dem Conventional Commits Standard.

## Format

```

<type>(<scope>): <subject>

[optional body]

[optional footer]

```

## Erlaubte Types

- `feat` – neues Feature
- `fix` – Bugfix
- `docs` – Dokumentation
- `refactor` – Code-Umstrukturierung ohne Funktionsänderung
- `chore` – Build, Dependencies, sonstige Wartung

## Regeln

- Subject maximal 72 Zeichen, Imperativ, kein Punkt am Ende
- Body erklärt das Warum, nicht das Was
- Breaking Changes mit `BREAKING CHANGE:` im Footer markieren
```

**Schritt 4: Testen**

Starte eine neue Konversation und schreib:

```
/git-commit Ich habe die AdGuard-Konfiguration auf LAN umgestellt
```

Claude liest automatisch deinen Skill und antwortet entsprechend.

## Öffentliche vs. eigene Skills

In der Skill-Struktur gibt es eine Hierarchie:

|Pfad|Zweck|
|---|---|
|`/mnt/skills/public/`|Von Anthropic bereitgestellte Skills (docx, pdf, pptx, …)|
|`/mnt/skills/user/`|Deine eigenen, persönlichen Skills|
|`/mnt/skills/examples/`|Vorlagen und der `skill-creator`-Skill|

Eigene Skills unter `/mnt/skills/user/` haben Vorrang und können die Basis-Skills ergänzen oder überschreiben.

## Skills kombinieren

Manche Aufgaben brauchen mehrere Skills gleichzeitig. Wenn du zum Beispiel einen Blogpost als Word-Dokument ausgeben möchtest, zieht Claude sowohl den `tech-blogger`-Skill als auch den `docx`-Skill heran. Das passiert automatisch, wenn beide Beschreibungen zur Anfrage passen.

Du kannst das auch explizit steuern, indem du in deiner SKILL.md auf andere Skills verweist:

```markdown
## Hinweis

Wenn der User eine DOCX-Ausgabe wünscht, lies zusätzlich
/mnt/skills/public/docx/SKILL.md und folge dessen Anweisungen.
```

## Der `skill-creator`-Skill

Es gibt sogar einen Skill, der dir hilft, neue Skills zu erstellen – meta, ich weiß. Der `skill-creator` unter `/mnt/skills/examples/` führt dich durch den Prozess, bewertet Beschreibungen auf ihre Trigger-Qualität und kann Evals für deine Skills schreiben.

Nutz ihn so:

```
/skill-creator erstelle einen Skill für SQL-Query-Optimierung
```

## Fazit & Ausblick

Skills sind ein elegantes Konzept: Statt komplexe System-Prompts zu verwalten oder API-Konfigurationen zu pflegen, schreibst du einmal eine strukturierte Markdown-Datei – und Claude verhält sich danach genau so, wie du es brauchst.

Besonders für wiederkehrende Aufgaben lohnt sich der initiale Aufwand schnell. Ob Ticket-Templates, Code-Review-Checklisten oder spezifische Ausgabeformate – ein gut geschriebener Skill spart dir bei jeder Nutzung Zeit.

In meiner Erfahrung gilt: Je konkreter die Beschreibung und je mehr Beispiele im Skill-Inhalt stehen, desto zuverlässiger und konsistenter die Ergebnisse. Fang klein an, iteriere, und nutze den `skill-creator`, um die Qualität deiner Beschreibungen zu messen.

Welchen Skill wirst du als nächstes bauen?