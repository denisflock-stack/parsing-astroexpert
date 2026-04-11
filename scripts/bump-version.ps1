param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('patch', 'minor', 'major')]
  [string]$Bump
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $repoRoot 'extension\manifest.json'

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Manifest not found: $manifestPath"
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$currentVersion = [string]$manifest.version

if ($currentVersion -notmatch '^(\d+)\.(\d+)\.(\d+)$') {
  throw "Unsupported manifest version format: $currentVersion"
}

$major = [int]$matches[1]
$minor = [int]$matches[2]
$patch = [int]$matches[3]

switch ($Bump) {
  'patch' {
    $patch += 1
  }
  'minor' {
    $minor += 1
    $patch = 0
  }
  'major' {
    $major += 1
    $minor = 0
    $patch = 0
  }
}

$nextVersion = '{0}.{1}.{2}' -f $major, $minor, $patch
$manifest.version = $nextVersion

$updatedJson = $manifest | ConvertTo-Json -Depth 20
[System.IO.File]::WriteAllText($manifestPath, $updatedJson + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))

Write-Output "Version bumped: $currentVersion -> $nextVersion"
