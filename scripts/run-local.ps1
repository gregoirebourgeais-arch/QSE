$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

function Get-LocalIPv4 {
  $ips = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) |
    Where-Object { $_.AddressFamily -eq 'InterNetwork' -and $_.IPAddressToString -notlike '127.*' }
  if ($ips.Count -gt 0) { return $ips[0].IPAddressToString }
  return "127.0.0.1"
}

$PcIp = Get-LocalIPv4

Write-Host "[QSE] Démarrage automatique..."
Write-Host "[QSE] Étape 1/3: Backend + base de données"

if (Get-Command docker -ErrorAction SilentlyContinue) {
  Push-Location $Root
  docker compose up -d --build
  Pop-Location
  Write-Host "[QSE] Backend OK: http://localhost:8001"
} else {
  Write-Host "[QSE][ERREUR] Docker Desktop n'est pas installé."
  Write-Host "Installe Docker Desktop puis relance ce fichier."
  exit 1
}

Write-Host "[QSE] Étape 2/3: Configuration mobile"
Set-Location "$Root/frontend"
if (!(Test-Path ".env")) { Copy-Item "env.sample" ".env" }

(Get-Content .env) -replace '^EXPO_PUBLIC_BACKEND_URL=.*', "EXPO_PUBLIC_BACKEND_URL=http://$PcIp`:8001" | Set-Content .env
Write-Host "[QSE] URL backend configurée automatiquement: http://$PcIp`:8001"

Write-Host "[QSE] Étape 3/3: Lancement de l'application"
yarn install
yarn start:offline
