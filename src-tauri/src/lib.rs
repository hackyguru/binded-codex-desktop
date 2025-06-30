// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::Command;
use std::collections::HashMap;
use tauri::{TitleBarStyle, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_http::reqwest;
use std::path::Path;
use std::fs::File;
use std::io::Write;

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

#[tauri::command]
async fn http_request(
    url: String,
    method: String,
    headers: HashMap<String, String>,
    body: Option<String>,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    
    let mut request_builder = match method.to_uppercase().as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url),
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        _ => return Err(format!("Unsupported HTTP method: {}", method)),
    };

    // Add headers
    for (key, value) in headers {
        request_builder = request_builder.header(&key, &value);
    }

    // Add body if provided
    if let Some(body_content) = body {
        request_builder = request_builder.body(body_content);
    }

    // Make the request
    let response = request_builder
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status().as_u16();
    let status_text = response.status().canonical_reason().unwrap_or("Unknown").to_string();
    
    let response_headers: HashMap<String, String> = response
        .headers()
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect();

    let body_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;

    // Try to parse as JSON, fallback to text
    let body_json = if body_text.trim().starts_with('{') || body_text.trim().starts_with('[') {
        serde_json::from_str(&body_text).unwrap_or(serde_json::Value::String(body_text.clone()))
    } else {
        serde_json::Value::String(body_text.clone())
    };

    Ok(serde_json::json!({
        "status": status,
        "statusText": status_text,
        "headers": response_headers,
        "body": body_json,
        "ok": status >= 200 && status < 300
    }))
}

#[tauri::command]
async fn upload_file(
    url: String,
    file_data: Vec<u8>,
    content_type: String,
    filename: String,
    headers: Option<HashMap<String, String>>,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    
    let mut request_builder = client.post(&url);
    
    // Add required headers for Codex file upload
    request_builder = request_builder
        .header("Content-Type", content_type)
        .header("Content-Disposition", format!("attachment; filename=\"{}\"", filename))
        .body(file_data);

    // Add additional headers (like authentication)
    if let Some(additional_headers) = headers {
        for (key, value) in additional_headers {
            request_builder = request_builder.header(&key, &value);
        }
    }

    // Make the request
    let response = request_builder
        .send()
        .await
        .map_err(|e| format!("Upload failed: {}", e))?;

    let status = response.status().as_u16();
    let status_text = response.status().canonical_reason().unwrap_or("Unknown").to_string();
    
    let response_headers: HashMap<String, String> = response
        .headers()
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect();

    let body_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;

    // Try to parse as JSON, fallback to text
    let body_json = if body_text.trim().starts_with('{') || body_text.trim().starts_with('[') {
        serde_json::from_str(&body_text).unwrap_or(serde_json::Value::String(body_text.clone()))
    } else {
        serde_json::Value::String(body_text.clone())
    };

    Ok(serde_json::json!({
        "status": status,
        "statusText": status_text,
        "headers": response_headers,
        "body": body_json,
        "ok": status >= 200 && status < 300
    }))
}

#[tauri::command]
async fn download_file(
    url: String,
    file_path: String,
    headers: HashMap<String, String>,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    
    let mut request_builder = client.get(&url);
    
    // Add headers (including authentication)
    for (key, value) in headers {
        request_builder = request_builder.header(&key, &value);
    }

    // Make the request
    let response = request_builder
        .send()
        .await
        .map_err(|e| format!("Download request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Download failed with status: {}", response.status()));
    }

    // Get response bytes
    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read response bytes: {}", e))?;

    // Create the directory if it doesn't exist
    if let Some(parent) = Path::new(&file_path).parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    // Write to file
    let mut file = File::create(&file_path)
        .map_err(|e| format!("Failed to create file: {}", e))?;
    
    file.write_all(&bytes)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(serde_json::json!({
        "success": true,
        "path": file_path,
        "size": bytes.len()
    }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![greet, execute_command, http_request, upload_file, download_file])
        .setup(|app| {
            let win_builder =
                WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                    .title("")
                    .inner_size(1200.0, 800.0)
                    .max_inner_size(1200.0, 800.0)
                    .min_inner_size(1200.0, 800.0)
                    .resizable(false);

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
