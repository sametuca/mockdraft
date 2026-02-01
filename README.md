# DoppelAPI

> **The digital twin of your backend.**

DoppelAPI is a powerful CLI tool that instantly converts your OpenAPI (Swagger) definition into a fully functional, intelligent mock server. 

It is designed to solve the age-old problem in software development: **Frontend developers waiting for backend APIs to be implemented.**

With DoppelAPI, you create a "Digital Twin" of your future backend. It reads your API contract (OpenAPI file) and spawns a server that behaves exactly like the real thing—populating responses with realistic, smart data automatically.

## Why DoppelAPI?

- **Unblock Frontend Teams**: Start building UI components immediately using the agreed-upon API contract. No more "mocking hardcoded JSONs" in your codebase.
- **Smart & Realistic Data**: Instead of returning `string` or `null`, DoppelAPI uses AI-driven Faker.js integration to return real names, emails, addresses, and images based on your schema.
- **Test Edge Cases**: Simulate slow networks (latency) or server crashes (chaos mode) with a single flag to ensure your app handles errors gracefully.
- **Self-Documenting**: Includes a beautiful Visual Dashboard that serves as live documentation for your team, complete with copy-pasteable request/response examples.

## Features

- **Instant Mock Server**: Turn any valid OpenAPI 3.0+ file (YAML or JSON) into a running server instantly.
- **Smart Data Generation**: Uses `json-schema-faker` and `@faker-js/faker` to generate realistic data.
  - Supports `x-faker` schema extensions for precise control (e.g. usernames, emails, avatars).
- **Visual Dashboard**: A beautiful web interface to view endpoints, request/response examples and documentation.
- **Postman Export**: One-click export of your mock API as a Postman Collection.
- **Hot Reload**: Automatically watches your OpenAPI file and restarts the server on changes.
- **Network Simulation**: Simulate network latency (500-1500ms) to test loading states.
- **Chaos Mode**: Simulate server instability with random 500 errors (10% chance) to test error handling.
- **CORS Enabled**: Automatically handles CORS headers, allowing access from any frontend application.
- **Docker Support**: Run explicitly in a containerized environment for consistent testing.
- **Interactive CLI**: User-friendly wizard to auto-discover files and configure options.

## Installation

```bash
npm install -g doppelapi
```

## Usage

### Quick Start (Interactive Mode)
Simply run the command without arguments to launch the wizard:
```bash
doppelapi
```
The interactive menu will auto-discover OpenAPI files in your directory, or let you provide a custom path:
```text
? Select an OpenAPI file (or choose custom path):
  > openapi.yaml
    ecommerce.json
    Enter custom path manually...
```

### Command Line Arguments
```bash
# Basic usage
doppelapi start ./openapi.yaml --port 3000

# Basic usage with custom port
doppelapi start /Users/sametuca/Desktop/example.json --port 8080
doppelapi start /Users/sametuca/Desktop/example.yaml --port 8080

# Enable Hot Reload
doppelapi start ./openapi.yaml --watch

# Enable Network Latency Simulation
doppelapi start ./openapi.yaml --delay

# Enable Chaos Mode (Random 500 Errors)
doppelapi start ./openapi.yaml --chaos

# Combine flags
doppelapi start ./ecommerce.json --watch --delay --chaos
```

### Docker Usage

You can run DoppelAPI as a Docker container:

```bash
docker build -t doppelapi .
docker run -p 3000:3000 -v $(pwd)/openapi.yaml:/app/openapi.yaml doppelapi start /app/openapi.yaml
```

## Configuration

### Smart Data with `x-faker`
You can control the generated data by adding `x-faker` properties to your OpenAPI schema:

```yaml
User:
  type: object
  properties:
    id:
      type: string
      format: uuid
      x-faker: "string.uuid"
    email:
      type: string
      x-faker: "internet.email"
    avatar:
      type: string
      x-faker: "image.avatar"
```

## Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/sametuca/doppelapi
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Run in development mode**
   ```bash
   npm run dev
   ```

## License

MIT

