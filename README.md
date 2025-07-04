# Cognitive Science Demonstrations Platform

A unified, robust platform for cognitive psychology experiments built with React and deployed on Cloudflare Pages with serverless Functions for data collection.

## Features

### Experiments
- **Flanker Task**: Classic attention and response inhibition experiment
- **Stroop Task**: Color-word interference experiment  
- **Visual Search Task**: Target detection in visual arrays with pop-out and conjunction searches
- **N-Back Task**: Working memory assessment (2-back paradigm)
- **Unified Trial Management**: Robust, reusable trial sequencing framework

### Platform Features
- **Session Management**: Instructor-created sessions with unique codes
- **Results Dashboard**: Real-time participant data visualization
- **Data Export**: Standardized CSV downloads with camel_case field names
- **Responsive Design**: Modern UI with Tailwind CSS and unified components
- **Serverless Backend**: Cloudflare KV for data storage
- **Race Condition Prevention**: Robust timing and state management
- **Privacy Controls**: Session-based data isolation

## Session-Based System

The platform includes a comprehensive session-based system for classroom data collection:

### For Instructors:
1. Create a session through the Session Manager by navigating to `[domain]/sessions`
2. Share the generated session link with students
3. Download session-specific CSV data for analysis

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
- **Prevents race conditions** and timing bugs through careful state management
- **Accurate trial/response alignment** - responses recorded against correct stimulus
- **Standardized sequencing** across all experiments with consistent timing
- **Automatic cleanup** and memory management preventing crashes
- **Configurable parameters** for timeouts, delays, and stimulus duration

### Unified UI Components
Consistent user experience through standardized components:
- **TaskSetup**: Configurable participant setup with task-specific branding
- **PracticeComplete**: Practice feedback with accurate performance statistics
- **TaskComplete**: Results display with detailed analytics and standardized CSV downloads
- **Standardized CSV exports**: All downloads use camel_case field names with proper data mapping

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

> **Important:** The session-based system requires Cloudflare KV storage to function correctly. Local development with `npm run dev` is suitable for UI testing only. For full functionality testing (sessions, data storage), use either:
> - `npx wrangler pages dev dist` for local simulation with KV
> - Deploy to Cloudflare Pages for complete testing

> **Note:** If you see the error "Wrangler requires at least Node.js v20.0.0", update your Node.js version.

## Deployment

### Prerequisites
- **Cloudflare account** (free tier is sufficient)
- **Node.js 20+** installed locally
- **Git repository** (for automated deployments)

### Step 1: Create Cloudflare KV Namespace
The application requires a KV namespace for data storage:

```bash
# Install Wrangler CLI if not already installed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create the KV namespace
wrangler kv namespace create RT_DB
```

This will output something like:
```
🌀 Creating namespace with title "cogsci-demos-RT_DB"
✅ Success!
Add the following to your wrangler.toml:

[[kv_namespaces]]
binding = "RT_DB"
id = "46389a6df4354ea3ac1909e7e03c37b6"

⚠️  The above command created a namespace called "cogsci-demos-RT_DB". It is not configured for any environment. To use it, add it to your wrangler.toml under [env.production] or at the top level.
```

**Note:** The warning about `[env.production]` can be safely ignored for this project. The namespace is created successfully and will work with the top-level configuration.

### Step 2: Update Configuration
Update `wrangler.toml` with your KV namespace ID:

```toml
name = "cogsci-demos"
compatibility_date = "2025-07-02"
pages_build_output_dir = "dist"

[[kv_namespaces]]
binding = "RT_DB"
id = "46389a6df4354ea3ac1909e7e03c37b6"  # Replace with your actual KV namespace ID
```

### Step 3: Deploy Options

