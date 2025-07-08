# Local Testing Guide for Session-Based System

This guide will help you test the session-based system locally before deploying to Cloudflare Pages.

## Requirements

- **Node.js 20+** (required for Wrangler)
- **npm**

## Installing Node.js 20+ on macOS

Since you're using macOS, here are simple ways to install Node.js 20:

### Option 1: Using Homebrew (recommended)
```bash
# Install Homebrew if you don't have it
# /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js 20
brew install node@20

# Add to your PATH (may need to restart terminal)
echo 'export PATH="/usr/local/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
node --version
# Should show v20.x.x
```

### Option 2: Direct download
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version (which should be 20.x)
3. Run the installer
4. Verify with `node --version`

## Local Testing Setup

The system has been enhanced to work locally by using a mock KV store. This allows you to test most functionality without deploying to Cloudflare.

```bash
npm run build
npx wrangler pages dev dist
```

### What will work locally:

1. **Session-based workflow:**
   - Creating sessions via the `/api/session` endpoint
   - Joining sessions via the SessionJoin component (enter student info once)
   - Automatic student info forwarding to tasks
   - Submitting results with session data
   - Viewing session-specific results
   - Downloading session CSV data

2. **Standalone workflow:**
   - Direct task access without sessions (no student info required)
   - Tasks start automatically with anonymous data
   - Local data storage and download at task completion
   - Individual task completion with personal results

3. **General features:**
   - Clearing session data
   - Task switching and data management

### What might have limitations:

1. Long-term persistence between server restarts (the mock KV is in-memory)
2. JSON parsing for complex objects might sometimes fail
3. Session creation might occasionally have issues with response parsing

## Common Issues and Troubleshooting

### "Error creating session: Failed to execute 'json' on 'Response': Unexpected end of JSON input"

This error usually occurs when the mock KV storage has a JSON parsing issue or when the server response is malformed. Here are some solutions:

1. **Refresh and try again** - Often, this is a transient issue that resolves on refresh.

2. **Check browser console** - Look for error messages that might provide more details.

3. **Restart the local development server** - This resets the in-memory KV store:
   ```bash
   # Stop the current server (Ctrl+C) and restart
   npx wrangler pages dev dist
   ```

4. **Clear browser cache and cookies** - Session information might be cached:
   ```
   Chrome: Settings > Privacy and security > Clear browsing data
   Firefox: Options > Privacy & Security > Cookies and Site Data > Clear Data
   ```

5. **Try a simple test first** - Create a session with minimal data (short instructor name, simple demo type).

### "Cannot read properties of undefined" or similar errors

These typically occur when expected data is missing from the mock KV store:

1. Verify proper data flow in the browser console logs
2. Remember that mock data doesn't persist between server restarts
3. Follow a complete workflow (create session → join session → complete task → view results)
4. Check that session data is being correctly passed between pages via URL parameters

## Debug Mode

The local development environment now includes a debug mode to help identify issues:

1. **Console logs** - Check your browser and terminal console for detailed logs of all KV operations
2. **Request/response debugging** - API interactions are logged with request and response details
3. **Error details** - Error responses now include stack traces and more descriptive messages

## When to Use Production Testing Instead

In some cases, local testing limitations might be too restrictive. Consider testing in production when:

1. You need to test multiple users joining the same session simultaneously
2. You're testing long-term data persistence across days
3. You need to verify KV namespace isolation and limits

## Local Testing vs. Production Behavior

| Feature | Local Behavior | Production Behavior |
|---------|---------------|-------------------|
| Data persistence | In-memory only (lost on restart) | Persistent in Cloudflare KV |
| Performance | Faster for small datasets | More consistent with rate limiting |
| Error handling | More verbose, includes debug info | Production-friendly messages |
| Session limits | No enforced limits | Subject to Cloudflare KV limits |

## Alternative: Using Cloudflare Wrangler for Local Testing

For more accurate testing, you can use Cloudflare Wrangler with a dev KV namespace:

```bash
# Create a dev KV namespace
npx wrangler kv:namespace create RT_DB --preview

# Update wrangler.toml with the preview_id
# Then run with:
npx wrangler pages dev dist
```

This approach requires Cloudflare authentication but provides a more production-like environment for testing.
2. Some Cloudflare-specific optimizations

## Testing Steps

### 1. Start the local development server

```bash
npm run dev
```

### 2. Test the instructor flow

1. Navigate to `/sessions` in your browser
2. Create a new session (e.g., "Test Session")
3. Copy the session URL
4. Note the session ID for later use

### 3. Test the student flow

1. Open the session URL in a new browser window or incognito mode
2. Enter student information and join the session (you'll only need to do this once)
3. Read the task instructions and click "Start Practice Trials"
4. Complete the practice and actual trials (student info is automatically carried forward)
5. Verify that results are submitted successfully

**Note:** With the session-based system, you no longer need to enter your name and ID twice. The system automatically uses the information provided when joining the session.

### 4. View session results

1. Go back to the first browser window
2. Navigate to `/results`
3. Find your session in the list and click on it
4. Verify that the student's data appears in the results table
5. Test downloading the session CSV

### 5. Test session data management

1. From the session-specific results view, try the following:
   - Download individual participant data
   - Download session CSV data
   - Reset session data (if needed)

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify that the mock KV is working (look for "Using local development mock storage" in the console)
3. Make sure your endpoints are being called with the correct session ID
4. Check that your React components are receiving the correct props

## Notes for Production Deployment

When deploying to Cloudflare Pages:

1. The system will automatically use the real Cloudflare KV storage
2. Make sure you have set up the KV namespace in your Cloudflare dashboard
3. Bind the KV namespace to your Pages project as `RT_DB`
4. All session data will be stored in your Cloudflare KV store

Happy testing!
