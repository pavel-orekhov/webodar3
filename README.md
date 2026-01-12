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

## Available MCP Tools

### PlantUML Encoder Tool

This MCP server includes a **PlantUML Encoder** tool that allows you to encode PlantUML diagrams into shareable URLs for plantuml.com.

#### What it does
Encodes PlantUML diagram code into a compressed URL that can be viewed on plantuml.com

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
      "text": "{\"status\":\"success\",\"url\":\"https://www.plantuml.com/plantuml/svg/SrJGjLDm0W00\",\"encoded\":\"SrJGjLDm0W00\",\"format\":\"svg\"}"
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

#### Error codes
- `EMPTY_CODE`: PlantUML code is required and cannot be empty
- `CODE_TOO_LARGE`: PlantUML code exceeds maximum size of 50KB
- `ENCODING_FAILED`: Failed to encode PlantUML diagram

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
      "text": "{\"status\":\"success\",\"url\":\"https://www.plantuml.com/plantuml/svg/Syp9J4vLqBLJSCfFibBmICt9oUTooay2YJY2fAmKF381\",\"encoded\":\"Syp9J4vLqBLJSCfFibBmICt9oUTooay2YJY2fAmKF381\",\"format\":\"svg\"}"
    }
  ]
}
```

You can then visit the URL to see your PlantUML diagram rendered as SVG.

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
