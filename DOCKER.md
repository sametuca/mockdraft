# MockDraft Docker Usage

## Building the Image

```bash
docker build -t mockdraft:latest .
```

## Running the Container

### Basic Usage
```bash
docker run -p 3000:3000 -v $(pwd)/openapi.yaml:/app/specs/openapi.yaml mockdraft:latest
```

### With Custom Arguments
```bash
# Enable delay
docker run -p 3000:3000 -v $(pwd)/openapi.yaml:/app/specs/openapi.yaml mockdraft:latest start /app/specs/openapi.yaml -p 3000 --delay

# Enable chaos mode
docker run -p 3000:3000 -v $(pwd)/openapi.yaml:/app/specs/openapi.yaml mockdraft:latest start /app/specs/openapi.yaml -p 3000 --chaos

# Enable both
docker run -p 3000:3000 -v $(pwd)/openapi.yaml:/app/specs/openapi.yaml mockdraft:latest start /app/specs/openapi.yaml -p 3000 --delay --chaos

# Custom port
docker run -p 4000:4000 -v $(pwd)/openapi.yaml:/app/specs/openapi.yaml mockdraft:latest start /app/specs/openapi.yaml -p 4000
```

## Using Docker Compose

### Start the service
```bash
docker-compose up
```

### Start with rebuild
```bash
docker-compose up --build
```

### Run in background
```bash
docker-compose up -d
```

### Stop the service
```bash
docker-compose down
```

### Enable features
Edit `docker-compose.yml` and uncomment the command line with `--delay` and `--chaos` flags.

## Multi-stage Build

The Dockerfile uses a multi-stage build to:
1. **Builder stage**: Installs all dependencies and compiles TypeScript
2. **Production stage**: Only includes production dependencies and compiled code

This results in a smaller final image (~150MB instead of ~300MB).

## Volume Mounting

Mount your OpenAPI specs to `/app/specs/`:
```bash
docker run -v $(pwd)/my-api.yaml:/app/specs/openapi.yaml mockdraft:latest
```

## Environment Variables

None required currently. The tool is fully configured via command-line arguments.
