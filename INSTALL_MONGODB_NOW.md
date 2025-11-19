# Install MongoDB Now

## Quick Install Command

Run this command to install MongoDB:

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add - && \
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list && \
sudo apt update && \
sudo apt install -y mongodb-org && \
sudo systemctl start mongod && \
sudo systemctl enable mongod
```

## Verify Installation

After installation, verify MongoDB is running:

```bash
sudo systemctl status mongod
```

You should see "Active: active (running)".

## Test Connection

```bash
# Test if MongoDB is listening on port 27017
nc -z localhost 27017 && echo "MongoDB is running!" || echo "MongoDB is not running"
```

## Alternative: Use Docker (if you have Docker installed)

If you prefer Docker:

```bash
docker run -d -p 27017:27017 --name shift-tracker-mongodb mongo:7.0
```

## After Installation

Once MongoDB is running, try registering again. The error message should now be more helpful if there are any issues.

The server is already running, so you don't need to restart it - just install MongoDB and try again!

