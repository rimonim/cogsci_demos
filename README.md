# Cognitive Science Demonstrations Platform

A unified, robust platform for cognitive psychology experiments built with React and deployed on Cloudflare Pages with serverless Functions for data collection.

## Features

### Experiments
- **Flanker Task**: Classic attention and response inhibition experiment
- **Stroop Task**: Color-word interference experiment  
- **Visual Search Task**: Target detection in visual arrays
- **Unified Trial Management**: Robust, reusable trial sequencing framework

### Platform Features
- **Results Dashboard**: Real-time participant data visualization
- **Data Export**: CSV download for class data analysis
- **Responsive Design**: Modern UI with Tailwind CSS and unified components
- **Serverless Backend**: Cloudflare KV for data storage
- **Race Condition Prevention**: Robust timing and state management

## Architecture

### Unified Framework
All experiments use the standardized `useTrialManager` hook for:
- Trial sequencing and timing
- Response handling and timeouts
- Practice/main phase management
- Result collection and cleanup
- Race condition prevention

### Unified UI Components
Consistent user experience through standardized components:
- **TaskSetup**: Configurable participant setup with task-specific branding
- **PracticeComplete**: Practice feedback with performance statistics
- **TaskComplete**: Results display with detailed analytics and downloads

## Project Structure

```
src/
├── components/
│   ├── ui/              # Unified, configurable UI components
│   │   ├── TaskSetup.jsx
│   │   ├── PracticeComplete.jsx
│   │   ├── TaskComplete.jsx
│   │   └── taskConfigs.js
│   ├── flanker/         # Flanker-specific stimulus display
│   ├── stroop/          # Stroop-specific stimulus display  
│   ├── visual-search/   # Visual search stimulus display
│   └── results/         # Results dashboard components
├── demos/
│   ├── Flanker.jsx      # Flanker task using unified framework
│   ├── Stroop.jsx       # Stroop task using unified framework
│   └── VisualSearch.jsx # Visual search task using unified framework
├── hooks/
│   └── useTrialManager.js # Unified trial management framework
├── entities/
│   ├── FlankerResult.js    # Flanker data model and API
│   ├── StroopResult.js     # Stroop data model and API
│   └── VisualSearchResult.js # Visual search data model and API
├── pages/
│   ├── Home.jsx         # Landing page with demo links
│   ├── Results.jsx      # Instructor results dashboard
│   └── *Instructions.jsx # Task-specific instruction pages
└── utils.js            # Utility functions

functions/
└── api/
    └── record.js        # Cloudflare Pages Functions API
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
2. Choose an experiment (Flanker, Stroop, or Visual Search)
3. Enter your name and student ID
4. Complete the practice trials  
5. Complete the main experiment
6. View your results and download data

### For Instructors
1. Access the Results Dashboard
2. View real-time participant data
3. Export class data as CSV
4. Analyze performance statistics

## Documentation

- **[Trial Framework](TRIAL_FRAMEWORK.md)** - Complete guide to the `useTrialManager` hook
- **[Unified Components](UNIFIED_COMPONENTS.md)** - Documentation for standardized UI components
- **[Setup Guide](SETUP.md)** - Development environment setup

## Key Features

### Robust Trial Management
- Prevents race conditions and timing bugs
- Standardized trial sequencing across all experiments  
- Automatic cleanup and memory management
- Configurable timeouts and inter-trial delays

### Consistent User Experience
- Unified setup, practice, and completion flows
- Task-specific theming and branding
- Responsive design for all screen sizes
- Accessible keyboard navigation

### Research-Ready Data
- Comprehensive result logging with timestamps
- Configurable CSV exports with task-specific fields
- Performance statistics and analysis
- Privacy controls for data sharing

## Contributing

1. Follow the unified framework patterns for new experiments
2. Use the standardized UI components when possible
3. Update documentation for any new features
4. Test all experiment phases thoroughly

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
