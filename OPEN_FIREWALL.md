# Open Firewall Port 3000

The server is running correctly on `0.0.0.0:3000`, but the firewall may be blocking access from other devices.

## Quick Fix - Run These Commands:

```bash
# Check firewall status
sudo ufw status

# Allow port 3000 through the firewall
sudo ufw allow 3000/tcp

# Verify the rule was added
sudo ufw status numbered
```

## Alternative: If using firewalld

```bash
# Check status
sudo firewall-cmd --state

# Allow port 3000
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-ports
```

## After Opening the Port

1. Your server IP: **192.168.0.25**
2. Access from other devices: **http://192.168.0.25:3000**

## Troubleshooting

If still not accessible:

1. **Check if firewall is active:**
   ```bash
   sudo ufw status verbose
   ```

2. **Check if port is actually listening:**
   ```bash
   netstat -tlnp | grep :3000
   # Should show: 0.0.0.0:3000
   ```

3. **Test from the same machine:**
   ```bash
   curl http://192.168.0.25:3000
   ```

4. **Check router settings** - Some routers block local network access

5. **Try accessing from another device using:**
   - http://192.168.0.25:3000
   - Make sure both devices are on the same WiFi/network

## Verify Server is Running

The server should be running with:
```bash
npm run dev
```

This now includes `-H 0.0.0.0` to bind to all interfaces.

