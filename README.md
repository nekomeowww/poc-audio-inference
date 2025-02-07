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
├── packages # Shared packages
│   └── backend-shared
├── services # Backend services
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

You can always start any of the needed apps, packages or services by running either:

- `pnpm -r --filter=./apps/streaming-web dev` for frontend
- `pnpm -r --filter=./services/streaming-backend dev` for backend

## Terms

- `stub`: Generating a set of desired stubbing `.mjs`, `.d.ts` files for a package to be able to allow the end package to be able to resolve without complicated watch setup.
- `workspace`: A monorepo workspace that contains multiple packages, services or apps.
- `filter`: Please refer to [pnpm filter](https://pnpm.io/filtering) for more information.
