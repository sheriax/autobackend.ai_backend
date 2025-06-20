# Auto Backend AI

Auto Backend AI is a service that automatically generates production-ready Hono.js backend code from OpenAPI specifications using Google's Generative AI.

## Features

- **OpenAPI to Code**: Convert OpenAPI 3.0 specifications into complete Hono.js projects
- **TypeScript Support**: All generated code is in TypeScript with proper typing
- **Input Validation**: Automatic Zod schema generation from OpenAPI schemas
- **Complete Project Structure**: Generates a full project structure with routes, models, and utilities
- **Documentation**: Includes JSDoc comments and a helpful README

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google API Key with access to Generative AI models

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Google API key:

```
GOOGLE_API_KEY=your_api_key_here
# OR
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### Running the Service

Start the development server:

```bash
npm run dev
```

The service will be available at `http://localhost:3000` (or the port specified in your environment variables).

## Usage

### Generate Backend Code

Send a POST request to the `/generate` endpoint with your OpenAPI specification:

```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d @your-openapi-spec.json
```

The response will contain the generated files as a JSON object.

### Get a Sample OpenAPI Spec

You can get a sample OpenAPI specification by sending a GET request to the `/sample-spec` endpoint:

```bash
curl http://localhost:3000/sample-spec
```

### Test the API

You can test if your API key is working correctly by sending a GET request to the `/test-api` endpoint:

```bash
curl http://localhost:3000/test-api
```

## API Endpoints

- `GET /`: Welcome message
- `GET /health`: Health check endpoint
- `POST /generate`: Generate backend code from OpenAPI spec
- `GET /sample-spec`: Get a sample OpenAPI specification
- `GET /test-api`: Test the Google API key

## Environment Variables

- `PORT`: The port on which the server will run (default: 3000)
- `NODE_ENV`: The environment (development, production, etc.)
- `GOOGLE_API_KEY`: Your Google API key
- `GOOGLE_GENERATIVE_AI_API_KEY`: Alternative way to specify your Google API key

## License

MIT