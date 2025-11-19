# Quick Docker Deployment

## One-Command Deployment

```bash
docker-compose up -d --build
```

This will build and start the Shift Tracker app container.

## Configuration

The app is pre-configured to connect to MongoDB at:
```
mongodb://192.168.0.9:27017/shift-tracker
```

## Set JWT Secret (Recommended)

Create a `.env` file:
```bash
JWT_SECRET=your-secure-secret-here
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

## Access the App

- Local: http://localhost:3000
- Network: http://YOUR_SERVER_IP:3000

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop container
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Check status
docker-compose ps
```

## Network Access

To access from other devices:
1. Find server IP: `hostname -I`
2. Open firewall: `sudo ufw allow 3000/tcp`
3. Access: `http://YOUR_IP:3000`

