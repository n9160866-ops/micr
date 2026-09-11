const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { execFile } = require("child_process");

let mainWindow;
let pollTimer = null;

const POLL_MS = 2000;

// Chemin vers l'exe helper : différent en dev vs packagé
function getHelperPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "helper", "hwhelper.exe");
  }
  return path.join(__dirname, "..", "helper", "bin", "Release", "net8.0", "win-x64", "publish", "hwhelper.exe");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 560,
    height: 680,
    resizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));

  startPolling();

  mainWindow.on("closed", () => {
    stopPolling();
    mainWindow = null;
  });
}

function startPolling() {
  pollOnce();
  pollTimer = setInterval(pollOnce, POLL_MS);
}

function stopPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
}

function pollOnce() {
  const helperPath = getHelperPath();

  execFile(helperPath, { windowsHide: true, timeout: 8000 }, (err, stdout) => {
    if (!mainWindow) return;

    if (err) {
      mainWindow.webContents.send("hw-data", {
        error: "Impossible de lancer le helper (" + err.message + "). Lance l'app en administrateur.",
      });
      return;
    }

    try {
      const data = JSON.parse(stdout.trim());
      mainWindow.webContents.send("hw-data", data);
    } catch (parseErr) {
      mainWindow.webContents.send("hw-data", { error: "Réponse invalide du helper." });
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  stopPolling();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
