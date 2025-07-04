# Cognitive Science Demonstrations Platform

A unified, robust platform for cognitive psychology experiments built with React and deployed on Cloudflare Pages with serverless Functions for data collection.

## Features

### Experiments
- **Flanker Task**: Classic attention and response inhibition experiment
- **Stroop Task**: Color-word interference experiment  
- **Visual Search Task**: Target detection in visual arrays
- **N-Back Task**: Working memory assessment task
- **Unified Trial Management**: Robust, reusable trial sequencing framework

### Platform Features
- **Session Management**: Instructor-created sessions with unique codes
- **Results Dashboard**: Real-time participant data visualization
- **Session-Based Data**: Filter and export data by instructor session
- **Data Export**: CSV download for class data analysis
- **Responsive Design**: Modern UI with Tailwind CSS and unified components
- **Serverless Backend**: Cloudflare KV for data storage
- **Race Condition Prevention**: Robust timing and state management
- **Privacy Controls**: Session-based data isolation
- **Session-Based System**: Instructor-created sessions for class data collection
- **Student Privacy Controls**: Opt-in data sharing preferences

## Session-Based System

The platform includes a comprehensive session-based system for classroom data collection:

### For Instructors:
1. Create a session through the Session Manager (/sessions)
2. Share the generated session link with students
3. Monitor student progress through the Results Dashboard
4. Download session-specific CSV data for analysis

### For Students:
1. Join a session via the instructor-provided link
2. Enter name, student ID, and privacy preferences
3. Complete the assigned cognitive task
4. Results are automatically associated with the session

### Key Benefits:
- **Organized Data Collection**: Results grouped by session
- **Streamlined Experience**: Direct task assignment for students
- **Privacy Controls**: Students control data sharing
- **Session-Specific Analysis**: Analyze results by class session
- **Easy CSV Export**: Download session-specific data

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
│   ├── SessionManager.jsx  # Instructor session creation interface
│   ├── flanker/         # Flanker-specific stimulus display
│   ├── stroop/          # Stroop-specific stimulus display  
│   ├── visual-search/   # Visual search stimulus display
│   ├── nback/           # N-Back task stimulus display
│   └── results/         # Results dashboard components
├── demos/
│   ├── Flanker.jsx      # Flanker task using unified framework
│   ├── Stroop.jsx       # Stroop task using unified framework
│   ├── NBack.jsx        # N-Back task using unified framework
│   └── VisualSearch.jsx # Visual search task using unified framework
├── hooks/
│   └── useTrialManager.js # Unified trial management framework
├── entities/
│   ├── FlankerResult.js    # Flanker data model and API
│   ├── StroopResult.js     # Stroop data model and API
│   ├── NBackResult.js      # N-Back data model and API
│   └── VisualSearchResult.js # Visual search data model and API
├── pages/
│   ├── Home.jsx         # Landing page with demo links
│   ├── Results.jsx      # Instructor results dashboard
│   ├── SessionJoin.jsx  # Student session join page
│   └── *Instructions.jsx # Task-specific instruction pages
├── utils/
│   └── sessionContext.js  # Session management utility
└── utils.js            # General utility functions

functions/
└── api/
    ├── record.js        # Cloudflare Pages Functions API for result storage
    ├── session.js       # API for session creation and listing
    └── session/
        └── [sessionId].js # API for session-specific operations
```

## Development

### Prerequisites
- **Node.js 20+** (required for Wrangler/Cloudflare Functions)
  - macOS: `brew install node@20`
  - See [LOCAL_TESTING.md](LOCAL_TESTING.md) for detailed installation instructions
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

### Local Testing with Functions
```bash
npm run build
npx wrangler pages dev dist
```

> **Note:** If you see the error "Wrangler requires at least Node.js v20.0.0", you need to update your Node.js version.

> **Note:** Local testing has some limitations with the session-based system. See [Local Testing Guide](LOCAL_TESTING.md) for details and troubleshooting common issues.

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

### Important Note on Testing
The session-based system requires Cloudflare KV storage to function correctly. While basic UI components can be tested locally, the complete session management system requires deployment to Cloudflare Pages for full functionality.

For the best experience:
1. Deploy to Cloudflare Pages for testing the complete session-based system
2. Use `npx wrangler pages dev dist` for local testing, which provides a more accurate simulation of the Cloudflare environment
3. Basic local development with `npm run dev` is suitable for UI component testing only

### GitHub Actions
The project includes automated deployment via GitHub Actions. Set these secrets in your GitHub repository:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## API Endpoints

### Record Endpoints
- `POST /api/record` - Save experiment data to KV storage
- `GET /api/record` - Export all data as CSV

### Session Endpoints
- `POST /api/session` - Create a new session
- `GET /api/session/{sessionId}` - Get session data
- `GET /api/session/{sessionId}?format=csv` - Export session-specific data as CSV
- `DELETE /api/session/{sessionId}` - Delete session data
- `DELETE /api/record` - Clear all data (instructor reset)
- `POST /api/session` - Create a new session for data collection
- `GET /api/session` - Get list of available sessions
- `GET /api/session/[sessionId]` - Get session data and results (with `?format=csv` option)
- `DELETE /api/session/[sessionId]` - Clear data for a specific session

## Usage

### For Students
1. Navigate to the deployed URL
2. Choose an experiment (Flanker, Stroop, or Visual Search)
3. Enter your name and student ID
4. Complete the practice trials  
5. Complete the main experiment
6. View your results and download data

### For Instructors
1. Create a new session with a unique code
2. Share the session code with students
3. Access the Results Dashboard to view session data
4. Filter results by session ID
5. Export session-specific data as CSV
6. Analyze performance statistics

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
1. Create a session at `/sessions`
2. Share the session link with students
3. Navigate to `/results` to view session data
4. Select a specific session to view session-specific results
5. Click "Download Session Data" for CSV export
6. Use individual participant download buttons for detailed data

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
