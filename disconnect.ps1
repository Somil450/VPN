# Kill the background connection loop if it's still running
Get-WmiObject Win32_Process -Filter "name='powershell.exe' and CommandLine like '%connect_loop.ps1%'" | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

# Kill the actual OpenVPN process
Get-Process openvpn -ErrorAction SilentlyContinue | Stop-Process -Force

# Reset the network adapter
Restart-NetAdapter -InterfaceDescription *TAP-Windows* -ErrorAction SilentlyContinue
