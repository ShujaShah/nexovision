# Nexovision

Nexovision is a modern medical imaging platform that leverages artificial intelligence (powered by MedGemma via Ollama) to automatically analyze medical scans and generate structured clinical reports. The application supports multi-tenant clinics, role-based access control, and batch image analysis workflows.

## Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Ollama (MedGemma Vision Model)
- **Deployment**: Docker & Docker Compose

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- (Optional) [Ollama](https://ollama.com/) running locally if you plan to use native GPU acceleration on macOS/Windows instead of running Ollama inside Docker.

## Setup Instructions

The project uses Docker Compose with profiles to manage different running environments.

1. Create a `.env` file in the root directory (or use the provided defaults).
2. Start the application using Docker Compose.

### Running with Docker

Since the project uses Docker Compose profiles (`full` and `dev`), you must specify a profile when starting the services.

**Option 1: Full Profile (Everything in Docker)**
This runs the Client, Server, MongoDB, and Ollama all inside Docker containers.
```bash
docker-compose --profile full up -d
```

**Option 2: Dev Profile (Native Ollama)**
This runs the Client, Server, and MongoDB in Docker, but assumes you are running Ollama natively on your host machine (e.g., to take advantage of Apple Silicon GPU acceleration).
```bash
docker-compose --profile dev up -d
```

## Useful Docker Commands

Here is a list of commonly used Docker commands for managing the Nexovision project. 

*Note: Replace `--profile dev` with `--profile full` depending on which environment you are running.*

### Start Project
Start all containers in the background:
```bash
docker-compose --profile dev up -d
```

### Stop Project
Stop all running containers without destroying data:
```bash
docker-compose --profile dev stop
```

### Shut Down Project
Stop and remove all containers, networks, and unused volumes (this will not delete your database volume unless specified):
```bash
docker-compose --profile dev down
```

### Restart Project
Restart all running containers:
```bash
docker-compose --profile dev restart
```

### Restart a Specific Service
Restart just the backend server (or `client`, `mongodb`, `ollama`):
```bash
docker-compose --profile dev restart server
```

### View Logs
View the live logs for all running services:
```bash
docker-compose --profile dev logs -f
```

### View Logs for a Specific Service
View live logs for just the backend server:
```bash
docker-compose --profile dev logs -f server
```

### Rebuild Containers
If you install new npm packages or change the `Dockerfile`, you need to rebuild the images:
```bash
docker-compose --profile dev up -d --build
```
*(You can also rebuild a specific service, e.g., `docker-compose --profile dev build client`)*

### Access a Running Container
Open an interactive terminal inside the server container:
```bash
docker exec -it nexovision-server /bin/sh
```
