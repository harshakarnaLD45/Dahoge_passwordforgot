$conns = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
if (-not $conns) { Write-Output "port 5000 free"; exit }
foreach ($c in $conns) {
    Write-Output ("killing PID " + $c.OwningProcess)
    Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
}
