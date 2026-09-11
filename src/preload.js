const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("hwAPI", {
  onData: (callback) => {
    ipcRenderer.on("hw-data", (_event, data) => callback(data));
  },
});
