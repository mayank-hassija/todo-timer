#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri::api::notification::Notification;
use window_shadows::set_shadow;

#[tauri::command]
fn set_window_shadow(window: tauri::Window, shadow: bool) {
    #[cfg(any(windows, target_os = "macos"))]
    set_shadow(&window, shadow).unwrap();
}

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
            task_completed,
            loop_completed,
            set_window_shadow,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn task_completed(app: tauri::AppHandle) -> Result<(), String> {
    Notification::new(&app.config().tauri.bundle.identifier)
        .title("Task Completed")
        .body("The current task has been completed.")
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
