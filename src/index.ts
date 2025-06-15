import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import env from './config/env';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Initialize Google client
if (!env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set in the environment variables');
}

const googleClient = google(env.GOOGLE_API_KEY);

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/', (c) => {
  return c.json({ message: 'Welcome to the Auto Backend API' })
})

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV 
  });
});

// OpenAPI spec schema for validation
const openApiSchema = z.object({
  openapi: z.string().regex(/^3\.\d+\.\d+$/, 'Must be OpenAPI 3.x.x'),
  info: z.object({
    title: z.string(),
    version: z.string(),
  }),
  paths: z.record(z.any()),
  components: z.object({
    schemas: z.record(z.any()).optional(),
  }).optional(),
});

// Core generation endpoint
app.post('/generate', async (c) => {
  try {
    // 1. Parse and validate the OpenAPI spec
    const body = await c.req.json();
    
    const validation = openApiSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ 
        error: 'Invalid OpenAPI specification',
        details: validation.error.format()
      }, 400);
    }

    const openapiSpec = validation.data;

    // 2. Enhanced system prompt for better code generation
    const systemPrompt = `You are an expert full-stack developer specializing in creating robust, production-ready backend services with Hono.js and TypeScript.

**TASK:** Generate a complete Hono.js project from the provided OpenAPI 3.0 specification.

**OUTPUT FORMAT:** Return a JSON object where:
- Keys are file paths (e.g., "src/routes/users.ts", "src/models/User.ts")
- Values are the complete file contents as strings

**PROJECT STRUCTURE:**
1. **src/index.ts**: Main entry point with Hono app initialization
2. **src/routes/*.ts**: Route handlers organized by resource
3. **src/models/*.ts**: TypeScript interfaces/types from OpenAPI schemas
4. **src/middleware/*.ts**: Custom middleware if needed
5. **src/utils/*.ts**: Utility functions
6. **package.json**: Complete dependencies
7. **tsconfig.json**: TypeScript configuration
8. **README.md**: Setup and usage instructions

**CODE REQUIREMENTS:**
- Use TypeScript with proper typing
- Implement proper error handling
- Add input validation using Zod
- Include proper HTTP status codes
- Add JSDoc comments for functions
- Use consistent code formatting
- Include example request/response data in comments

**DEPENDENCIES TO INCLUDE:**
- hono (latest)
- @hono/node-server
- zod (for validation)
- @types/node
- typescript
- tsx (for development)

Generate production-ready, well-documented code that follows best practices.`;

    // 3. Generate the project files
    const { object: generatedFiles } = await generateObject({
      model: googleClient,
      schema: z.record(z.string(), z.string()),
      system: systemPrompt,
      prompt: `Generate a complete Hono.js project for this OpenAPI specification:\n\n${JSON.stringify(openapiSpec, null, 2)}`,
      temperature: 0.1, // Lower temperature for more consistent code generation
    });

    // 4. Add metadata to the response
    const response = {
      success: true,
      metadata: {
        apiTitle: openapiSpec.info.title,
        apiVersion: openapiSpec.info.version,
        generatedAt: new Date().toISOString(),
        fileCount: Object.keys(generatedFiles).length,
        files: Object.keys(generatedFiles),
      },
      files: generatedFiles,
    };

    return c.json(response);

  } catch (error) {
    console.error('Error generating code:', error);
    
    // Better error handling
    if (error instanceof Error) {
      return c.json({ 
        error: 'Code generation failed',
        message: error.message,
        timestamp: new Date().toISOString()
      }, 500);
    }
    
    return c.json({ 
      error: 'Unknown error occurred during code generation',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Generate sample OpenAPI spec endpoint (for testing)
app.get('/sample-spec', (c) => {
  const sampleSpec = {
    openapi: "3.0.0",
    info: {
      title: "Sample Blog API",
      version: "1.0.0",
      description: "A simple blog API for testing"
    },
    paths: {
      "/posts": {
        get: {
          summary: "Get all posts",
          responses: {
            "200": {
              description: "List of posts",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Post"
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Create a new post",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreatePost"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Post created",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Post"
                  }
                }
              }
            }
          }
        }
      },
      "/posts/{id}": {
        get: {
          summary: "Get post by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string"
              }
            }
          ],
          responses: {
            "200": {
              description: "Post details",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Post"
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        Post: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            title: {
              type: "string"
            },
            content: {
              type: "string"
            },
            author: {
              type: "string"
            },
            createdAt: {
              type: "string",
              format: "date-time"
            }
          }
        },
        CreatePost: {
          type: "object",
          required: ["title", "content", "author"],
          properties: {
            title: {
              type: "string"
            },
            content: {
              type: "string"
            },
            author: {
              type: "string"
            }
          }
        }
      }
    }
  };

  return c.json(sampleSpec);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ 
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500);
});

const port = Number(env.PORT);
console.log(`🚀 Hono Auto Backend API running on port ${port}`);
console.log(`📝 Health check: http://localhost:${port}/health`);
console.log(`🔧 Generate API: POST http://localhost:${port}/generate`);
console.log(`📋 Sample spec: GET http://localhost:${port}/sample-spec`);

serve({
  fetch: app.fetch,
  port,
});