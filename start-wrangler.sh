#!/bin/bash

# Script to run the local Wrangler development environment with the correct Node.js version

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if nvm is available
if command_exists nvm; then
  echo "Using nvm to select Node.js 20..."
  # First build the project
  nvm exec 20 npm run build
  # Then start Wrangler
  nvm exec 20 npx wrangler pages dev dist
  exit 0
elif command_exists node; then
  # Check current Node.js version
  NODE_VERSION=$(node --version)
  if [[ $NODE_VERSION == v20* ]]; then
    echo "Using Node.js $NODE_VERSION"
    npm run build && npx wrangler pages dev dist
    exit 0
  else
    echo "Error: Wrangler requires Node.js 20+. You are using $NODE_VERSION."
    echo "Please install Node.js 20+ or use nvm to manage Node.js versions."
    exit 1
  fi
else
  echo "Error: Node.js is not installed. Please install Node.js 20+ and try again."
  exit 1
fi
