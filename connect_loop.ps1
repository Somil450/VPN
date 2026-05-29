$configs = 0..9 | Get-Random -Count 10
foreach ($i in $configs) {
    Write-Host "Testing config-$i.ovpn..."
    # Stop existing OpenVPN and reset network adapter
    $proc = Get-Process openvpn -ErrorAction SilentlyContinue
    if ($proc) { Stop-Process -Id $proc.Id -Force }
    Restart-NetAdapter -InterfaceDescription *TAP-Windows* -ErrorAction SilentlyContinue
    
    # Run OpenVPN silently but redirect output to a log file
    Start-Process -FilePath "C:\Program Files\OpenVPN\bin\openvpn.exe" -ArgumentList "--config `"$PSScriptRoot\config-$i.ovpn`"" -WorkingDirectory "$PSScriptRoot" -RedirectStandardOutput "$PSScriptRoot\ovpn-log-$i.txt" -RedirectStandardError "$PSScriptRoot\ovpn-err-$i.txt" -WindowStyle Hidden
    
    # Wait for connection
    Start-Sleep -Seconds 18
    
    # Check IP
    $ipconfig = ipconfig
    $ipconfig | Out-File "$PSScriptRoot\ipconfig-debug-$i.txt"
    $vpnIp = $null
    $isVpnAdapter = $false
    
    foreach ($line in $ipconfig) {
        if ($line -match "^[A-Za-z]") {
            if ($line -match "OpenVPN TAP-Windows6" -or $line -match "TAP-Windows Adapter V9") {
                $isVpnAdapter = $true
            } else {
                $isVpnAdapter = $false
            }
        } elseif ($isVpnAdapter -and $line -match "IPv4 Address[^:]*: (\d+\.\d+\.\d+\.\d+)") {
            $vpnIp = $matches[1]
            break
        }
    }
    
    if ($vpnIp) {
        Write-Host "Connected successfully! IP: $vpnIp"
        "SUCCESS: $vpnIp" | Out-File "$PSScriptRoot\vpn-status.txt"
        exit
    } else {
        Write-Host "Failed to connect with config-$i."
    }
}
"FAILED" | Out-File "$PSScriptRoot\vpn-status.txt"
