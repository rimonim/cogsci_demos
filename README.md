# Cognitive Science Demonstrations Platform

A multi-demo cognitive psychology platform built with React and deployed on Cloudflare Pages with serverless Functions for data collection.

## Features

- **Flanker Task**: Classic attention and response inhibition experiment
- **Results Dashboard**: Real-time participant data visualization
- **Data Export**: CSV download for class data analysis
- **Responsive Design**: Modern UI with Tailwind CSS
- **Serverless Backend**: Cloudflare KV for data storage

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── flanker/      # Flanker task specific components
│   └── results/      # Results dashboard components
├── demos/
│   └── Flanker.jsx   # Main Flanker task implementation
├── pages/
│   ├── Home.jsx      # Landing page with demo links
│   ├── Results.jsx   # Instructor results dashboard
│   └── Instructions.jsx
├── entities/
│   └── FlankerResult.js  # Data model and API integration
└── utils.js         # Utility functions

functions/
└── api/
    └── record.js     # Cloudflare Pages Functions API
```

## Development

### Prerequisites
- Node.js 18+ (20+ for local Functions testing)
- npm

### Local Development
```bash
npm install
npm run dev
```

### Building
```bash
npm run build
```

### Local Testing with Functions (requires Node 20+)
```bash
npm run build
npx wrangler pages dev dist
```

## Deployment

### Initial Setup
1. Create a Cloudflare account
2. Create a KV namespace:
   ```bash
   wrangler kv:namespace create RT_DB --production
   ```
3. Update `wrangler.toml` with the returned KV namespace ID
4. Deploy:
   ```bash
   npm run deploy
   ```

### GitHub Actions
The project includes automated deployment via GitHub Actions. Set these secrets in your GitHub repository:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## API Endpoints

- `POST /api/record` - Save experiment data to KV storage
- `GET /api/record` - Export all data as CSV

## Usage

### For Students
1. Navigate to the deployed URL
2. Click "Start Flanker Task"
3. Enter your name and student ID
4. Complete the practice trials
5. Complete the main experiment

### For Instructors
1. Navigate to `/results` 
2. View real-time participant data
3. Click "Download Class Data" for CSV export
4. Use individual participant download buttons for detailed data

## Data Format

The application collects:
- Student name and ID
- Trial number and type (congruent/incongruent)
- Stimulus presentation
- Response and reaction time
- Accuracy
- Session timestamps

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
