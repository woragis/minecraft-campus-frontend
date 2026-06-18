# CampusWorld — Frontend

Interface web do **CampusWorld** — landing com presença ao vivo.

## Stack

- Next.js 15 (App Router)
- TypeScript
- CSS simples (sem Tailwind por enquanto)

## Desenvolvimento

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## API

O frontend consome rotas públicas do backend:

| Rota | Uso |
|------|-----|
| `GET /v1/presence/overview` | Total online + por servidor |
| `GET /v1/guilds` | Lista de guildas |
| `GET /v1/presence/guilds/{id}` | Membros online da guilda |

Configure `API_URL` em `.env.local` (default `http://127.0.0.1:8080`).

Para presença ao vivo, ative Redis no backend:

```bash
# backend/.env
REDIS_ENABLED=1
```

## Documentação

- [MULTIPLATFORM-ROADMAP.md](../docs/MULTIPLATFORM-ROADMAP.md)
- [PHASE-5-PRESENCE.md](../docs/PHASE-5-PRESENCE.md)
