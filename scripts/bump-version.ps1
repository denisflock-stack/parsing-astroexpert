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

$manifestText = Get-Content -LiteralPath $manifestPath -Raw
$manifest = $manifestText | ConvertFrom-Json
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
$updatedText = [regex]::Replace(
  $manifestText,
  '("version"\s*:\s*")([^"]+)(")',
  "`${1}$nextVersion`${3}",
  1
)

[System.IO.File]::WriteAllText($manifestPath, $updatedText, [System.Text.UTF8Encoding]::new($false))

Write-Output "Version bumped: $currentVersion -> $nextVersion"
