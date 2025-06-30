# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

# Codex Desktop

## Remote Node Configuration

When you select "Remote Node" mode in settings, all API requests will be sent to the remote endpoint instead of the local node. Here's how to verify this is working correctly:

### Testing Remote Configuration

1. **Visual Indicators**:
   - The top navigation bar shows "Remote" or "Local" with an icon
   - Hover over the indicator to see the remote endpoint URL

2. **Console Debug Information**:
   - Open browser developer tools (F12)
   - Look for console messages showing which endpoints are being used:
     - `Creating API client - Node type: remote`
     - `Remote mode - Using endpoint: [your-endpoint]`
     - `Built URL for remote node: [full-url]`

3. **Manual Testing**:
   ```javascript
   // In browser console, run:
   window.codexApi.debugConfig('8080')
   ```
   This will show detailed configuration information and verify endpoints.

### Expected Behavior in Remote Mode

- **All API calls** go to the remote endpoint (not localhost)
- **Upload/Download/Seed** operations use authenticated requests
- **Port forwarding checks** are skipped (not applicable for remote nodes)
- **Local Codex process** is not started/stopped (power button may be hidden or disabled)

### Troubleshooting

If you notice API calls still going to localhost when in remote mode:
1. Check the console for error messages
2. Verify remote endpoint, username, and password are configured
3. Use the debug utility: `window.codexApi.debugConfig()`
4. Ensure you've selected "Remote Node" in settings and the configuration is saved

## Original README content continues below...
