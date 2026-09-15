param([switch]$Build)
$ErrorActionPreference = 'Stop'
Push-Location (Join-Path $PSScriptRoot '..')
try {
    npm.cmd --prefix frontend run lint
    if ($LASTEXITCODE -ne 0) { throw 'Lint failed' }
    npm.cmd --prefix frontend run typecheck
    if ($LASTEXITCODE -ne 0) { throw 'Type check failed' }
    & '.\ai-service\.venv\Scripts\python.exe' -m pytest ai-service/tests -q
    if ($LASTEXITCODE -ne 0) { throw 'Python tests failed' }
    node scripts/check-database.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Legacy schema tests failed' }
    node scripts/check-database.mjs --current-layout
    if ($LASTEXITCODE -ne 0) { throw 'Current schema tests failed' }
    if ($Build) {
        npm.cmd --prefix frontend run build
        if ($LASTEXITCODE -ne 0) { throw 'Production build failed' }
    }
} finally { Pop-Location }
