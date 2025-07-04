#!/bin/bash

# Script to run the local development environment with the correct Node.js version

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if nvm is available
if command_exists nvm; then
  echo "Using nvm to select Node.js 20..."
  nvm use 20 || nvm exec 20 npm run dev
  exit 0
elif command_exists node; then
  # Check current Node.js version
  NODE_VERSION=$(node --version)
  if [[ $NODE_VERSION == v20* ]]; then
    echo "Using Node.js $NODE_VERSION"
    npm run dev
    exit 0
  else
    echo "Warning: You are using Node.js $NODE_VERSION, but version 20+ is required for Wrangler."
    echo "Basic development without Wrangler may still work."
    echo "Would you like to continue anyway? (y/n)"
    read -r response
    if [[ $response == "y" ]]; then
      npm run dev
      exit 0
    else
      echo "Please install Node.js 20+ and try again."
      exit 1
    fi
  fi
else
  echo "Error: Node.js is not installed. Please install Node.js 20+ and try again."
  exit 1
fi
