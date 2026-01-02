let currentVolume = 0.8;

function applyVolumeToAll(volumeLevel) {
  console.log("Applying volume:", volumeLevel);
  currentVolume = volumeLevel;

  const mediaElements = document.querySelectorAll("video, audio");

  mediaElements.forEach((element) => {
    try {
      element.volume = volumeLevel;
      console.log(
        "Set volume for element:",
        element.tagName,
        "to",
        volumeLevel
      );
    } catch (e) {
      console.error("Error setting volume:", e);
    }
  });
}

chrome.storage.sync.get(["globalVolume"], (result) => {
  const volume = result.globalVolume !== undefined ? result.globalVolume : 80;
  console.log("Loaded saved volume:", volume);
  applyVolumeToAll(volume / 100);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "setVolume") {
    console.log("Received setVolume message:", request.volume);
    applyVolumeToAll(request.volume);
    sendResponse({ success: true });
  }
  return true;
});

const observer = new MutationObserver(() => {
  const mediaElements = document.querySelectorAll("video, audio");
  mediaElements.forEach((element) => {
    if (element.volume !== currentVolume) {
      element.volume = currentVolume;
    }
  });
});

setTimeout(() => {
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}, 1000);

document.addEventListener(
  "loadedmetadata",
  (e) => {
    if (e.target.tagName === "VIDEO" || e.target.tagName === "AUDIO") {
      console.log("Media loaded, setting volume");
      e.target.volume = currentVolume;
    }
  },
  true
);

document.addEventListener(
  "play",
  (e) => {
    if (e.target.tagName === "VIDEO" || e.target.tagName === "AUDIO") {
      console.log("Media playing, setting volume");
      e.target.volume = currentVolume;
    }
  },
  true
);

document.addEventListener(
  "volumechange",
  (e) => {
    if (e.target.tagName === "VIDEO" || e.target.tagName === "AUDIO") {
      if (Math.abs(e.target.volume - currentVolume) > 0.01) {
        console.log("Volume changed externally, restoring to:", currentVolume);
        e.target.volume = currentVolume;
      }
    }
  },
  true
);

setInterval(() => {
  applyVolumeToAll(currentVolume);
}, 2000);
