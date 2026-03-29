$root = "c:\Users\gupta\Desktop\Vicinity"

$pages = @(
  "app\page.js",
  "app\layout.js",
  "app\auth\callback\page.js",
  "app\browse\page.js",
  "app\forgot-password\page.js",
  "app\login\page.js",
  "app\signup\page.js",
  "app\business\[id]\page.js",
  "app\business\dashboard\page.js",
  "app\business\deals\page.js",
  "app\business\messages\page.js",
  "app\business\profile\page.js",
  "app\business\reviews\page.js",
  "app\business\settings\page.js",
  "app\user\dashboard\page.js",
  "app\user\messages\page.js",
  "app\user\profile\page.js",
  "app\user\reviews\page.js",
  "app\user\saved\page.js"
)

foreach ($p in $pages) {
  $src = Join-Path $root $p
  $dst = $src -replace '\.js$', '.tsx'
  if (Test-Path $src) {
    Copy-Item $src $dst -Force
    Write-Host "Copied: $p"
  } else {
    Write-Host "MISSING: $p"
  }
}

# Copy component files
$components = @(
  "components\BusinessCard.jsx",
  "components\BusinessLayout.jsx"
)

foreach ($c in $components) {
  $src = Join-Path $root $c
  $dst = $src -replace '\.jsx$', '.tsx'
  if (Test-Path $src) {
    Copy-Item $src $dst -Force
    Write-Host "Copied: $c"
  } else {
    Write-Host "MISSING: $c"
  }
}

Write-Host "All files copied."
