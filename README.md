# Cognitive Science Demonstrations Platform

A unified, robust platform for cognitive psychology experiments built with React and deployed on Cloudflare Pages with serverless Functions for data collection.

## Features

### Experiments
- **Flanker Task**: Attention and response inhibition
- **Stroop Task**: Color-word interference  
- **Visual Search Task**: Target detection in visual arrays with pop-out and conjunction searches
- **N-Back Task**: Working memory with 2-back paradigm
- **Posner Cueing Task**: Spatial attention and covert orienting with endogenous and exogenous cues, and variable SOA
- **Mental Rotation Task**: Spatial cognition and mental transformation of 2D shapes with mirror images
- **Change Detection Task**: Visual working memory assessment with Cowan's K

### Platform Features
- **Session Management**: Instructor-created sessions with unique codes
- **Instructor Authentication**: Password-protected access for session creation and management
- **Results Dashboard**: Real-time participant data visualization
- **Data Export**: Standardized CSV downloads with camel_case field names
- **Responsive Design**: Modern UI with Tailwind CSS and unified components
- **Serverless Backend**: Cloudflare KV for data storage
- **Race Condition Prevention**: Robust timing and state management
- **Privacy Controls**: Session-based data isolation

## Session-Based System

The platform includes a comprehensive session-based system for classroom data collection:

### For Instructors:
1. **Login**: Access instructor features at `/login` using the configured password
2. **Create Sessions**: Use the Session Manager at `/sessions` to create new data collection sessions
3. **Share Links**: Provide the generated session link to students  
4. **Monitor Results**: View real-time data at `/results` and download CSV exports
5. **Session Management**: Bulk operations, cleanup, and storage monitoring

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
- **Manual response control** for complex timing scenarios (e.g., Posner cueing with SOA delays)
- **Flexible timing management** supporting both simple and multi-phase experimental designs

### Multi-Phase Trial Manager
The `useMultiPhaseTrialManager` hook extends the unified framework to support:
- **Multi-phase experimental designs**: Seamlessly manage tasks with multiple phases, such as practice and test phases.
- **Dynamic phase transitions**: Automatically transition between phases based on task-specific criteria.
- **Enhanced timing control**: Configure phase-specific timing parameters for precise experimental control.

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
│   ├── SessionManagement.jsx  # Session management operations
│   ├── SessionManager.jsx     # Instructor session creation interface
│   ├── TaskSwitchDialog.jsx   # Task switching UI component
│   ├── Thumbnails.jsx         # Task preview thumbnails
│   ├── UniversityLogo.jsx     # Logo component
│   ├── change-detection/ # Change detection-specific stimulus display
│   │   ├── StimulusDisplay.jsx
│   ├── flanker/         # Flanker-specific stimulus display
│   ├── stroop/          # Stroop-specific stimulus display  
│   ├── visual-search/   # Visual search stimulus display
│   ├── nback/           # N-Back task stimulus display
│   ├── posner/          # Posner cueing task stimulus display
│   ├── mental-rotation/ # Mental rotation task stimulus display
│   └── results/         # Results dashboard components
├── demos/
│   ├── ChangeDetection.jsx # Change detection task using unified framework
│   ├── Flanker.jsx      # Flanker task using unified framework
│   ├── Stroop.jsx       # Stroop task using unified framework
│   ├── NBack.jsx        # N-Back task using unified framework
│   ├── Posner.jsx       # Posner cueing task using unified framework
│   ├── MentalRotation.jsx # Mental rotation task using unified framework
│   └── VisualSearch.jsx # Visual search task using unified framework
├── hooks/
│   ├── useTrialManager.js # Unified trial management framework
│   ├── useMultiPhaseTrialManager.js # Multi-phase trial management framework
├── entities/
│   ├── ChangeDetectionResult.js # Change detection data model and API
│   ├── FlankerResult.js    # Flanker data model and API
│   ├── StroopResult.js     # Stroop data model and API
│   ├── NBackResult.js      # N-Back data model and API
│   ├── PosnerResult.js     # Posner cueing data model and API
│   ├── MentalRotationResult.js # Mental rotation data model and API
│   ├── VisualSearchResult.js # Visual search data model and API
│   └── StudentResult.js    # Optimized batch data collection
├── pages/
│   ├── Home.jsx         # Landing page with demo links
│   ├── Results.jsx      # Instructor results dashboard
│   ├── SessionJoin.jsx  # Student session join page
│   ├── InstructorLogin.jsx # Instructor authentication page
│   ├── ChangeDetectionInstructions.jsx # Change detection task instructions
│   ├── FlankerInstructions.jsx # Flanker task instructions
│   ├── StroopInstructions.jsx  # Stroop task instructions
│   ├── VisualSearchInstructions.jsx # Visual search instructions
│   ├── NBackInstructions.jsx   # N-Back task instructions
│   ├── PosnerInstructions.jsx  # Posner cueing instructions
│   └── MentalRotationInstructions.jsx # Mental rotation instructions
├── utils/
│   ├── sessionContext.js  # Session management utility
│   ├── instructorAuth.js  # Authentication utilities
│   └── kvQuotaManager.js  # KV storage optimization
└── utils.js            # General utility functions

