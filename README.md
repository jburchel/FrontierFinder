# Frontier Finder

A web application to find Frontier People Groups (FPGs) and Unreached Unengaged People Groups (UUPGs) within a specified proximity of selected UPGs where Crossover Global has a presence.

## Features

- Country and UPG selection from existing Crossover Global locations
- Search for FPGs and UUPGs within a specified radius
- Results sorting by distance, population, and evangelical percentage
- Phonetic pronunciation display and audio playback for UPG names
- Top 100 list management
- Interactive map visualization

## Tech Stack

- HTML5, CSS3, JavaScript (ES6+)
- Firebase Realtime Database
- GitHub Pages for hosting

## Project Structure

```
FrontierFinder/
├── src/
│   ├── js/         # JavaScript source files
│   ├── css/        # Stylesheets
│   └── html/       # HTML pages
├── data/           # CSV data files
├── images/         # Image assets
├── tests/          # Test files
└── docs/           # Documentation
```

## Setup Instructions

1. Clone the repository
2. Set up Firebase configuration
3. Add required environment variables to `.env`
4. Open `src/html/index.html` in your browser

## Environment Variables

Create a `.env` file with the following variables:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_DATABASE_URL`
- `JOSHUA_PROJECT_API_KEY`

## Development

1. Make changes
2. Run tests: `npm test`
3. Build: `npm run build`
4. Deploy: `npm run deploy`

## License

[License Type]
