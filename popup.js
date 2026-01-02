const volumeSlider = document.getElementById("volumeSlider");
const volumeDisplay = document.getElementById("volumeDisplay");
const statusEl = document.getElementById("status");

chrome.storage.sync.get(["globalVolume"], (result) => {
  const volume = result.globalVolume !== undefined ? result.globalVolume : 80;
  volumeSlider.value = volume;
  volumeDisplay.textContent = volume + "%";
});

volumeSlider.addEventListener("input", (e) => {
  const volume = e.target.value;
  volumeDisplay.textContent = volume + "%";

  chrome.storage.sync.set({ globalVolume: parseInt(volume) }, () => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs
          .sendMessage(tab.id, {
            action: "setVolume",
            volume: parseInt(volume) / 100,
          })
          .catch(() => {});
      });
    });

    showStatus("Volume set to " + volume + "%");
  });
});

document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const volume = btn.dataset.volume;
    volumeSlider.value = volume;
    volumeDisplay.textContent = volume + "%";

    chrome.storage.sync.set({ globalVolume: parseInt(volume) }, () => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs
            .sendMessage(tab.id, {
              action: "setVolume",
              volume: parseInt(volume) / 100,
            })
            .catch(() => {});
        });
      });
      showStatus("Volume set to " + volume + "%");
    });
  });
});

function showStatus(message) {
  statusEl.textContent = message;
  statusEl.style.background = "rgba(76, 175, 80, 0.3)";
  setTimeout(() => {
    statusEl.style.background = "rgba(255, 255, 255, 0.2)";
    statusEl.textContent = "Volume applied to all tabs";
  }, 1500);
}
