export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "EchoLine API",
    version: "1.0.0",
    description: "HTTP API for authentication, users, conversations, and chat history.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "System", description: "Server status endpoints" },
    { name: "Authentication", description: "Account access and JWT lifecycle" },
    { name: "Users", description: "Authenticated user discovery" },
    { name: "Conversations", description: "Direct chats and message history" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      User: {
        type: "object",
        required: ["id", "username", "displayName", "bio", "avatarUrl", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          username: { type: "string", example: "alex_01" },
          displayName: { type: "string", example: "Alex" },
          bio: { type: "string" },
          avatarUrl: { type: ["string", "null"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        required: ["user", "token"],
        properties: {
          user: { $ref: "#/components/schemas/User" },
          token: { type: "string", description: "15-minute Bearer JWT" },
        },
      },
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
      SearchUser: {
        type: "object",
        required: ["id", "username", "displayName", "bio", "avatarUrl"],
        properties: {
          id: { type: "string", format: "uuid" },
          username: { type: "string" },
          displayName: { type: "string" },
          bio: { type: "string" },
          avatarUrl: { type: ["string", "null"] },
        },
      },
      Conversation: {
        type: "object",
        required: ["id", "type", "participant", "lastMessage", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          type: { type: "string", enum: ["direct", "group"] },
          title: { type: ["string", "null"] },
          participant: { anyOf: [{ $ref: "#/components/schemas/SearchUser" }, { type: "null" }] },
          lastMessage: { type: ["object", "null"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Message: {
        type: "object",
        required: ["id", "conversationId", "sender", "content", "type", "createdAt"],
        properties: {
          id: { type: "string" },
          conversationId: { type: "string", format: "uuid" },
          sender: { type: "object" },
          content: { type: ["string", "null"] },
          type: { type: "string", example: "text" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          deletedAt: { type: ["string", "null"], format: "date-time" },
        },
      },
    },
    responses: {
      ValidationError: {
        description: "Request validation failed.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      Unauthorized: {
        description: "Authentication failed.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
    },
  },
  paths: {
    "/api/auth/signup": {
      post: {
        tags: ["Authentication"],
        summary: "Create an account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string", minLength: 3, maxLength: 30 },
                  password: { type: "string", minLength: 8, maxLength: 72, format: "password" },
                  displayName: { type: "string", maxLength: 50 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "409": {
            description: "Username already exists.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string", format: "password" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Authenticated.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get the current user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["user"],
                  properties: { user: { $ref: "#/components/schemas/User" } },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Log out and invalidate existing tokens",
        security: [{ bearerAuth: [] }],
        responses: {
          "204": { description: "Logged out." },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/users/search": {
      get: {
        tags: ["Users"],
        summary: "Search users",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string", minLength: 1, maxLength: 50 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } },
        ],
        responses: {
          "200": {
            description: "Matching users, excluding the requester.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    users: { type: "array", items: { $ref: "#/components/schemas/SearchUser" } },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/conversations": {
      get: {
        tags: ["Conversations"],
        summary: "List conversations",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Conversations ordered by recent activity.",
            content: { "application/json": { schema: { type: "object" } } },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Conversations"],
        summary: "Create or reuse a direct conversation",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: { userId: { type: "string", format: "uuid" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Existing direct conversation returned." },
          "201": { description: "Direct conversation created." },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { description: "Target user not found." },
        },
      },
    },
    "/api/conversations/{conversationId}/messages": {
      get: {
        tags: ["Conversations"],
        summary: "Get cursor-paginated message history",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "conversationId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "cursor", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 30 } },
        ],
        responses: {
          "200": {
            description: "Chronological page of messages and the next older cursor.",
            content: { "application/json": { schema: { type: "object" } } },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { description: "Conversation not found or unavailable to this user." },
        },
      },
    },
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Check API health",
        operationId: "getHealth",
        responses: {
          "200": {
            description: "The API is available.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: { type: "string", const: "ok" },
                  },
                },
                example: { status: "ok" },
              },
            },
          },
        },
      },
    },
  },
} as const;