functions/
└── api/
    ├── auth.js          # Authentication API endpoint
    ├── record.js        # Cloudflare Pages Functions API for result storage
    ├── session.js       # API for session creation and listing
    ├── session-management.js # Advanced session operations
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

# Set up environment variables (optional for basic testing)
cp .env.example .env

npm run dev
```

**Alternative (using Node.js version management):**
```bash
# For automatic Node.js version management
./start-dev.sh
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

**Alternative (using Node.js version management):**
```bash
# For automatic Node.js version management  
./start-wrangler.sh
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

### Step 3: Set Instructor Password (IMPORTANT)
The platform requires a password for instructor access to session creation and management features. Set the password as an environment variable:

**For Local Development:**
```bash
# Create a .env file in your project root
echo "INSTRUCTOR_PASSWORD=your_secure_password_here" > .env
```

**For Cloudflare Pages Deployment:**
1. Go to your Cloudflare Pages dashboard
2. Select your project
3. Go to Settings → Environment variables
4. Add a new variable:
   - **Name:** `INSTRUCTOR_PASSWORD`
   - **Value:** Your secure password
   - **Environment:** Production (and Preview if desired)

> **Security Note:** Choose a strong password and never commit it to your repository. The password is used for all instructor access including session creation, results viewing, and data management.

### Step 4: Deploy Options

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

**Authentication "500 Internal Server Error":**
- This typically occurs in local development if environment variables aren't properly configured
- In local development, the system uses a hardcoded password `demo123`
- In production, ensure `INSTRUCTOR_PASSWORD` is set in Cloudflare environment variables

**Build fails in GitHub Actions:**
- Check that all dependencies are listed in `package.json`
- Verify GitHub secrets are set correctly

**Functions not working:**
- Ensure KV binding is properly configured
- Check Cloudflare Pages dashboard → Functions tab for error logs

## API Endpoints

### Authentication
- `POST /api/auth` - Instructor login (returns session token)

### Record Endpoints  
- `POST /api/record` - Save experiment data to KV storage
- `GET /api/record` - Export all data as CSV

### Session Endpoints (Require Authentication)
- `POST /api/session` - Create a new session
- `GET /api/session` - List all sessions  
- `POST /api/session-management` - Advanced session operations (cleanup, bulk delete, monitoring)

### Public Session Endpoints
- `GET /api/session/{sessionId}` - Get session data
- `GET /api/session/{sessionId}?format=csv` - Export session-specific data as CSV

> **Note:** Session creation and management endpoints require instructor authentication. Individual session data access is public to allow result sharing.

## Documentation

- **[Trial Framework](TRIAL_FRAMEWORK.md)** - Complete guide to the `useTrialManager` hook
- **[Unified Components](UNIFIED_COMPONENTS.md)** - Documentation for standardized UI components
- **[Setup Guide](SETUP.md)** - Development environment setup
- **[Local Testing](LOCAL_TESTING.md)** - Local development and testing instructions
- **[Local Development](START_LOCAL_DEV.md)** - Quick start guide for local development

## Contributing

### Development Guidelines
1. **Follow unified framework patterns** - use `useTrialManager` and standardized components
2. **Maintain consistent styling** - use existing Tailwind classes and component patterns  
3. **Ensure proper trial alignment** - always pass trial data to `handleResponse`
4. **Test thoroughly** - verify accuracy calculations and display consistency
5. **Update documentation** for any new features or changes

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

**Posner Cueing Task:**
- `student_name`, `student_id`, `trial_number`, `cue_type`, `cue_validity`, `target_location`, `soa`
- `target_present`, `correct_response`, `participant_response`, `reaction_time`, `is_correct`, `session_start_time`

**Mental Rotation Task:**
- `student_name`, `student_id`, `trial_number`, `shape_type`, `left_rotation`, `right_rotation`, `trial_type`
- `correct_response`, `participant_response`, `reaction_time`, `is_correct`, `session_start_time`

### Performance Metrics
- **Flanker**: Congruent vs. incongruent accuracy/RT, flanker effect
- **Stroop**: Congruent vs. incongruent accuracy/RT, Stroop effect  
- **Visual Search**: Color popout, orientation popout, and conjunction search performance
- **N-Back**: Hit rate, false alarm rate, signal detection metrics
- **Posner Cueing**: Valid vs. invalid cue effects, alerting effects, endogenous vs. exogenous attention
- **Mental Rotation**: Same vs. different accuracy/RT, rotation angle effects, mirror image discrimination, spatial transformation ability

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
