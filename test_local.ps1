$routes = @("/", "/dashboard", "/doctor-portal", "/patient-portal", "/patient-portal/log")
$base = "http://localhost:3000"
$allOk = $true

foreach ($route in $routes) {
    try {
        $resp = Invoke-WebRequest -Uri ($base + $route) -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        Write-Host "OK $($resp.StatusCode)  $route"
    } catch {
        Write-Host "FAIL      $route  -- $($_.Exception.Message)"
        $allOk = $false
    }
}

if ($allOk) {
    Write-Host "`nAll routes passed!"
} else {
    Write-Host "`nSome routes failed."
}
