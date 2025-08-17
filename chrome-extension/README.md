# MailPulse Chrome Extension

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this folder
4. The MailPulse extension should now appear in your extensions list

## Features

- Background service worker for persistent functionality
- Content script injection on all pages
- Popup interface for quick actions
- Local storage for data persistence
- Keyboard shortcut (Ctrl+Shift+M) to toggle extension UI

## Development

The extension consists of:
- `manifest.json` - Extension configuration
- `src/background.js` - Service worker for background tasks
- `src/content.js` - Content script injected into web pages
- `public/popup.html` - Extension popup interface
- `public/popup.js` - Popup functionality

## Usage

- Click the extension icon to open the popup
- Use Ctrl+Shift+M on any page to toggle the extension overlay
- Connect to the main MailPulse app through the popup