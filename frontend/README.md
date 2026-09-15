# Recruit360 frontend

Next.js, React, TypeScript, and Tailwind CSS. All frontend packages are installed in this directory; the repository root is not an npm workspace.

## Local development

From this directory:

```powershell
npm install
npm run dev
```

Open http://localhost:3000. The dev and build scripts explicitly use Webpack because Windows Application Control may block the native compiler required by Turbopack. Changing PowerShell execution policy does not unblock that compiler.

The Python virtual environment is only needed for the separate AI service. See the [project setup](../README.md) for environment variables and database preparation.

## Checks

```powershell
npm run lint
npm run typecheck
npm run build
```

For reproducible installation after the initial setup, use `npm ci` with the committed package-lock.json.
