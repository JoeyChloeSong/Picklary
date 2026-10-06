# Picklary Vision Rating Local Web v0.2.4

## Local connection recovery

- Runs the local analysis engine as a background process rather than tying it to the command window.
- A watchdog restarts the local server after an unexpected exit.
- The browser retries job status, configuration, and analysis-start requests after a temporary connection loss.
- After reconnection, the browser resumes the same job ID instead of starting over.
- A Resume Analysis button is shown when automatic recovery is not completed.

## Stronger native-process isolation

- Court/player auto setup now runs in a child process, as the full analysis already does.
- A DirectML or OpenCV native failure cannot directly terminate the local API server.
- Per-job worker lock and heartbeat files prevent duplicate analysis after a server restart.

## Diagnostic logs

- `logs/local_server.log`
- `logs/local_server_fault.log`
- `logs/watchdog.log`
- per-job `worker_console.log`
- per-job `auto_setup_console.log`

Run `Picklary_Vision_Rating.cmd --logs` to open the log folder.

## Unified launcher

- Use only `Picklary_Vision_Rating.cmd` for both the first installation and every later run.
- It installs missing components automatically, or opens the ready local engine immediately.
- The previous collection of separate CMD files has been removed from the distribution.
