/**
 * The AssignChanger class handles automatic user assignment in Backlog.
 * It observes DOM mutations and listens for specific keyboard shortcuts to trigger assignment.
 */
class AssignChanger {
  /**
   * Creates an instance of AssignChanger.
   * @param {Document} document - The document object of the web page.
   */
  constructor(document) {
    this.document = document;
    /**
     * Configuration for the MutationObserver to observe changes in the DOM.
     * @type {Object}
     * @property {boolean} subtree - Whether to observe changes in the entire subtree.
     * @property {boolean} characterData - Whether to observe changes in character data.
     */
    this.config = {
      subtree: true,
      characterData: true,
    };

    /**
     * Default keybind configuration
     * @type {Object}
     */
    this.keybind = {
      ctrlKey: false,
      metaKey: true,
      shiftKey: true,
      altKey: false,
      key: "A",
    };

    // Use Ctrl for Windows/Linux
    if (navigator.platform.indexOf("Mac") === -1) {
      this.keybind.metaKey = false;
      this.keybind.ctrlKey = true;
    }

    // Load saved keybind settings
    this.loadKeybindSettings();
  }

  /**
   * Starts observing the DOM for mutations using a MutationObserver.
   */
  observe() {
    const observer = new MutationObserver(this.callback);
    observer.observe(this.document.body, this.config);
  }

  /**
   * Callback function for the MutationObserver. Handles mutations in the DOM.
   * @param {MutationRecord[]} mutationsList - List of mutations observed.
   * @param {MutationObserver} _ - The MutationObserver instance (unused).
   */
  callback = (mutationsList, _) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "characterData") {
        this.handleLoadPage();
      }
    }
  };

  /**
   * Handles the loading of the page by attaching event listeners to the comment input field.
   */
  handleLoadPage = () => {
    const comment = this.document.getElementById("leftCommentContent");
    if (comment) {
      comment.addEventListener("keydown", this.handleKeydownEvent);
      this.document.addEventListener("keydown", this.handleKeydownEvent);
    }
  };

  /**
   * Loads keybind settings from chrome storage
   */
  loadKeybindSettings = async () => {
    try {
      const result = await chrome.storage.sync.get("keybind");
      if (result.keybind) {
        this.keybind = result.keybind;
      }
    } catch (error) {
      console.error("Failed to load keybind settings:", error);
    }
  };

  /**
   * Checks if the current keyboard event matches the configured keybind
   * @param {KeyboardEvent} event - The keyboard event object
   * @returns {boolean} True if the event matches the keybind
   */
  matchesKeybind = (event) => {
    return (
      event.ctrlKey === this.keybind.ctrlKey &&
      event.shiftKey === this.keybind.shiftKey &&
      event.altKey === this.keybind.altKey &&
      event.metaKey === this.keybind.metaKey &&
      event.key.toUpperCase() === this.keybind.key.toUpperCase()
    );
  };

  /**
   * Handles the keydown event to detect specific keyboard shortcuts.
   * @param {KeyboardEvent} event - The keyboard event object.
   */
  handleKeydownEvent = (event) => {
    if (this.matchesKeybind(event)) {
      event.preventDefault();
      this.handleAutoAssign();
    }
  };

  /**
   * Gets the user ID mentioned in the comment field.
   * @returns {string|null} The user ID if found, otherwise null.
   */
  getMentionedUserId = () => {
    const userIdElement = this.document.querySelector(
      "#leftCommentContent .at-mention-node",
    );
    return userIdElement ? userIdElement.getAttribute("data-id") : null;
  };

  /**
   * Gets the div ID of the assignee selection field.
   * @returns {string|null} The div ID if found, otherwise null.
   */
  getAssigneeDivId = () => {
    const divElement = this.document.querySelector(
      "div.change-statuses-properties-item.-assigner div div",
    );
    return divElement ? divElement.getAttribute("id") : null;
  };

  /**
   * Opens the assignee selection dropdown.
   * @param {string} divId - The div ID of the assignee selection field.
   * @returns {boolean} True if dropdown was opened, false otherwise.
   */
  openAssigneeDropdown = (divId) => {
    const chznContainer = this.document.querySelector(
      `#${divId} > div.chzn-container button`,
    );
    if (chznContainer) {
      chznContainer.click();
      return true;
    }
    return false;
  };

  /**
   * Clicks the assignee in the dropdown list based on the user ID.
   * @param {string} userId - The ID of the user to assign.
   * @param {string} divId - The ID of the dropdown container.
   * @param {Element|null} activeElement - The currently focused element.
   */
  clickAssignee = (userId, divId, activeElement) => {
    const listItem = this.document.querySelector(`#${divId}_list-${userId}`);
    if (listItem) {
      listItem.click();
    }
    if (activeElement) {
      activeElement.focus();
    }
  };

  /**
   * Performs the automatic assignment of the mentioned user as assignee.
   */
  handleAutoAssign = () => {
    const userId = this.getMentionedUserId();
    if (!userId) {
      return;
    }

    const divId = this.getAssigneeDivId();
    if (!divId) {
      return;
    }

    const activeElement = this.document.activeElement;

    if (this.openAssigneeDropdown(divId)) {
      setTimeout(() => this.clickAssignee(userId, divId, activeElement), 10);
    }
  };
}

function main() {
  new AssignChanger(document).observe();

  window.addEventListener("load", () => {
    // When displayed in a modal iframe, set up observer separately
    const iframe = document.getElementById("issue-dialog-iframe");
    if (iframe) {
      iframe.addEventListener("load", () => {
        const iframeDocument = iframe.contentWindow.document;
        new AssignChanger(iframeDocument).observe();
      });
    }
  });
}

main();
