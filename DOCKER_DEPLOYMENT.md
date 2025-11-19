# Docker Deployment Guide

This guide will help you deploy the Shift Tracker app using Docker.

## Prerequisites

- Docker installed on your server
- Docker Compose installed
- MongoDB server accessible at `192.168.0.9:27017`

## Quick Start

1. **Set Environment Variables (Optional)**

   Create a `.env` file in the project root if you want to override the JWT secret:
   ```bash
   JWT_SECRET=your-secure-jwt-secret-key-here
   ```

   If you don't create a `.env` file, a default secret will be used (change this in production!).

2. **Build and Start the Container**

   ```bash
   docker-compose up -d --build
   ```

   This will:
   - Build the Next.js application
   - Start the application container
   - Configure it to connect to MongoDB at `192.168.0.9:27017`

3. **Access the Application**

   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

   Or if accessing from another device on your network:
   ```
   http://YOUR_SERVER_IP:3000
   ```

## Configuration

### Environment Variables

The app is configured with these environment variables in `docker-compose.yml`:

- `MONGODB_URI`: `mongodb://192.168.0.9:27017/shift-tracker` (hardcoded)
- `JWT_SECRET`: Can be set via `.env` file or uses default
- `PORT`: `3000`
- `HOSTNAME`: `0.0.0.0` (allows network access)

### Changing the MongoDB Connection

To change the MongoDB connection string, edit `docker-compose.yml`:
```yaml
environment:
  - MONGODB_URI=mongodb://YOUR_MONGODB_HOST:27017/shift-tracker
```

Then restart the container:
```bash
docker-compose down
docker-compose up -d
```

### Port Configuration

To change the port, edit `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:3000"  # Change YOUR_PORT to desired port
```

## Management Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Just the app
docker-compose logs -f app
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Stop and Remove Container
```bash
docker-compose down
```

## Health Checks

The container includes a health check that verifies the API is responding. Check status with:
```bash
docker-compose ps
```

## Network Access

To access from other devices on your network:

1. Find your server's IP:
   ```bash
   hostname -I
   ```

2. Ensure firewall allows port 3000:
   ```bash
   sudo ufw allow 3000/tcp
   ```

3. Access from other devices:
   ```
   http://YOUR_SERVER_IP:3000
   ```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# Check container status
docker-compose ps
```

### Can't connect to MongoDB
- Verify MongoDB is running at `192.168.0.9:27017`
- Check network connectivity: `ping 192.168.0.9`
- Ensure MongoDB allows connections from your Docker host
- Check MongoDB logs on the remote server

### Application errors
- Check app logs: `docker-compose logs app`
- Verify environment variables are set correctly
- Ensure MongoDB is accessible from the container

### Port already in use
- Change the port in `docker-compose.yml`
- Or stop the service using port 3000

## Production Considerations

1. **Change JWT_SECRET**: Use a strong, random secret
   ```bash
   openssl rand -base64 32
   ```
   Add it to `.env` file or set it in `docker-compose.yml`

2. **Use HTTPS**: Set up a reverse proxy (nginx/traefik) with SSL

3. **Resource Limits**: Add resource limits in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```

4. **Update Regularly**: Keep Docker images updated
   ```bash
   docker-compose pull
   docker-compose up -d --build
   ```

## File Structure

```
ShiftApp/
├── Dockerfile              # App container definition
├── docker-compose.yml      # Container orchestration
├── .dockerignore          # Files to exclude from build
└── .env                   # Environment variables (optional)
```

## Support

If you encounter issues:
1. Check container logs: `docker-compose logs`
2. Verify container is running: `docker-compose ps`
3. Check network connectivity to MongoDB: `ping 192.168.0.9`