#### Option A: Manual Deployment (Quick Start)
```bash
# Build the application
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

The deploy command will:
1. Upload your built application to Cloudflare Pages
2. Create a project named "cogsci-demos" if it doesn't exist
3. Set up the KV binding automatically
4. Provide you with a live URL

#### Option B: Automated GitHub Deployment (Recommended)
For automatic deployments on every push:

1. **Fork/clone this repository** to your GitHub account

2. **Set up Cloudflare API credentials:**
   - Go to Cloudflare dashboard → "My Profile" → "API Tokens"
   - Create a token with "Cloudflare Pages:Edit" permissions
   - Note your Account ID from the dashboard

3. **Configure GitHub Secrets:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add these repository secrets:
     - `CLOUDFLARE_API_TOKEN`: Your API token from step 2
     - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

4. **Push to main branch** - deployment will happen automatically via GitHub Actions

### Step 4: Configure Your Domain (Optional)
After deployment, Cloudflare will provide a URL like `https://cogsci-demos.pages.dev`. You can:
- Use this URL directly
- Set up a custom domain in the Cloudflare Pages dashboard

### Verification
After deployment, verify everything works:
1. Visit your deployed URL
2. Try creating a session at `/sessions`
3. Test a cognitive task
4. Check the results dashboard at `/results`

### Troubleshooting

**"KV namespace not found" error:**
- Ensure your KV namespace ID is correctly set in `wrangler.toml`
- Verify the namespace exists: `wrangler kv:namespace list`

**"Wrangler requires Node.js v20+" error:**
- Update Node.js: `brew install node@20` (macOS) or download from nodejs.org

**Build fails in GitHub Actions:**
- Check that all dependencies are listed in `package.json`
- Verify GitHub secrets are set correctly

**Functions not working:**
- Ensure KV binding is properly configured
- Check Cloudflare Pages dashboard → Functions tab for error logs

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

## Documentation

- **[Trial Framework](TRIAL_FRAMEWORK.md)** - Complete guide to the `useTrialManager` hook
- **[Unified Components](UNIFIED_COMPONENTS.md)** - Documentation for standardized UI components
- **[Setup Guide](SETUP.md)** - Development environment setup

## Contributing

### Development Guidelines
1. **Follow unified framework patterns** - use `useTrialManager` and standardized components
2. **Maintain consistent styling** - use existing Tailwind classes and component patterns  
3. **Ensure proper trial alignment** - always pass trial data to `handleResponse`
4. **Test thoroughly** - verify accuracy calculations and display consistency
5. **Update documentation** for any new features or changes

### Bug Fix Protocol
When modifying trial logic:
1. Check that responses are recorded against the correct trial
2. Verify display sizes remain consistent across all trial phases
3. Test CSV exports have correct field mapping
4. Ensure no memory leaks or infinite loops
5. Validate accuracy calculations match expected results

### Testing Checklist
- [ ] Practice trials show correct accuracy feedback
- [ ] Display sizes remain constant during fixation/stimulus transitions
- [ ] CSV exports use camel_case field names
- [ ] No browser crashes or freezes during extended use
- [ ] Performance metrics calculate correctly

### For Instructors
1. Create a session at `/sessions`
2. Share the session link with students
3. Navigate to `/results` to view session data
4. Select a specific session to view session-specific results
5. Click "Download Session Data" for CSV export
6. Use individual participant download buttons for detailed data

## Data Format

### Standardized CSV Exports
All tasks export data with consistent camel_case field names:

**Flanker Task:**
- `student_name`, `student_id`, `trial_number`, `stimulus_type`, `stimulus_display`
- `correct_response`, `participant_response`, `reaction_time`, `is_correct`, `session_start_time`

**Stroop Task:**
- `student_name`, `student_id`, `trial_number`, `stimulus_color`, `stimulus_word`, `stimulus_type`
- `correct_response`, `participant_response`, `reaction_time`, `is_correct`, `session_start_time`

**Visual Search Task:**
- `student_name`, `student_id`, `trial_number`, `search_type`, `set_size`, `target_present`
- `correct_response`, `participant_response`, `reaction_time`, `is_correct`, `session_start_time`

**N-Back Task:**
- `student_name`, `student_id`, `trial_number`, `stimulus_letter`, `is_target`, `n_back_level`
- `correct_response`, `participant_response`, `reaction_time`, `is_correct`, `session_start_time`

### Performance Metrics
- **Flanker**: Congruent vs. incongruent accuracy/RT, flanker effect
- **Stroop**: Congruent vs. incongruent accuracy/RT, Stroop effect  
- **Visual Search**: Color popout, orientation popout, and conjunction search performance
- **N-Back**: Hit rate, false alarm rate, signal detection metrics

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
