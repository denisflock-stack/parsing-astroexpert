param(
  [string]$OutputDir = 'dist'
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$extensionDir = Join-Path $repoRoot 'extension'
$outputRoot = Join-Path $repoRoot $OutputDir
$manifestPath = Join-Path $extensionDir 'manifest.json'

if (-not (Test-Path -LiteralPath $extensionDir)) {
  throw "Extension directory not found: $extensionDir"
}

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Manifest not found: $manifestPath"
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$version = [string]$manifest.version

if (-not (Test-Path -LiteralPath $outputRoot)) {
  New-Item -ItemType Directory -Path $outputRoot | Out-Null
}

$zipName = "astro-expert-chart-parser-$version.zip"
$zipPath = Join-Path $outputRoot $zipName

if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $extensionDir '*') -DestinationPath $zipPath -Force

Write-Output "Package created: $zipPath"
