let panelVisible = false;
let settingsPanel;

function createSettingsPanel() {
  settingsPanel = createDiv("").class("settings-panel");

  settingsPanel.child(
    createDiv(
      'Please provide a ChatGPT API key using your own account.<span title="This key is stored and used locally on your device in the browser for your interactions only, and is not shared with other users. Details on how to obtain an API key can be found by asking ChatGPT." class="material-icons">help_outline</span>'
    )
  );

  const inputDiv = createDiv("").class("input-div");
  settingsPanel.child(inputDiv);

  const input = createInput("")
    .attribute("placeholder", "Enter API Key")
    .attribute("type", "password")
    .style("flex-basis: 100%;");
  inputDiv.child(input);

  const saveButton = createButton("Save");
  saveButton.style("margin-left", "10px");
  let statusIcon;
  saveButton.mousePressed(() => {
    apiKey = input.value();
    console.log("API Key saved:", apiKey);
    if (statusIcon) statusIcon.remove();

    //show a loading icon
    const loadingIcon = createDiv("").class("loading-icon");
    inputDiv.child(loadingIcon);

    //make test call
    pingChatRequest(apiKey)
      .then((response) => {
        console.log("AI connection: " + JSON.stringify(response));
        //show a success/fail icon in place of loading icon
        loadingIcon.remove();
        statusIcon = createDiv(
          '<span class="material-icons">done</span>'
        ).style("color: green");
        inputDiv.child(statusIcon);
        createAutoFieldingButton();
        setTimeout(() => toggleSettingsPanel(false), 500);
      })
      .catch((error) => {
        console.log(error);
        loadingIcon.remove();
        statusIcon = createDiv(
          '<span title="Unable to connect to Chat GPT with the provided API Key" class="material-icons">error</span>'
        ).style("color: red; padding: 15px");
        inputDiv.child(statusIcon);
        createAutoFieldingButton();
      });
  });
  inputDiv.child(saveButton);
}

function createSettingsLink() {
  const settingsLink = createButton("Settings")
    .class("settings-button")
    .position(width / 2 - 30, height - 30)
    .mousePressed(() => toggleSettingsPanel(true));
}

function toggleSettingsPanel(show) {
  panelVisible = show;
  if (show) {
    settingsPanel.style("bottom", "0"); // Slide in
  } else {
    settingsPanel.style("bottom", "-220px"); // Slide out
  }
}
