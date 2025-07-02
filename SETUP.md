# Cloudflare Setup Guide

## 1. Create KV Namespace

Run this command to create the KV namespace for data storage:

```bash
wrangler kv:namespace create RT_DB --production
```

This will output something like:
```
🌀 Creating namespace with title "cogsci-demos-RT_DB"
✅ Success!
Add the following to your configuration file in your kv_namespaces array:
[[kv_namespaces]]
binding = "RT_DB"
id = "abcd1234efgh5678ijkl9012mnop3456"
```

## 2. Update wrangler.toml

Copy the `id` from the output above and paste it into `wrangler.toml`:

```toml
name = "cogsci-demos"
compatibility_date = "2025-07-02"

[[kv_namespaces]]
binding = "RT_DB"
id = "abcd1234efgh5678ijkl9012mnop3456"  # Replace with your actual ID
```

## 3. Deploy

```bash
npm run build
npm run deploy
```

## 4. GitHub Actions (Optional)

If using GitHub Actions for automatic deployment:

1. Go to your repository settings
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN`: Get from Cloudflare dashboard
   - `CLOUDFLARE_ACCOUNT_ID`: Found in Cloudflare dashboard

## 5. Testing

After deployment:
1. Visit your Cloudflare Pages URL
2. Complete a Flanker task
3. Check the Results page to verify data collection
4. Test the CSV export functionality

## Troubleshooting

- **KV data not saving**: Check the KV namespace ID in wrangler.toml
- **Build fails**: Ensure all dependencies are installed with `npm install`
- **Functions not working**: Verify the `functions/` directory is properly structured
