// Default keybind configuration
const DEFAULT_KEYBIND = {
  ctrlKey: false,
  metaKey: true, // Cmd on Mac
  shiftKey: true,
  altKey: false,
  key: "A",
};

// For Windows/Linux, use Ctrl instead of Cmd
if (navigator.platform.indexOf("Mac") === -1) {
  DEFAULT_KEYBIND.ctrlKey = true;
  DEFAULT_KEYBIND.metaKey = false;
}

let currentKeybind = { ...DEFAULT_KEYBIND };
let isRecording = false;

// DOM elements
const keybindInput = document.getElementById("keybindInput");
const saveButton = document.getElementById("saveButton");
const resetButton = document.getElementById("resetButton");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

// Initialize
document.addEventListener("DOMContentLoaded", loadSettings);

// Load saved settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get("keybind");
    if (result.keybind) {
      currentKeybind = result.keybind;
    }
    updateKeybindDisplay();
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
}

// Update the display of current keybind
function updateKeybindDisplay() {
  const keys = [];
  if (currentKeybind.ctrlKey) keys.push("Ctrl");
  if (currentKeybind.metaKey)
    keys.push(navigator.platform.indexOf("Mac") !== -1 ? "Cmd" : "Win");
  if (currentKeybind.shiftKey) keys.push("Shift");
  if (currentKeybind.altKey) keys.push("Alt");
  if (currentKeybind.key) keys.push(currentKeybind.key.toUpperCase());

  keybindInput.value = keys.join("+");
}

// Handle keybind input
keybindInput.addEventListener("focus", () => {
  isRecording = true;
  keybindInput.value = "ショートカットキーを押してください...";
  keybindInput.style.backgroundColor = "#e3f2fd";
  hideError();
});

keybindInput.addEventListener("blur", () => {
  isRecording = false;
  keybindInput.style.backgroundColor = "#f9f9f9";
  updateKeybindDisplay();
});

keybindInput.addEventListener("keydown", (e) => {
  if (!isRecording) return;

  e.preventDefault();
  e.stopPropagation();

  // Ignore modifier keys alone
  if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) {
    return;
  }

  const newKeybind = {
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
    shiftKey: e.shiftKey,
    altKey: e.altKey,
    key: e.key.length === 1 ? e.key.toUpperCase() : e.key,
  };

  const validation = validateKeybind(newKeybind);
  if (!validation.isValid) {
    showError(validation.message);
    return;
  }

  // Update current keybind
  currentKeybind = newKeybind;
  updateKeybindDisplay();
  saveButton.disabled = false;
  hideError();

  keybindInput.blur();
});

// Validate keybind
function validateKeybind(keybind) {
  if (!keybind.ctrlKey && !keybind.metaKey && !keybind.altKey) {
    return {
      isValid: false,
      message: "ショートカットにはCtrl/CmdまたはAltを含む必要があります",
    };
  }

  if (!keybind.key || keybind.key.length === 0) {
    return {
      isValid: false,
      message: "ショートカットには通常のキーを含む必要があります",
    };
  }

  // Avoid single key shortcuts
  const modifierCount = [
    keybind.ctrlKey,
    keybind.metaKey,
    keybind.shiftKey,
    keybind.altKey,
  ].filter(Boolean).length;
  if (modifierCount === 0) {
    return {
      isValid: false,
      message: "単一キーのショートカットは使用できません",
    };
  }

  return { isValid: true };
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

function hideError() {
  errorMessage.style.display = "none";
}

// Save settings
saveButton.addEventListener("click", async () => {
  try {
    await chrome.storage.sync.set({ keybind: currentKeybind });

    // Show success message
    showSuccessMessage();
    saveButton.disabled = true;
  } catch (error) {
    console.error("Failed to save settings:", error);
    showError("設定の保存に失敗しました。もう一度お試しください。");
  }
});

// Reset to default
resetButton.addEventListener("click", async () => {
  currentKeybind = { ...DEFAULT_KEYBIND };
  updateKeybindDisplay();
  saveButton.disabled = true;

  try {
    await chrome.storage.sync.remove("keybind");

    showSuccessMessage();
  } catch (error) {
    console.error("Failed to reset settings:", error);
    showError("設定のリセットに失敗しました。もう一度お試しください。");
  }
});

function showSuccessMessage() {
  successMessage.style.display = "block";
  setTimeout(() => {
    successMessage.style.display = "none";
  }, 3000);
}
