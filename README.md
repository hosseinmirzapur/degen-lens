# Memecoin Highlighter

A powerful browser extension that provides real-time token analysis and highlighting on popular memecoin trading platforms. It helps traders quickly identify potentially risky, pumpable, or stable tokens based on customizable market data thresholds.

## Features

- **Real-time Analysis**: Continuously monitors and classifies tokens as they appear on supported platforms
- **Visual Highlighting**: Color-coded highlights for different token classifications (risky: red, pumpable: green, stable: blue)
- **Customizable Thresholds**: User-configurable parameters for market cap, liquidity, and transaction ratios
- **Multi-Platform Support**: Works across multiple trading terminals
- **Efficient DOM Monitoring**: Uses MutationObserver for minimal CPU usage
- **Storage Sync**: Settings are synchronized across browser sessions

## Supported Platforms

Currently supports:

- **axiom.trade** (actively implemented)
- gmgn.ai (parser available, commented out)
- dexscreener.com (parser available, commented out)

## Installation

### Chrome/Chromium-based Browsers

1. Clone this repository or download the source code
2. Install dependencies: `bun install` or `npm install`
3. Build the extension: `make build` or `bun run build`
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" in the top right corner
6. Click "Load unpacked" and select the `dist` folder from this project

### Firefox

Firefox support is not yet available as the extension uses Manifest V3, which Firefox has limited support for. Support may be added in future updates.

## Usage

1. After installation, click the extension icon in your browser toolbar to access settings
2. Configure the classification thresholds according to your trading strategy
3. Visit a supported trading platform (e.g., axiom.trade)
4. Tokens will be automatically highlighted based on the configured criteria:
   - **Risky**: Red highlight (low liquidity or high sell pressure)
   - **Pumpable**: Green highlight (moderate market cap, decent liquidity, strong buy pressure)
   - **Stable**: Blue highlight (high market cap and deep liquidity)

## Configuration

The extension provides granular control over token classification through the settings page:

### Pumpable Tokens
- **Min Market Cap**: Minimum market capitalization threshold
- **Max Market Cap**: Maximum market capitalization threshold
- **Min Liquidity**: Minimum liquidity requirement
- **Buy/Sell Ratio**: Threshold for buy pressure indication

### Risky Tokens
- **Max Liquidity**: Maximum liquidity threshold (below this is considered risky)
- **Sell/Buy Ratio**: Threshold for sell pressure indication

### Stable Tokens
- **Min Market Cap**: Minimum market cap for stability classification
- **Min Liquidity**: Minimum liquidity for stability classification

### General
- **Enable/Disable**: Toggle the extension on or off

## Development

### Prerequisites

- [Bun](https://bun.sh/) or Node.js
- Git

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd memecoin-highlighter
   ```

2. Install dependencies:
   ```
   bun install
   ```

3. Start development mode:
   ```
   bun run dev
   ```

4. Build for production:
   ```
   bun run build
   ```

### Project Structure

```
src/
├── background/
│   └── index.ts          # Service worker for extension lifecycle
├── content/
│   ├── index.ts          # Main content script entry point
│   ├── highlighter.ts    # DOM manipulation and styling functions
│   ├── rules.ts          # Token classification logic and thresholds
│   ├── utils.ts          # Utility functions (parsing, etc.)
│   ├── axiom.ts          # Parser for axiom.trade platform
│   ├── gmgn.ts           # Parser for gmgn.ai platform
│   └── dexscreener.ts    # Parser for dexscreener.com platform
└── options/
    ├── index.html        # Settings page HTML
    ├── index.ts          # Settings page logic
    └── style.css         # Settings page styling
```

### Building

The project uses Vite for bundling and TypeScript for type safety. The build process:

1. Compiles TypeScript to JavaScript
2. Bundles the code using Vite
3. Copies manifest.json and assets to the `dist` folder
4. Generates the final extension package

### Adding New Platforms

To add support for a new trading platform:

1. Create a new parser file in `src/content/` (e.g., `newplatform.ts`)
2. Implement parsing logic to extract token metrics
3. Add platform detection in `src/content/index.ts`
4. Update manifest.json with the new host permission
5. Test thoroughly on the target platform

## Technical Details

- **Manifest Version**: 3
- **Permissions**: `storage`, `scripting`
- **Host Permissions**: Limited to supported trading platforms
- **Build Tool**: Vite
- **Language**: TypeScript
- **Runtime**: No external dependencies (pure DOM manipulation)

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs, feature requests, or improvements.

## Disclaimer

This extension is for educational and informational purposes only. It does not constitute financial advice. Always do your own research and consider your risk tolerance before making investment decisions. Trading cryptocurrencies involves significant risk of loss.

## License

This project is licensed under the MIT License - see the LICENSE file for details.