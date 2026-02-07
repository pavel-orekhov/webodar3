![Netlify Examples](https://github.com/netlify/examples/assets/5865/4145aa2f-b915-404f-af02-deacee24f7bf)

# webodar3: MCP Server on Netlify Functions

**View the live site**: https://webodar3.netlify.app/

[![Netlify Status](https://api.netlify.com/api/v1/badges/d9d0cf30-4aa5-4bc6-9230-f76fd6f63554/deploy-status)](https://app.netlify.com/sites/webodar3/deploys)

## About webodar3

webodar3 is a basic example of developing and running a serverless MCP server using Netlify Functions.

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Docs: Netlify Functions](https://docs.netlify.com/functions/overview/?utm_campaign=dx-examples&utm_source=example-site&utm_medium=web&utm_content=example-mcp-express)
- [Agent Experience (AX)](https://agentexperience.ax?utm_source=express-mcp-guide&utm_medium=web&utm_content=example-mcp-express)

Importantly, because of how Express handles mapping routes, ensure you set the `netlify.toml` redirects to the correct path. In this repo we have the following to ensure `<domain>/mcp` catches all of the requests to this server:

```toml
[[redirects]]
  force = true
  from = "/mcp"
  status = 200
  to = "/.netlify/functions/express-mcp-server"
```

## Available MCP Tools

### PlantUML Encoder Tool

This MCP server includes a **PlantUML Encoder** tool that allows you to encode PlantUML diagrams into shareable URLs for uml.planttext.com.

#### What it does
Encodes PlantUML diagram code into a compressed URL that can be viewed on uml.planttext.com.

#### Parameters
- `plantumlCode` (string): PlantUML diagram code to encode (max 50KB)

### Diagram Management Tools (Netlify Blobs)

New tools for persistent diagram storage using Netlify Blobs.

#### `save-diagram`
Saves a PlantUML diagram. Collisions are acceptable; the latest version for a given label is always tracked.
- `label` (string): Label for the diagram.
- `plantumlCode` (string): PlantUML code.

#### `get-diagram-by-label`
Retrieves the **latest** PlantUML diagram by its label.
- `label` (string): Label of the diagram to fetch.

#### `list-diagrams`
Lists all saved diagrams. The list is unlimited and sorted by most recent first.

## Web Interfaces

### Diagrams Viewer
A web interface to explore saved diagrams is available at [webodar3.netlify.app/diagrams.html](https://webodar3.netlify.app/diagrams.html). 
- View a list of all saved diagrams.
- Expand/collapse PlantUML source code.
- View rendered SVG in an iframe.

### Env Viewer
A secure environment variable viewer is available at `/env.html`.
- Displays all `process.env` keys.
- Values are masked: all characters are replaced by `?` except for the last 4.

## Netlify Blobs Store Helper
The project includes a robust Netlify Blobs helper (`netlify/lib/blobs.ts`) that supports:
- Environment-based configuration (`NETLIFY_SITE_ID`, `NETLIFY_AUTH_TOKEN`).
- Explicit configuration options.
- Lazy initialization.
- Detailed structured error reporting if configuration is missing.

## Testing

### Unit Tests
```shell
npm test
```

### Integration Tests
```shell
node tests/integration-tests-mcp.js
```

## Install and run locally

```shell
# 1. Clone the repository
git clone https://github.com/pavel-orekhov/webodar3.git

# 2. Move into the project directory
cd webodar3

# 3. Install dependencies
npm install

# 4. Install the Netlify CLI
npm i -g netlify-cli

# 5. Serve your site locally
netlify dev

# 6. Run the MCP inspector
npx @modelcontextprotocol/inspector npx mcp-remote@next http://localhost:8888/mcp
```
