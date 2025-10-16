# SPDX-License-Identifier: Apache-2.0
# Copyright 2025 Vova Orig

$ErrorActionPreference = "Stop"

$variants = @(
    @{ Name = "Chrome"; Manifest = "manifest.json"; Output = "summarize-on-select-chrome.zip" },
    @{ Name = "Firefox"; Manifest = "manifest.firefox.json"; Output = "summarize-on-select-firefox.zip" }
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

foreach ($variant in $variants) {
    $zipName = $variant.Output
    Write-Host "==> Creating archive $zipName..." -ForegroundColor Cyan

    if (!(Test-Path $variant.Manifest)) {
        throw "Manifest file '$($variant.Manifest)' not found."
    }

    if (Test-Path $zipName) {
        Remove-Item $zipName -Force
        Write-Host "    Removed old archive" -ForegroundColor Yellow
    }

    $zipPath = Join-Path $PWD $zipName
    $zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')

    Write-Host "    + manifest.json (from $($variant.Manifest))" -ForegroundColor Green
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, (Resolve-Path $variant.Manifest), "manifest.json") | Out-Null

    Get-ChildItem -Path "src" -Recurse -File | ForEach-Object {
        $relativePath = $_.FullName.Substring($PWD.Path.Length + 1)
        $entryName = $relativePath -replace '\\', '/'
        Write-Host "    + $entryName" -ForegroundColor Green
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entryName) | Out-Null
    }

    $zip.Dispose()

    $fileSize = (Get-Item $zipName).Length
    $fileSizeKB = [math]::Round($fileSize / 1KB, 2)

    Write-Host "    Created $zipName ($fileSizeKB KB)" -ForegroundColor Green
    Write-Host ""
}
