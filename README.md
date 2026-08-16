# EchoLine

A real-time chat application with a Next.js client and an Express/Socket.IO server.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Setup

Create local environment files from the committed examples:

```bash
cp front/.env.example front/.env.local
cp back/.env.example back/.env
```

Install dependencies:

```bash
cd front && npm install
cd ../back && npm install
```

## Development

Run each application in a separate terminal:

```bash
cd front
npm run dev
```

```bash
cd back
npm run dev
```

The client runs at `http://localhost:3000`. The API and Socket.IO server run at `http://localhost:4000`; health is available at `GET /api/health`. Interactive Swagger documentation is available at `http://localhost:4000/api/docs` and its OpenAPI JSON at `GET /api/docs.json`.

## Verification

Run `npm run lint`, `npm run typecheck`, and `npm run build` inside both `front/` and `back/` before completing a feature.

Project requirements and workflow are documented in `docs/`.
