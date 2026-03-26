---
title: Aktuelle Projekte
author: Tobias Geistert
pubDatetime: 2026-03-24T15:20:35Z
slug: aktuelle-projekte
featured: true
draft: false
tags:
  - Projekte
  - basteleien
  - dev
description: Das ist ist ein Überblick über meine Projekt
---

## Aktuelle Projekte

### Bissfest der Vereinsmanager

Bissfest habe ich für meinen Angelverein entwickelt um die Nutzer und Termine besser verwalten zu können. Die App wird als Dockercontainer bereitgestellt und kann sowohl auf eigener Hardware als auch auf zugekaufter gehostet werden. Durch den Dockeransatz ist es soagr möglich Bissfest auf seinem Rechner zu starten und nur hochzufahren wenn benötigt. Die App wird weiterhin ausgebaut und um Funktionen ergänzt.

![Devontainer abstrakt](@/assets/images/bissfest.gif)

### 🎯 Features

- 👥 Mitgliederverwaltung – Flexible Spalten, vollständig konfigurierbar via config.json
- 📊 Dashboard – Übersicht mit Mitgliederstatistiken und aktuellem Fisch des Jahres
- 🐟 Fischverwaltung – Fisch des Jahres (Jugend & Erwachsene) mit automatischer 3-Jahres-Sperre
- 📥 Import – PDF (mit OCR) und Excel-Dateien importieren inkl. Reconciliation/Merge
- 📤 Export – Anpassbare PDF-Templates mit Deckblatt, Filterinfo und Datum/Anzahl-Kopfzeile
- 🔐 Rollenbasiertes Rechtesystem – admin / editor / viewer mit feingranularer API-Absicherung
- 👤 Benutzerverwaltung – Benutzer anlegen, Rollen vergeben, löschen (Admin-Panel)
- 📱 Mobil-optimiert – Responsives UI mit React & Tailwind CSS
- 🐳 Docker-ready – Produktionsbereit mit Dockerfile & Docker Compose
- ⚙️ Konfigurierbar – Alle Spalten, Feldtypen, Export-Vorlagen und Einstellungen in config.json
