// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::Command;
use tauri::{TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn execute_command(command: &str, args: Vec<String>) -> Result<String, String> {
    let output = Command::new(command)
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        if stderr.is_empty() {
            Ok("Command executed successfully".to_string())
        } else {
            Err(format!("Command failed: {}", stderr))
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![greet, execute_command])
        .setup(|app| {
            let win_builder =
                WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                    .title("")
                    .inner_size(1200.0, 800.0)
                    .max_inner_size(1200.0, 800.0)
                    .min_inner_size(1200.0, 800.0);

            // set transparent title bar only when building for macOS
            #[cfg(target_os = "macos")]
            let win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);

            let window = win_builder.build().unwrap();

            // set background color only when building for macOS
            #[cfg(target_os = "macos")]
            {
                use cocoa::appkit::{NSColor, NSWindow};
                use cocoa::base::{id, nil};

                let ns_window = window.ns_window().unwrap() as id;
                unsafe {
                    // Set a dark background color that matches our app theme
                    let bg_color = NSColor::colorWithRed_green_blue_alpha_(
                        nil,
                        0.0, // Red: 0 (black)
                        0.0, // Green: 0 (black)
                        0.0, // Blue: 0 (black)
                        1.0, // Alpha: 1.0 (fully opaque)
                    );
                    ns_window.setBackgroundColor_(bg_color);
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
