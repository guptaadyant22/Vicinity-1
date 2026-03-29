$root = "c:\Users\gupta\Desktop\Vicinity"

# Delete old JS page files (now have .tsx versions)
$pages = @(
  "app\page.js",
  "app\layout.js",
  "app\auth\callback\page.js",
  "app\browse\page.js",
  "app\forgot-password\page.js",
  "app\login\page.js",
  "app\signup\page.js",
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
  if (Test-Path $src) {
    Remove-Item $src -Force
    Write-Host "Deleted: $p"
  }
}

# Delete business [id] page.js
Remove-Item -LiteralPath (Join-Path $root "app\business\[id]\page.js") -Force -ErrorAction SilentlyContinue
Write-Host "Deleted: app\business\[id]\page.js"

# Delete old JSX/JS component files (now have .tsx versions)
$components = @(
  "components\AISearchBar.jsx",
  "components\AuthNavbar.jsx",
  "components\BusinessCard.jsx",
  "components\BusinessLayout.jsx",
  "components\Footer.jsx",
  "components\Navbar.jsx",
  "components\ProfileNavbar.jsx",
  "components\ThemeToggle.jsx",
  "components\UserNavbar.jsx",
  "components\VicinityLogo.jsx",
  "components\providers.js"
)

foreach ($c in $components) {
  $src = Join-Path $root $c
  if (Test-Path $src) {
    Remove-Item $src -Force
    Write-Host "Deleted: $c"
  }
}

# Delete old context JS files (now have .tsx versions)
$contexts = @(
  "context\AuthContext.js",
  "context\ThemeContext.js"
)

foreach ($ctx in $contexts) {
  $src = Join-Path $root $ctx
  if (Test-Path $src) {
    Remove-Item $src -Force
    Write-Host "Deleted: $ctx"
  }
}

# Delete old lib JS files (now have .ts versions)
$libs = @(
  "lib\auth.js",
  "lib\ui.js",
  "lib\utils.js"
)

foreach ($l in $libs) {
  $src = Join-Path $root $l
  if (Test-Path $src) {
    Remove-Item $src -Force
    Write-Host "Deleted: $l"
  }
}

# Delete obsolete root-level JS scripts
$rootFiles = @(
  "final_refactor.js",
  "script_cleanup.js",
  "temp_nav.js",
  "jsconfig.json"
)

foreach ($rf in $rootFiles) {
  $src = Join-Path $root $rf
  if (Test-Path $src) {
    Remove-Item $src -Force
    Write-Host "Deleted: $rf"
  }
}

Write-Host ""
Write-Host "Cleanup complete."
