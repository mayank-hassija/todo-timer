# Todo Timer

A cross-platform desktop application built with Tauri that functions as a personal to-do list timer. The app features a main window for task management and a separate, customizable floating timer widget that remains always on top of other applications.

## Features

- Task management with customizable durations
- Floating timer widget that stays on top
- Draggable timer window
- Task persistence
- Repeat loop option
- Desktop notifications
- Minimal resource usage
- Cross-platform support

## Prerequisites

- Node.js (v16 or later)
- Rust (latest stable)
- Tauri CLI
- System dependencies for Tauri development

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/todo-timer.git
cd todo-timer
```

2. Install dependencies:
```bash
npm install
```

3. Install Tauri CLI (if not already installed):
```bash
cargo install tauri-cli
```

## Development

To run the application in development mode:

```bash
npm run tauri dev
```

## Building

To build the application for production:

```bash
npm run tauri build
```

The built application will be available in the `src-tauri/target/release` directory.

## Usage

1. Add tasks using the main window:
   - Enter task name
   - Set duration in minutes
   - Click "Add Task"

2. Start the timer:
   - Click "Start Loop" to begin the timer sequence
   - The floating timer widget will appear

3. Control the timer:
   - Use the floating widget to pause/resume
   - Reset the current task if needed
   - Drag the widget to position it anywhere on screen

4. Task Management:
   - Remove tasks using the "Remove" button
   - Reset all tasks using "Reset All Tasks"
   - Enable/disable loop repetition using the checkbox

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 