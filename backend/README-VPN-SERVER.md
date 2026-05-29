# VPN Server Setup Guide

Since you are building a real VPN with Electron and OpenVPN/WireGuard, your backend server must be configured as a real VPN endpoint. This cannot be done purely in Node.js.

You will need a Linux Server (e.g., Ubuntu 20.04/22.04 or Debian) to act as the VPN gateway.

## Option 1: OpenVPN (Recommended for Compatibility)

### 1. Install OpenVPN Server
The easiest way to set up an OpenVPN server is using the popular `openvpn-install` script:
```bash
curl -O https://raw.githubusercontent.com/angristan/openvpn-install/master/openvpn-install.sh
chmod +x openvpn-install.sh
./openvpn-install.sh
```
Follow the interactive prompts to set it up. The script will automatically handle iptables rules for NAT.

### 2. Generate Client Config
After setup, run the script again to generate client configurations (`.ovpn` files). You will need to bundle these `.ovpn` files with your Electron application or distribute them to your users.

## Option 2: WireGuard (Recommended for Speed)

### 1. Install WireGuard
You can use `pivpn` or `wireguard-install`:
```bash
curl -O https://raw.githubusercontent.com/angristan/wireguard-install/master/wireguard-install.sh
chmod +x wireguard-install.sh
./wireguard-install.sh
```

## Manual IP Forwarding & NAT (If doing it manually)
If you install the packages manually, you MUST enable IP forwarding so the VPN server can route your traffic to the internet.

1. Enable IP Forwarding:
```bash
echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

2. Configure NAT (assuming `eth0` is your public interface and `tun0` is the VPN interface):
```bash
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo iptables -A FORWARD -i tun0 -o eth0 -j ACCEPT
sudo iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
```

## Integrating with your Node.js Backend
Your existing Node.js backend can still be used for user authentication, billing, or serving the `.ovpn` configuration files to the authenticated Electron client. 

For example, your Electron client logs in via the Node.js API, and upon success, the Node.js API returns the OpenVPN config file content. The Electron app saves this to a temporary file and launches the `openvpn` process with it.
