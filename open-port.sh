#!/bin/bash
# Script to open port 3000 for network access

echo "Opening port 3000 for network access..."

# Check if UFW is active
if command -v ufw &> /dev/null; then
    echo "Using UFW firewall..."
    sudo ufw allow 3000/tcp
    echo "Port 3000 has been opened!"
    echo ""
    echo "Current firewall status:"
    sudo ufw status numbered | grep 3000
elif command -v firewall-cmd &> /dev/null; then
    echo "Using firewalld..."
    sudo firewall-cmd --permanent --add-port=3000/tcp
    sudo firewall-cmd --reload
    echo "Port 3000 has been opened!"
    echo ""
    echo "Current firewall rules:"
    sudo firewall-cmd --list-ports | grep 3000
else
    echo "No firewall manager found. You may need to configure your firewall manually."
    echo "Check your system's firewall settings to allow port 3000."
fi

echo ""
echo "Your server should now be accessible at:"
echo "  http://192.168.0.25:3000"
echo ""
echo "From other devices on your network, use the IP address above."

