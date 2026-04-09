# Demo App - Developing with Docker

This demo app shows a simple user profile application set up using:

- `index.html` with pure JavaScript and CSS styles
- `nodejs` backend with the `express` module
- `mongodb` for data storage

All components are Docker-based, and this setup works well on a single EC2 instance.

## Project Structure

- `app/` - Express API, static frontend, Dockerfile
- `docker-compose.yaml` - full stack with app, MongoDB, and mongo-express
- `.env.example` - environment values you can copy for local or EC2 deployment

## GitHub + EC2 workflow

This project is ready to place in a GitHub repository and deploy on an EC2 machine.

Typical flow:

1. Push this project to GitHub.
2. Launch an Ubuntu EC2 instance.
3. Install Docker and Docker Compose plugin on the instance.
4. Clone your GitHub repository onto EC2.
5. Copy `.env.example` to `.env` and adjust passwords if needed.
6. Start the stack with Docker Compose.
7. Open the app through your EC2 public IP or domain.

Example app URL:

```text
http://YOUR_EC2_PUBLIC_IP:3000
```

## With Docker

### To start the application

Step 1: Create a Docker network

```bash
docker network create mongo-network
```

Step 2: Start MongoDB

```bash
docker run -d -p 27017:27017 ^
  -e MONGO_INITDB_ROOT_USERNAME=admin ^
  -e MONGO_INITDB_ROOT_PASSWORD=password ^
  --name mongodb ^
  --net mongo-network ^
  mongo
```

Step 3: Start mongo-express

```bash
docker run -d -p 8081:8081 ^
  -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin ^
  -e ME_CONFIG_MONGODB_ADMINPASSWORD=password ^
  -e ME_CONFIG_MONGODB_SERVER=mongodb ^
  --net mongo-network ^
  --name mongo-express ^
  mongo-express
```

Note: Creating `mongo-network` is optional. You can start both containers in the default network, but then the container name and connectivity setup must still allow `mongo-express` to reach MongoDB.

Step 4: Open mongo-express in your browser

```text
http://localhost:8081
```

Step 5: Start the Node.js application locally

```bash
cd app
npm install
node server.js
```

The app will create the `user-account` database and `users` collection automatically the first time you save a user profile.

Step 6: Access the application UI from your browser

```text
http://localhost:3000
```

## With Docker Compose

### To start the application

Step 1: Start MongoDB, mongo-express, and the app

```bash
cp .env.example .env
docker compose -f docker-compose.yaml up --build -d
```

Step 2: Open the application

Local:

```text
http://localhost:3000
```

EC2:

```text
http://YOUR_EC2_PUBLIC_IP:3000
```

Step 3: Open mongo-express

Local:

```text
http://localhost:8081
```

EC2:

```text
http://YOUR_EC2_PUBLIC_IP:8081
```

The database `user-account` and collection `users` are created automatically when you save your first profile.

### To build a Docker image from the application

```bash
docker build -t my-app:1.0 ./app
```

## Deploy on EC2

### 1. Open the required ports in the EC2 security group

Allow inbound traffic for:

- `22` for SSH
- `3000` for the app
- `8081` for mongo-express if you want browser access

Do not open `27017` publicly unless you specifically want external MongoDB access.

### 2. Install Docker on Ubuntu EC2

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

Log out and log back in after adding your user to the `docker` group.

### 3. Clone your GitHub repository

```bash
git clone <your-github-repository-url>
cd <your-project-folder>
```

### 4. Create your environment file

```bash
cp .env.example .env
```

Then edit `.env` and change the default MongoDB password before production use.

### 5. Start the stack

```bash
docker compose up --build -d
```

### 6. Check running containers

```bash
docker compose ps
```

### 7. View logs if needed

```bash
docker compose logs -f app
```

## Production note

For a real production deployment on EC2, you would usually place Nginx or an Application Load Balancer in front of the app, add HTTPS, and protect or disable `mongo-express`. This demo keeps things simple so you can get running quickly.

## What the app does

The UI lets you:

- create a simple user profile
- list saved profiles from MongoDB
- view the live connection status

## Default configuration

- App URL: `http://localhost:3000`
- MongoDB URL: `mongodb://admin:password@mongodb:27017/?authSource=admin`
- Database name: `user-account`
- Collection name: `users`
