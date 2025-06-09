#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri::api::notification::Notification;
use serde_json::json;


fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        
        .add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "quit" => std::process::exit(0),
                    "show" => {
                        if let Some(window) = app.get_window("main") {
                            window.show().ok();
                            window.set_focus().ok();
                        }
                    }
                    
                    _ => {}
                }
            }
            _ => {} // Handle any other system tray events
        })
        .invoke_handler(tauri::generate_handler![
            update_timer,
            toggle_timer_pause,
            reset_timer,
            task_completed,
            loop_completed,
            close_timer_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn update_timer(
    app: tauri::AppHandle,
    task_name: String,
    duration: u32,
    remaining: u32,
) -> Result<(), String> {
    if let Some(main) = app.get_window("main") {
        main.emit("timer-update", json!({
            "taskName": task_name,
            "duration": duration,
            "remaining": remaining
        })).ok();
    }
    Ok(())
}

#[tauri::command]
async fn toggle_timer_pause(
    app: tauri::AppHandle,
    is_paused: bool,
) -> Result<(), String> {
    if let Some(main) = app.get_window("main") {
        main.emit("timer-pause-state", json!({ "isPaused": is_paused })).ok();
    }
    Ok(())
}

#[tauri::command]
async fn reset_timer(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(main) = app.get_window("main") {
        main.emit("timer-reset", ()).ok();
    }
    Ok(())
}

#[tauri::command]
async fn task_completed(app: tauri::AppHandle, task_name: String) -> Result<(), String> {
    Notification::new(&app.config().tauri.bundle.identifier)
        .title("Task Completed")
        .body(&format!("Task '{}' completed!", task_name))
        .show()
        .ok();
    Ok(())
}

#[tauri::command]
async fn loop_completed(app: tauri::AppHandle) -> Result<(), String> {
    Notification::new(&app.config().tauri.bundle.identifier)
        .title("Loop Completed")
        .body("All tasks in the loop are done!")
        .show()
        .ok();
    Ok(())
}

#[tauri::command]
async fn close_timer_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_window("timer_widget") {
        window.close().ok();
    }
    Ok(())
}
