// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::Command;

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
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![greet, execute_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
