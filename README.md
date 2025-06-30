# Codex Desktop

A desktop application for interacting with the Codex decentralized storage network. Built with Tauri, React, and TypeScript for cross-platform compatibility and modern web technologies.

## ✨ Features

### 🌐 Network Modes
- **Local Node**: Run and manage your own Codex node locally
- **Remote Node**: Connect to remote Codex nodes with authentication
- **Seamless Switching**: Change between local and remote modes instantly

### 📁 File Management
- **Drag & Drop Upload**: Easy file uploads with visual feedback
- **Upload Cancellation**: Cancel uploads at any time (local & remote)
- **Download Files**: Download files from the Codex network
- **Seed Management**: Seed files to your local node or the network
- **Recent Files**: Track your upload and download history

### 🔧 Node Management
- **Auto-Start**: Automatically start Codex when the app launches
- **Process Control**: Start/stop Codex with visual status indicators
- **Health Monitoring**: Real-time connection and network health checks
- **Port Configuration**: Customize API, Discovery, and Listening ports

### 🔍 Network Exploration
- **Search by CID**: Find and download files using Content IDs
- **Network Status**: View connected peers and network information
- **Geo Location**: See geographical distribution of network peers

### ⚙️ Advanced Features
- **Authentication**: Secure remote connections with username/password
- **Progress Tracking**: Real-time upload/download progress
- **Error Handling**: Comprehensive error messages with troubleshooting
- **Debug Tools**: Built-in debugging utilities for developers

## 🚀 Quick Start

### Prerequisites
- **macOS**: 10.15+ (Catalina or later)
- **Windows**: 10+ (64-bit)
- **Linux**: Various distributions supported

### Installation
1. Download the latest release from the [Releases](https://github.com/hackyguru/codex-desktop/releases) page
2. Install the application:
   - **macOS**: Mount the `.dmg` and drag to Applications
   - **Windows**: Run the `.exe` installer
   - **Linux**: Install the `.deb` or `.AppImage`

### First Run
1. **Launch** the application
2. **Select a data directory** for Codex storage
3. **Configure ports** (optional - defaults work for most users)
4. **Start Codex** using the power button in the top navigation

## 📖 Usage Guide

### Local Node Mode

**Starting Your Node:**
1. Ensure you have sufficient disk space (11GB+ recommended)
2. Click the power button (⚡) in the top navigation
3. Wait for the health checks to complete
4. Green indicators show your node is ready

**Uploading Files:**
1. Drag and drop files into the upload area, or click "Upload Files"
2. Watch the upload progress with real-time updates
3. **Cancel uploads** anytime by clicking the red cancel button
4. Successful uploads appear in your recent files

**Managing Files:**
- **Download**: Click the download button on any file
- **Seed**: Add network files to your local node storage
- **Copy CID**: Click the copy button to get a file's Content ID

### Remote Node Mode

**Connecting to a Remote Node:**
1. Go to **Settings** → **Node Configuration**
2. Select **"Remote Node"**
3. Enter the **endpoint URL** (e.g., `https://codex.example.com:8080`)
4. Provide **username** and **password** for authentication
5. Click **"Save Configuration"**

**Remote Features:**
- All uploads/downloads go through the remote node
- Authentication is handled automatically
- Same file management features as local mode
- No local Codex process required

### Searching the Network

1. Use the **search bar** in the top navigation
2. Enter a **Content ID (CID)** to find files
3. **Download** or **Seed** found files
4. View file details including size, type, and manifest

## 🔧 Configuration

### Port Settings
- **API Port**: `8080` (default) - REST API communication
- **Discovery Port**: `8090` (default) - Peer discovery
- **Listening Port**: `8070` (default) - P2P communication

### Storage Settings
- **Data Directory**: Where Codex stores your files
- **Download Location**: Where downloaded files are saved
- **Storage Quota**: Maximum storage space for your node

### Network Settings
- **Node Type**: Local or Remote
- **Remote Endpoint**: URL of the remote Codex node
- **Authentication**: Username and password for remote access

## 🧪 Testing & Debugging

### Visual Health Indicators
- **Green**: All systems operational
- **Yellow**: Warning or pending status
- **Red**: Error requiring attention

### Console Debugging
Open browser developer tools (`F12`) and use these commands:

```javascript
// Check current API configuration
window.codexApi.debugConfig('8080')

// Test all API endpoints
window.testAllApiMethods('8080')

// Verify URL building for different endpoints
window.codexApi.buildUrl('/debug/info', '8080')
```

### Debug Information
Look for these console messages to verify correct operation:

**Local Mode:**
```
Creating API client - Node type: local
Using local endpoint: http://localhost:8080
Built URL for local node: http://localhost:8080/api/codex/v1/debug/info
```

**Remote Mode:**
```
Creating API client - Node type: remote
Remote mode - Using endpoint: https://your-server.com:8080
Built URL for remote node: https://your-server.com:8080/api/codex/v1/debug/info
```

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Desktop**: Tauri 2.0 (Rust)
- **Build System**: Vite
- **State Management**: React Hooks
- **Animation**: Framer Motion

### Prerequisites
- **Node.js**: 18+ 
- **Rust**: Latest stable
- **Tauri CLI**: `cargo install tauri-cli`

### Recommended IDE Setup
- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-repo/codex-desktop.git
cd codex-desktop

# Install dependencies
npm install

# Start development server
npm run tauri dev
```

### Building for Production

```bash
# Build for current platform
npm run tauri build

# Build for specific platform (cross-compilation)
npm run tauri build -- --target x86_64-pc-windows-gnu
```

### Project Structure
```
src/
├── components/          # React components
│   ├── pages/          # Page components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── services/           # API services
└── types/              # TypeScript definitions

src-tauri/
├── src/                # Rust source code
└── binaries/           # Codex binaries
```

## ❗ Troubleshooting

### Common Issues

**"Connection Error" in Remote Mode**
- Verify the remote endpoint URL is correct
- Check username/password authentication
- Ensure the remote server is running and accessible
- Check firewall/network settings

**Upload/Download Failures**
- Verify network connectivity
- Check available disk space
- For remote mode: verify authentication credentials
- Try canceling and restarting the operation

**Local Codex Won't Start**
- Check if ports are already in use
- Verify data directory permissions
- Ensure sufficient disk space (11GB+)
- Check the console for error messages

**Files Not Appearing**
- Click the refresh button (🔄) to update file lists
- Check network connectivity
- Verify the node is properly connected to the network

### Getting Help

1. **Check Console**: Open developer tools (`F12`) for detailed error messages
2. **Debug Mode**: Use `window.codexApi.debugConfig()` to check configuration
3. **Network Tab**: Monitor network requests in browser dev tools
4. **GitHub Issues**: Report bugs on the project's GitHub repository

### Performance Tips

- **Large Files**: Use wired internet for uploading files >1GB
- **Multiple Files**: Upload files one at a time for better reliability
- **Storage**: Ensure 20% free space on your storage device
- **Network**: Close other bandwidth-heavy applications during uploads

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTE.md) for detailed information on how to get started.

**Quick Start for Contributors:**
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For detailed guidelines on code style, development workflow, and testing, please see [CONTRIBUTE.md](CONTRIBUTE.md).

## 🔗 Links

- [Codex Project](https://codex.storage/) - Learn about the Codex storage network
- [Tauri](https://tauri.app/) - Desktop application framework
- [React](https://reactjs.org/) - UI library
