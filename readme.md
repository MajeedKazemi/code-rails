# Development Setup
## Install Dependencies
```bash
yarn
```

## Start database
```bash
docker compose up -d
```

## Setup Secrets
Copy the template and input your OpenAI Key and Org ID
```bash
cp .env.template .env
```

```bash
source .env
```

## Start Server
Start the app
```bash
yarn dev
```

You can now collect to the client at `http://localhost:5173`
