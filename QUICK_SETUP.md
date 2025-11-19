# Quick Setup Guide

## ✅ Completed
- ✅ Secure JWT secret generated and added to `.env.local`
- ✅ MongoDB connection string configured in `.env.local`

## Next Steps

### Option 1: Install MongoDB via Package Manager (Recommended)

Run these commands in your terminal:

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option 2: Use Docker (If Docker is installed)

```bash
# Start MongoDB in Docker
docker-compose up -d

# Check if it's running
docker ps
```

### Option 3: Use MongoDB via Snap

```bash
sudo snap install mongodb
sudo snap start mongodb
```

## Verify MongoDB is Running

```bash
# Test connection
mongosh --eval "db.version()"
```

Or simply try:
```bash
mongosh
```

## Install Node.js (if not already installed)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

## Install Project Dependencies

```bash
npm install
```

## Start the Application

```bash
npm run dev
```

The application will be available at: http://localhost:3000

## Your Environment Variables

Your `.env.local` file is already configured with:
- **MONGODB_URI**: `mongodb://localhost:27017/shift-tracker`
- **JWT_SECRET**: A secure random string (already generated)

No further configuration needed! Just install MongoDB and Node.js, then run `npm install` and `npm run dev`.

