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

Here is a list of Docker commands specifically tailored to isolate and manage **only this Nexovision project**, preventing interference with other Docker projects you might have running.

*Note: Replace `--profile dev` with `--profile full` depending on which environment you are running.*

### Start Project
Start all Nexovision containers in the background, explicitly defining the project name (`-p nexovision`):
```bash
docker-compose -p nexovision --profile dev up -d
```

### Stop Project
Stop all running Nexovision containers without destroying data:
```bash
docker-compose -p nexovision --profile dev stop
```

### Shut Down Project
Stop and remove all Nexovision containers, networks, and unused volumes:
```bash
docker-compose -p nexovision --profile dev down
```

### Restart a Specific Service
To restart just the frontend or backend without affecting your other Docker containers, target them by their exact container names:
```bash
# Restart the React frontend
docker restart nexovision-client

# Restart the Express backend
docker restart nexovision-server
```

### View Logs for a Specific Service
View live logs for just the frontend or backend using their specific container names:
```bash
# View logs for the frontend
docker logs -f nexovision-client

# View logs for the backend
docker logs -f nexovision-server
```

### Rebuild Containers
If you install new npm packages or change a `Dockerfile`, rebuild the images for this specific project:
```bash
docker-compose -p nexovision --profile dev up -d --build
```

### Access a Running Container
Open an interactive terminal inside the server container to run commands:
```bash
docker exec -it nexovision-server /bin/sh
```
