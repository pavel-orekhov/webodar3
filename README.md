![Netlify Examples](https://github.com/netlify/examples/assets/5865/4145aa2f-b915-404f-af02-deacee24f7bf)

# webodar3: MCP Server on Netlify Functions

**View the live site**: https://webodar3.netlify.app/

[![Netlify Status](https://api.netlify.com/api/v1/badges/d9d0cf30-4aa5-4bc6-9230-f76fd6f63554/deploy-status)](https://app.netlify.com/sites/webodar3/deploys)

## About webodar3

webodar3 is a basic example of developing and running a serverless MCP server using Netlify Functions.

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Docs: Netlify Functions](https://docs.netlify.com/functions/overview/?utm_campaign=dx-examples&utm_source=example-site&utm_medium=web&utm_content=example-mcp-express)
- [Agent Experience (AX)](https://agentexperience.ax?utm_source=express-mcp-guide&utm_medium=web&utm_content=example-mcp-express)

Importantly, because of how Express handles mapping routes, ensure you set the `netlify.toml` redirects to the correct path. In this repo we have the following to ensure <domain>/mcp catches all of the requests to this server:

```toml
[[redirects]]
  force = true
  from = "/mcp"
  status = 200
  to = "/.netlify/functions/express-mcp-server"
```

## Additional Pages

### Diagrams Viewer
Visit `/diagrams.html` to view, preview, and manage all PlantUML diagrams stored in Netlify Blobs.

Features:
- List all stored diagrams
- Expand/collapse diagram previews (iframe SVG)
- Delete diagrams
- View creation timestamps

Features:
- List all environment variables
- Masked values for security (last 4 chars hidden)
- Search/filter variables
- Flags for empty/undefined values

### PlantUML Encoder Tool
Visit `/plantuml.html` to learn about the MCP PlantUML encoder tool, syntax rules, and example usage.

## Netlify Blobs Configuration

The diagram storage uses Netlify Blobs with hardened configuration support:

### Automatic Configuration (Recommended)
When running via `netlify dev` or in Netlify Functions, the environment variables are automatically provided:
- `NETLIFY_SITE_ID` - Your site ID
- `NETLIFY_BLOBS_TOKEN` or `NETLIFY_AUTH_TOKEN` - Authentication token

### Manual Configuration
You can also provide explicit options when calling `getDiagramsStore()`:

```typescript
const store = getDiagramsStore({
  siteID: 'your-site-id',
  token: 'your-token'
});
```

### Error Handling
If required environment variables are missing, you'll receive a detailed error with:
- Which variables are present/missing
- The source of each variable (explicit or env)
- Specific guidance on how to fix the issue

Example error response:
```json
{
  "code": "MISSING_BLOBS_ENVIRONMENT",
  "message": "Netlify Blobs configuration is incomplete...",
  "details": {
    "siteID": {
      "present": false,
      "envKey": "NETLIFY_SITE_ID"
    },
    "token": {
      "present": false,
      "envKey": "NETLIFY_BLOBS_TOKEN"
    },
    "guidance": [
      "Set NETLIFY_SITE_ID environment variable or pass siteID option",
      "Set NETLIFY_BLOBS_TOKEN or NETLIFY_AUTH_TOKEN environment variable or pass token option",
      "For local development: netlify dev automatically provides these variables",
      "For production: these are automatically set in Netlify Functions",
      "For explicit configuration: call getDiagramsStore({ siteID, token })"
    ]
  }
}
```

## Available MCP Tools

### Store Diagram Tool
Store PlantUML diagrams in Netlify Blobs with a label/key.

#### Parameters
- `label` (string): Label/key to identify the diagram
- `plantumlCode` (string): PlantUML diagram code to store
- `url` (string, optional): Encoded PlantUML URL

#### Example
```json
{
  "tool": "store-diagram",
  "arguments": {
    "label": "my-architecture",
    "plantumlCode": "@startuml\nA -> B: Hello\n@enduml",
    "url": "https://uml.planttext.com/plantuml/svg/..."
  }
}
```

### Get Diagram by Label Tool
Retrieve a stored PlantUML diagram by its label.

#### Parameters
- `label` (string): Label/key of the diagram to retrieve

#### Example
```json
{
  "tool": "get-diagram-by-label",
  "arguments": {
    "label": "my-architecture"
  }
}
```

Response:
```json
{
  "status": "success",
  "diagram": {
    "label": "my-architecture",
    "plantumlCode": "@startuml\nA -> B: Hello\n@enduml",
    "url": "https://uml.planttext.com/plantuml/svg/...",
    "createdAt": "2025-02-07T18:30:00.000Z"
  }
}
```

### PlantUML Encoder Tool

This MCP server includes a **PlantUML Encoder** tool that allows you to encode PlantUML diagrams into shareable URLs for uml.planttext.com.

#### What it does
Encodes PlantUML diagram code into a compressed URL that can be viewed on uml.planttext.com

#### Parameters
- `plantumlCode` (string): PlantUML diagram code to encode (max 50KB)

The tool accepts both formats:
- Full PlantUML code with `@startuml` and `@enduml` wrappers
- Raw diagram code without wrappers

Example with wrappers:
```json
{
  "tool": "encode-plantuml",
  "arguments": {
    "plantumlCode": "@startuml\nA -> B: Hello\n@enduml"
  }
}
```

Example without wrappers:
```json
{
  "tool": "encode-plantuml",
  "arguments": {
    "plantumlCode": "A -> B: Hello"
  }
}
```

Example response:
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"status\":\"success\",\"url\":\"https://uml.planttext.com/plantuml/svg/SrJGjLDm0W00\",\"encoded\":\"SrJGjLDm0W00\",\"format\":\"svg\"}"
    }
  ]
}
```

On error:
```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "error_description"
}
```

#### Example usage via MCP client

```json
{
  "tool": "encode-plantuml",
  "arguments": {
    "plantumlCode": "A -> B: Hello\\nB -> A: Hi"
  }
}
```

Example response:
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"status\":\"success\",\"url\":\"https://uml.planttext.com/plantuml/svg/Syp9J4vLqBLJSCfFibBmICt9oUTooay2YJY2fAmKF381\",\"encoded\":\"Syp9J4vLqBLJSCfFibBmICt9oUTooay2YJY2fAmKF381\",\"format\":\"svg\"}"
    }
  ]
}
```

You can then visit the URL to see your PlantUML diagram rendered as SVG.

## Testing

### Unit Tests
```shell
npm test
```

### Integration Tests
```shell
node tests/integration-tests-mcp.js
```

The integration tests verify that the MCP server works correctly as a real MCP client would, using HTTP requests via curl to test the MCP protocol methods (`tools/list` and `tools/call`) and validate end-to-end functionality. This ensures the server behaves correctly as a stateless MCP server and properly handles all acceptance and validation test cases.

## Install and run locally

```shell
# 1. Clone the repository
git clone https://github.com/pavel-orekhov/webodar3.git

# 2. Move into the project directory
cd webodar3

# 3. Install dependencies
npm install

# 4. Install the Netlify CLI to let you locally serve your site using Netlify's features
npm i -g netlify-cli

# 5. Serve your site using Netlify Dev to get local serverless functions
netlify dev

# 6. While the site is running locally, open a separate terminal tab to run the MCP inspector or client you desire
npx @modelcontextprotocol/inspector npx mcp-remote@next http://localhost:8888/mcp
```
