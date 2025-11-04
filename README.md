# Simple Network Scanner

A web-based network scanner tool for discovering hosts and open ports on a local network.

## Features

- **IP Range Scanning**: Scan a range of IP addresses (e.g., 192.168.1.1-254)
- **Port Scanning**: Check multiple ports simultaneously
- **Real-time Progress**: Visual progress bar and status updates
- **Responsive Design**: Works on desktop and mobile devices
- **Stop/Start Controls**: Ability to stop scanning mid-process

## Usage

1. Open `index.html` in a web browser
2. Enter the IP range to scan (format: `192.168.1.1-254`)
3. Enter ports to check (comma-separated: `22,80,443,8080`)
4. Click "Start Scan" to begin
5. View results as they appear in real-time

## Important Notes

⚠️ **Browser Limitations**: Due to browser security restrictions (CORS policy), this scanner has limited functionality when run from a web browser. The current implementation simulates scanning results for demonstration purposes.

For actual network scanning capabilities, consider:
- Running from a local server
- Using browser extensions with elevated permissions
- Implementing a backend service
- Using dedicated network scanning tools like Nmap

## Files

- `index.html` - Main interface
- `style.css` - Styling and responsive design
- `scanner.js` - Scanning logic and UI interactions
- `README.md` - This documentation

## Browser Compatibility

- Chrome/Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Considerations

This tool is intended for educational purposes and authorized network testing only. Always ensure you have permission to scan networks and systems.