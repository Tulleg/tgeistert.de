# Keystatic im Proxmox-LXC betreiben

Diese App trennt bewusst zwei Build-Ziele:

- `npm run build:site` für GitHub Pages
- `npm run build:cms` für das Keystatic-CMS im LXC

## 1. LXC in Proxmox anlegen

Empfohlene Werte:

- Debian 12
- 1 vCPU
- 512 MB RAM
- 4-8 GB Disk
- feste IP im LAN
- unprivilegierter Container

## 2. Basissoftware im LXC installieren

```bash
apt update
apt install -y git curl ca-certificates build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
```

## 3. Repo auschecken

```bash
git clone git@github.com:Tulleg/tgeistert.de.git /opt/tgeistert-cms
cd /opt/tgeistert-cms
npm install
cp .env.cms.example .env
```

Danach `.env` mit deinen echten Werten befüllen:

- `BUILD_TARGET=cms`
- `HOST=0.0.0.0`
- `PORT=4321`
- `CMS_BASE_URL=https://<dein-kanonischer-cms-hostname>`
- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_SECRET`
- `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`

`PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` gehört zu deiner GitHub-App und wird von Keystatic im Astro-Frontend verwendet.

## 4. GitHub-App anlegen

Keystatic im GitHub-Modus nutzt eine GitHub-App. Lege sie in GitHub an und verwende durchgängig denselben Hostnamen wie in `.env`.

Wichtige URLs:

- Homepage URL: `https://<dein-kanonischer-cms-hostname>`
- Callback URL: `https://<dein-kanonischer-cms-hostname>/api/keystatic/github/oauth/callback`

Die App braucht Zugriff auf das Repo `Tulleg/tgeistert.de`.

## 5. CMS-Build erzeugen

```bash
cd /opt/tgeistert-cms
npm run build:cms
```

Der Build erzeugt den startbaren Node-Server unter `dist/server/entry.mjs`.

## 6. Systemd-Service einrichten

Datei `/etc/systemd/system/keystatic-blog.service` anlegen:

```ini
[Unit]
Description=Keystatic Blog CMS
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/tgeistert-cms
EnvironmentFile=/opt/tgeistert-cms/.env
ExecStart=/usr/bin/node /opt/tgeistert-cms/dist/server/entry.mjs
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Service aktivieren:

```bash
systemctl daemon-reload
systemctl enable --now keystatic-blog
systemctl status keystatic-blog
```

## 7. Reverse Proxy davor setzen

Im Nginx Proxy Manager:

- Domain: dein kanonischer CMS-Hostname
- Forward Hostname: IP des LXC
- Forward Port: `4321`
- Websockets aktivieren
- TLS aktivieren

Empfehlung:

- denselben Host lokal per DNS-Rewrite auflösen
- denselben Host zusätzlich per Tailscale erreichbar machen

Wichtig ist nicht, ob der Host lokal oder über Tailscale erreicht wird, sondern dass GitHub OAuth immer denselben kanonischen Hostnamen sieht.

## 8. Update-Ablauf im LXC

```bash
cd /opt/tgeistert-cms
git pull
npm install
npm run build:cms
systemctl restart keystatic-blog
```

## 9. Öffentliche Seite weiter deployen

Für GitHub Pages bleibt der normale Site-Build zuständig:

```bash
npm run build:site
```

Die GitHub-Workflows im Repo sind bereits darauf umgestellt.
