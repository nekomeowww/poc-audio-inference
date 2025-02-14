# `streaming-audio-backend`

## Pre-requisites

- [Node.js](https://nodejs.org/en/) (v20 or higher)
- [pnpm](https://pnpm.io/) (v8 or higher)

## Getting started

1. Clone the repository

```shell
git clone git@github.com:sizigi/streaming-audio-backend.git
cd streaming-audio-backend
```

2. Install dependencies

```shell
corepack enable # Make sure you have corepack enabled
pnpm install
```

3. Start development server

```shell
pnpm dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.
5. Backend should listen on [http://localhost:8080](http://localhost:8080) and should already configured with proxy for frontend.

## Project structure

```shell
.
├── apps     # Frontend applications
│   └── streaming-web
├── infra     # Infrastructure related
│   └── go
│       └── operator # Kubernetes streaming-backend-operator
├── packages # Shared packages
│   └── backend-shared
├── services # Backend services
│   ├── inference-server
│   └── streaming-backend
├── cspell.config.yaml  # Spell check config
├── eslint.config.mjs   # ESLint config
├── package.json        # Workspace global dependencies
├── pnpm-workspace.yaml # Monorepo config for pnpm
├── pnpm-lock.yaml
├── tsconfig.json       # TypeScript config for monorepo
└── vitest.workspace.ts # Unit test related
├── README.md
```

## Development

### Start essential depending services

```shell
docker compose up -d
```

### Configure before starting

1. Copy `.env.example` to `.env.local` and configure the environment variables.

### Start each server

You can always start any of the needed apps, packages or services by running either:

- `pnpm -F @streaming/web dev` for frontend
- `pnpm -F @streaming/backend dev` for backend
- `cd services/inference-server && pixi run start` for inference server

## Deployment

### Build image with `docker buildx`

```shell
docker buildx build --platform linux/arm64 --load . -f ./apps/streaming-web/Dockerfile -t test.sizigi.local/streaming-audio/web:0.0.1
docker buildx build --platform linux/arm64 --load . -f ./services/streaming-backend/Dockerfile -t test.sizigi.local/streaming-audio/backend:0.0.1
docker buildx build --platform linux/arm64 --load . -f ./services/inference-server/Dockerfile -t test.sizigi.local/streaming-audio/inference-server:0.0.1
```

> [!NOTE]
>
> For x86_64 (amd64)
>
> ```
> docker buildx build --platform linux/arm64 --load . -f ./apps/streaming-web/Dockerfile -t test.sizigi.local/streaming-audio/web:0.0.1
> docker buildx build --platform linux/arm64 --load . -f ./services/streaming-backend/Dockerfile -t test.sizigi.local/streaming-audio/backend:0.0.1
> docker buildx build --platform linux/arm64 --load . -f ./services/inference-server/Dockerfile -t test.sizigi.local/streaming-audio/inference-server:0.0.1
> ```

### Deploy with `docker`

```shell
docker run -dit -p 8080:80 test.sizigi.local/streaming-audio/web:0.0.1
docker run -dit -p 8081:8081 -e REDIS_URL='URL of Redis' test.sizigi.local/streaming-audio/backend:0.0.1
docker run -dit -p 8082:8082 test.sizigi.local/streaming-audio/inference-server:0.0.1
```

## Terms

- `stub`: Generating a set of desired stubbing `.mjs`, `.d.ts` files for a package to be able to allow the end package to be able to resolve without complicated watch setup.
- `workspace`: A monorepo workspace that contains multiple packages, services or apps.
- `filter`: Please refer to [pnpm filter](https://pnpm.io/filtering) for more information.
