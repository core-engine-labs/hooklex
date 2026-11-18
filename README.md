<div align="center">

<img src="assets/logo.svg" alt="Hooklex logo" width="110" height="110" />

# Hooklex

### Catch every webhook. Inspect everything. Debug without guessing.

**A local-first webhook testing platform.** Get a unique URL that accepts any HTTP request, then explore headers, query params, body, and metadata in a clean, readable UI. No third-party SaaS required.

<br />

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-7E22CE?style=for-the-badge)](LICENSE)
[![Docker Pulls](https://img.shields.io/docker/pulls/muhammadhassan34/hooklex-server?style=for-the-badge&logo=docker&logoColor=white&color=7E22CE)](https://hub.docker.com/r/muhammadhassan34/hooklex-server)
[![GitHub Stars](https://img.shields.io/github/stars/core-engine-labs/hooklex?style=for-the-badge&logo=github&color=7E22CE)](https://github.com/core-engine-labs/hooklex/stargazers)
[![TypeScript](https://img.shields.io/badge/TypeScript-Node.js-7E22CE?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[![Server Image Size](https://img.shields.io/docker/image-size/muhammadhassan34/hooklex-server/latest?label=server%20image&logo=docker&logoColor=white&color=555)](https://hub.docker.com/r/muhammadhassan34/hooklex-server)
[![Client Image Size](https://img.shields.io/docker/image-size/muhammadhassan34/hooklex-client/latest?label=client%20image&logo=docker&logoColor=white&color=555)](https://hub.docker.com/r/muhammadhassan34/hooklex-client)

<br />

[**Features**](#-key-features) · [**Quick Start**](#-quick-start-docker-compose) · [**Configuration**](#️-configuration--environment-variables) · [**Open Source vs Cloud**](#-open-source-vs-cloud) · [**Contributing**](#-contributing)

</div>

<br />

![Interface Preview](assets/preview.PNG)

<br />

## 💡 Why Hooklex?

Debugging webhooks usually means pasting a random URL into a hosted tool, hoping it stays up, and sending your event data to someone else's servers. **Hooklex runs on your machine.** You own the data, you control retention, and you get a proper developer experience: a code-grade editor, powerful search, replay tracking, and one-click exports.

```mermaid
flowchart LR
    A["🌐 Webhook sender<br/>(Stripe, Shopify, your app...)"] -->|"any HTTP request"| B["⚙️ Hooklex Server<br/>:5000"]
    B -->|"stores"| C[("🐘 PostgreSQL")]
    D["🖥️ Hooklex Client<br/>:3000"] -->|"inspect and export"| B
    E["👩‍💻 You"] --> D
```

<br />

## ✨ Key Features

<table>
<tr>
<td width="50%" valign="top"><h3>🔗 Unique Endpoint URLs</h3><p>Every collection gets its own URL that accepts any incoming HTTP request. No setup, no guessing.</p></td>
<td width="50%" valign="top"><h3>🧰 Wide Method Support</h3><p><code>GET</code> <code>POST</code> <code>PUT</code> <code>PATCH</code> <code>DELETE</code> <code>HEAD</code> <code>OPTIONS</code> <code>TRACE</code> plus <code>PURGE</code> and <code>PROPFIND</code>. Anything else gets a clean <code>405</code> with an <code>Allow</code> header.</p></td>
</tr>
<tr>
<td width="50%" valign="top"><h3>🎨 Beautiful Content Preview</h3><p>The <b>Monaco editor</b> (the engine behind VS Code) gives you collapsible nodes, search, and syntax highlighting for JSON and XML. Preview images, videos, and PDFs inline, and copy binary bodies as <b>Base64</b>.</p></td>
<td width="50%" valign="top"><h3>📁 Organized Collections</h3><p>Group endpoints per project or client, like Postman or Insomnia, but built for <i>receiving</i> requests.</p></td>
</tr>
<tr>
<td width="50%" valign="top"><h3>🔍 Global Search</h3><p>Search by collection name, body content, IP address, headers, and query parameters. Filter by <code>isReplay</code> and by public or private visibility.</p></td>
<td width="50%" valign="top"><h3>🔁 isReplay Tracking</h3><p>Re-send a request with <code>?isReplay=true&amp;replayedFrom=&lt;label&gt;</code> and get a <b>REPLAY</b> badge plus an origin label right in the UI.</p></td>
</tr>
<tr>
<td width="50%" valign="top"><h3>📤 Export Anywhere</h3><p>Export any request as <b>CSV</b>, <b>Markdown</b>, or <b>PDF</b> for spreadsheets, docs, and reports.</p></td>
<td width="50%" valign="top"><h3>🧬 TypeScript Type Generation</h3><p>Turn any JSON or XML body into a typed interface instantly.</p></td>
</tr>
<tr>
<td width="50%" valign="top"><h3>🧹 Automatic Cleanup</h3><p>Background jobs remove expired and deleted data on a schedule you control, so your database never gets stuck.</p></td>
<td width="50%" valign="top"><h3>🐳 Simple Docker Deployment</h3><p>Two images and a PostgreSQL database. Prisma migrations run automatically on startup.</p></td>
</tr>
</table>

<br />

## 🧩 Open Source vs Cloud

| | 🟢 **Open Source** (Free, runs locally) | 🔒 **Cloud** (Coming soon) |
|---|:---:|:---:|
| Full server and client code | ✅ | ✅ |
| All HTTP methods | ✅ | ✅ |
| Monaco editor and rich preview (JSON, XML, images, PDFs, Base64) | ✅ | ✅ |
| Local collections and global search (`isReplay` support) | ✅ | ✅ |
| Export to CSV, Markdown, and PDF | ✅ | ✅ |
| TypeScript type generation | ✅ | ✅ |
| **Custom Actions:** live forwarding to local or staging servers | ➖ | ✅ |
| **Routing conditions** and **dynamic custom responses** | ➖ | ✅ |
| **Cloud persistence and backup** (30 to 90 days of history, no need to keep your machine on) | ➖ | ✅ |
| **Public request sharing** (shareable link for any request) | ➖ | ✅ |

<br />

## 🚀 Quick Start (Docker Compose)

**1.** Create a `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: hooklex-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-hooklex}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-hooklex_password}
      POSTGRES_DB: ${POSTGRES_DB:-hooklex}
    volumes:
      - hooklex_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-hooklex} -d ${POSTGRES_DB:-hooklex}"]
      interval: 5s
      timeout: 5s
      retries: 10

  server:
    image: muhammadhassan34/hooklex-server:latest
    container_name: hooklex-server
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      SERVER_PORT: ${SERVER_PORT:-5000}
      CLIENT_PORT: ${CLIENT_PORT:-3000}
      DATABASE_URL: postgresql://${POSTGRES_USER:-hooklex}:${POSTGRES_PASSWORD:-hooklex_password}@db:5432/${POSTGRES_DB:-hooklex}
    ports:
      - "${SERVER_PORT:-5000}:${SERVER_PORT:-5000}"
    # Arguments are optional. Remove this `command` block to use the defaults.
    command:
      - "dist/start-all.js" # mandatory script entry point
      - "--read-limit"
      - "${READ_LIMIT:-100}"
      - "--write-limit"
      - "${WRITE_LIMIT:-100}"
      - "--expire-after"
      - "${EXPIRE_AFTER:-1}"
      - "--cron-schedule"
      - "${CRON_SCHEDULE:-*/1 * * * *}"

  client:
    image: muhammadhassan34/hooklex-client:latest
    container_name: hooklex-client
    restart: unless-stopped
    depends_on:
      - server
    environment:
      CLIENT_PORT: ${CLIENT_PORT:-3000}
      SERVER_PORT: ${SERVER_PORT:-5000}
    ports:
      - "${CLIENT_PORT:-3000}:${CLIENT_PORT:-3000}"

volumes:
  hooklex_pgdata:
```

**2.** Start everything:

```bash
docker compose up -d
```

**3.** Open **http://localhost:3000** and create your first collection. 🎉

> [!NOTE]
> The browser talks to the server directly at `http://localhost:5000`, so both ports must be published to your host. To use custom ports, set `CLIENT_PORT` and `SERVER_PORT` in a `.env` file next to your compose file.

> [!WARNING]
> Change the default database password (`POSTGRES_PASSWORD`) before running anywhere other than your own machine.

<br />

## 🛠️ Local Development

**Prerequisites**

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (for the PostgreSQL database)

**Steps**

```bash
# 1. Clone the repository
git clone https://github.com/core-engine-labs/hooklex.git
cd hooklex

# 2. Install dependencies
pnpm install

# 3. Start a local PostgreSQL database
docker run -d --name hooklex-dev-db \
  -e POSTGRES_USER=hooklex \
  -e POSTGRES_PASSWORD=hooklex_password \
  -e POSTGRES_DB=hooklex \
  -p 5432:5432 \
  postgres:16-alpine

# 4. Configure environment variables
export DATABASE_URL="postgresql://hooklex:hooklex_password@localhost:5432/hooklex"

# 5. Run in development mode (migrations are applied on startup)
pnpm dev
```

<br />

## ⚙️ Configuration / Environment Variables

> [!IMPORTANT]
> `CLIENT_PORT` and `SERVER_PORT` **must be identical** on the client and server images.

### 🖥️ Client image

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|:--------:|
| `CLIENT_PORT` | Port the client listens on. | `3000` | No |
| `SERVER_PORT` | Port of the Hooklex server the client connects to. | `5000` | No |

### ⚙️ Server image

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|:--------:|
| `SERVER_PORT` | Port the server listens on. | `5000` | No |
| `CLIENT_PORT` | Port of the Hooklex client (used for CORS / allowed origin). | `3000` | No |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/hooklex`. | none | **Yes** |

### 🎛️ Server arguments (all optional)

| Argument | Description | Default Value | Required |
|----------|-------------|---------------|:--------:|
| `--read-limit` | Maximum read requests per minute, per IP. | `100` | No |
| `--write-limit` | Maximum write requests per minute, per IP. | `100` | No |
| `--expire-after` | Days to keep request data before it expires. | `1` | No |
| `--cron-schedule` | Cron schedule for the cleanup jobs (deleted collections, expired requests, deleted requests). | `*/1 * * * *` (every minute) | No |

Pass arguments through the `command` in Docker Compose (see Quick Start), or run a one-off:

```bash
docker compose run --rm <SERVICE_NAME> node dist/start-all.js --read-limit 500 --write-limit 500
```

### 📦 Ports and volumes

| Service | Default Port | Volume |
|---------|:------------:|--------|
| Client | `3000` (set by `CLIENT_PORT`) | None. Stateless. |
| Server | `5000` (set by `SERVER_PORT`) | None. All data lives in PostgreSQL. |
| PostgreSQL | `5432` (internal) | Named volume, e.g. `hooklex_pgdata`, to persist data. |

<br />

## 🔁 The isReplay System

Re-testing a webhook in a busy history is hard. `isReplay` makes re-runs obvious. Add **both** query parameters to your webhook URL:

```text
?isReplay=true&replayedFrom=msg_wrong
```

| Parameter | What you get in the UI |
|-----------|------------------------|
| `isReplay=true` | An orange **REPLAY** badge in the sidebar list. |
| `replayedFrom=<label>` | Your label in the request header banner, searchable from global search. |

> [!TIP]
> Send **both** parameters or **neither**. A request with only one is rejected with `400 Bad Request`.

<br />

## 🤝 Contributing

Contributions are welcome and appreciated.

1. 🐛 **Open an issue first** for bugs or feature ideas, with steps to reproduce or a clear description.
2. 🍴 **Fork** the repository and create a branch from `main` (for example `feat/my-change` or `fix/my-bug`).
3. 🔧 **Make your changes.** Keep them focused, and make sure the project builds and runs locally.
4. 🚀 **Open a Pull Request** that explains what changed and why, and links the related issue.

By contributing, you agree that your contributions are licensed under the AGPL-3.0.

<br />

## 📜 License

Hooklex is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0).

<br />

<div align="center">

**If Hooklex saves you time, consider giving it a ⭐ on GitHub.**

Made with 💜 by [Core Engine Labs](https://github.com/core-engine-labs)

</div>
