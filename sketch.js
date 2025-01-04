const CANVAS_WIDTH = 375;
const CANVAS_HEIGHT = 810;

let apiKey = "";
let positions;
let selectedPosition;
let playerPanel;
let currentTeam = 0;
let currentGame = 0;
let currentInning = 0;
let positionLocations;

let teams;

function setup() {
  // setup the canvas
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  // init position locations based off current canvas
  positionLocations = [
    { x: 0, y: 0 }, //none
    { x: width / 2, y: height / 2 - 40 }, //pitcher
    { x: width / 2, y: height / 2 + 50 }, //catcher
    { x: width / 2 + 90, y: height / 2 - 40 }, //first
    { x: width / 2, y: height / 2 - 130 }, //second
    { x: width / 2 - 90, y: height / 2 - 40 }, //third
    { x: width / 2 - 65, y: height / 2 - 100 }, //short
    { x: width / 2 - 150, y: height / 2 - 220 }, //left
    { x: width / 2, y: height / 2 - 260 }, //center
    { x: width / 2 + 110, y: height / 2 - 220 }, //right
    { x: width / 2 - 170, y: height / 2 + 25 }, //out1
    { x: width / 2 - 170, y: height / 2 + 50 }, //out2
    { x: width / 2 - 170, y: height / 2 + 75 }, //out3
    { x: width / 2 - 170, y: height / 2 + 100 }, //out4
    { x: width / 2 - 150, y: height / 2 + 125 }, //out5
  ];

  //load teams
  teams = loadTeams();
  console.log(`teams = ${JSON.stringify(teams)}`);

  //draw ui elements
  drawUi();
  createAutoFieldingButton();
  createTeamButton();
  //createSettingsPanel(); // Initialize the settings panel
  //createSettingsLink(); // Create the settings link
  drawDugout();
  drawTopNav();

  // collect api key if not available
  // if(!apiKey)
  //   toggleSettingsPanel(true);
}

function drawUi() {
  // draw the UI
  background(220);
  drawBaseballField(width / 2, height / 2 + 100, 700, 800, "GREEN");
  drawBaseballField(width / 2, height / 2 + 80, 500, 600, "BROWN");
  drawBaseballDiamond(width / 2, height / 2 - 40, 200, 200); // Call function to draw the diamond
  drawAllPlayerPositions();
}

function drawTopNav() {
  const topNavContainer = createDiv("")
    .class("nav-container")
    .style("width", `${width}px`)
    .position(0, 0);

  const titleBar = createDiv(
    "<span class='material-icons' style='background:#000; padding:4px; margin-right:5px;'>sports_baseball</span>LineupMagic"
  )
    .parent(topNavContainer)
    .style("background", "#444")
    .style("color", "#FFF")
    .style("display", "flex")
    .style("font-family", "arial")
    .style("align-items", "center");
  const baseball = createSpan("auto_awesome")
    .class("material-icons")
    .style("color", "#EA33F7")
    .style("padding", "2px")
    .parent(titleBar);

  const teamGameContainer = createDiv("")
    .class("teamgame-container")
    .parent(topNavContainer);

  //team selector
  const teamSelection = createSelect()
    .class("team-selection")
    .parent(teamGameContainer);

  teams.forEach((team, index) => teamSelection.option(team.name, index));
  teamSelection.selected(currentTeam);

  //game selector
  const gameSelection = createSelect()
    .class("team-selection")
    .parent(teamGameContainer);

  teams[currentTeam].games.forEach((game, index) =>
    gameSelection.option(game.name, index)
  );
  gameSelection.selected(currentGame);

  //innings

  const tabContainer = createDiv("")
    .class("inning-tabs")
    .style("width", `${width}px`)
    .parent(topNavContainer);

  const tabLabels = ["1", "2", "3", "4", "5", "6"];
  //const tabWidth = width / tabLabels.length;

  // Create tab buttons and append them to the container
  tabLabels.forEach((label, index) => {
    const tabButton = createButton(label)
      .class("inning-tab")
      //.style('width', `${tabWidth}px`)
      .addClass(index === 0 ? "selected-inning" : ""); // Make the first tab selected by default

    tabButton.mousePressed(() => selectTab(index, tabContainer));
    tabContainer.child(tabButton);
  });
}

function drawInnings() {
  const tabContainer = createDiv("")
    .class("inning-tabs")
    .style("width", `${width}px`)
    .position(0, 30);

  const tabLabels = ["1", "2", "3", "4", "5", "6"];
  //const tabWidth = width / tabLabels.length;

  // Create tab buttons and append them to the container
  tabLabels.forEach((label, index) => {
    const tabButton = createButton(label)
      .class("inning-tab")
      //.style('width', `${tabWidth}px`)
      .addClass(index === 0 ? "selected-inning" : ""); // Make the first tab selected by default

    tabButton.mousePressed(() => selectTab(index, tabContainer));
    tabContainer.child(tabButton);
  });
}

function selectTab(selectedIndex, container) {
  // Get all tab buttons
  currentInning = selectedIndex;
  const tabs = container.elt.querySelectorAll(".inning-tab");
  //TODO currentInning = index;

  // Update the classes for tabs
  tabs.forEach((tab, index) => {
    if (index === selectedIndex) {
      tab.classList.add("selected-inning");
    } else {
      tab.classList.remove("selected-inning");
    }
  });
  drawUi();
}

function drawBaseballField(x, y, fieldWidth, fieldHeight, color) {
  push();
  translate(x, y); // Move the field to the specified coordinates

  // Draw the outfield as a slice of a circle
  if (color == "GREEN") fill(34, 139, 34); // Green grass color
  if (color == "BROWN") fill(210, 180, 140); // Green grass color
  noStroke();
  arc(0, 0, fieldWidth, fieldHeight, PI - radians(-45), PI + radians(135), PIE); // Slice for the outfield

  pop();
}

function drawBaseballDiamond(x, y, diamondWidth, diamondHeight) {
  push();
  translate(x, y); // Move the diamond to the specified coordinates

  const halfWidth = diamondWidth / 2 - 10;
  const halfHeight = diamondHeight / 2 - 10;

  // Draw the diamond outline
  fill(34, 139, 34); // Green field color
  strokeWeight(0);
  beginShape();
  vertex(-halfWidth, 0); // Left point (3rd base)
  vertex(0, -halfHeight); // Top point (2nd base)
  vertex(halfWidth, 0); // Right point (1st base)
  vertex(0, halfHeight); // Bottom point (home plate)
  endShape(CLOSE);

  // Draw bases
  fill(255); // White base color
  noStroke();
  rectMode(CENTER);

  rect(-halfWidth, 0, diamondWidth * 0.066, diamondHeight * 0.066); // 3rd base
  rect(0, -halfHeight, diamondWidth * 0.066, diamondHeight * 0.066); // 2nd base
  rect(halfWidth, 0, diamondWidth * 0.066, diamondHeight * 0.066); // 1st base
  rect(0, halfHeight, diamondWidth * 0.1, diamondHeight * 0.05); // Home plate (slightly different shape)

  // Add pitcher's mound
  fill(210, 180, 140); // Brown color
  ellipse(0, 0, diamondWidth * 0.1, diamondHeight * 0.1); // Small circle for the mound

  pop();
}

function scrollToPageBottom() {
  // Scroll to the bottom of the page
  window.scrollTo({
    top: document.body.scrollHeight, // Scroll to the total height of the document
    behavior: "smooth", // Smooth scrolling
  });
}

function scrollToPageTop() {
  window.scrollTo({
    top: 0, // Scroll to the top of the document
    behavior: "smooth", // Smooth scrolling effect
  });
}

function drawAllPlayerPositions() {
  let positions =
    teams[currentTeam].games[currentGame].innings[currentInning].positions;
  positions.forEach((position) => drawPlayerPosition(position, currentTeam));
}

function drawPlayerPosition(position, currentTeam) {
  console.log(`drawing position ${JSON.stringify(position)}`);
  const { label, name, player } = position;
  const { x, y } = positionLocations[position.label];

  push();
  translate(x, y);

  // Draw label next to the circle
  let labelWidth;
  let labelHeight;
  if (player) {
    // Draw label background
    labelWidth = textWidth(player.name) + 27; // Calculate dynamic width for text
    labelHeight = 20;
    fill(255, 255, 255, 140); // White background with some opacity
    noStroke();
    rectMode(CORNER);
    rect(0, -labelHeight / 2, labelWidth, labelHeight);

    // draw the label
    fill(0); // Black color
    textAlign(LEFT, CENTER);
    textSize(14);
    text(player.name, 15, 0);
  }

  // Draw circle
  fill(0, 123, 255); // Blue color
  stroke(255); // White outline
  strokeWeight(2);
  ellipse(0, 0, 21, 21);

  // Draw number inside the circle
  if (label < 10) {
    fill(255); // White color
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
    text(label, 0, 0);
  }

  //
  const playerSelection = createSelect()
    .position(x - 20, y - 20)
    .class("player-selection")
    .style("z-index", position.label);
  playerSelection.option("-none-", "none");
  teams[currentTeam].players.forEach((player) =>
    playerSelection.option(player.name, player.id)
  );
  if (player) playerSelection.selected(player.id);
  else playerSelection.selected("none");

  playerSelection.changed(() => {
    console.log("selected player:" + playerSelection.value());
    let positions =
      teams[currentTeam].games[currentGame].innings[currentInning].positions;
    // iterate through the current positions and clear the player object if it matches the selected player
    let i = 0;
    positions.forEach((pos) => {
      if (pos.player && pos.player.id.toString() === playerSelection.value())
        pos.player = undefined;
    });

    // set the selected player to the position
    if (playerSelection.value() === "none") position.player = undefined;
    else position.player = teams[currentTeam].players[playerSelection.value()];

    drawUi();
    scrollToPageTop();
  });

  pop();
}

function createTeamButton() {
  const teamBtn = createButton('<span class="material-icons">group</span>')
    .class("team-button")
    .position(width - 35, height / 2)
    .mousePressed(() => {
      console.log("Team Button Clicked");
    });
}

function createAutoFieldingButton() {
  let positions =
    teams[currentTeam].games[currentGame].innings[currentInning].positions;
  const autoFieldingIco = apiKey ? "auto_awesome" : "auto_fix_high";
  const autoFieldingBtn = createButton(
    `<span title="Determine players for open positions" class="material-icons">${autoFieldingIco}</span>`
  ).class("fielding-button");
  autoFieldingBtn.position(width / 2 - 30, height / 2 + 120);
  autoFieldingBtn.mousePressed(() => {
    console.log("Auto Fielding Button Clicked");
    autoFieldingBtn.remove();
    const loadingIcon = createDiv("")
      .class("loading-icon")
      .position(width - 110, height / 2 + 20);
    placePlayers(teams[currentTeam].players, positions, apiKey).then(() => {
      loadingIcon.remove();
      drawUi();
      createAutoFieldingButton();
    });
  });
}

function drawDugout() {
  const dugout = createSpan("gite")
    .class("material-icons")
    .style("font-size: 40px;")
    .style("color: #7E7E7E")
    .position(10, height / 2 - 30);
}

// function showPlayerPanel(selectedPosition, currentTeam) {
//   toggleSettingsPanel(false);

//   // remove the player panel if it already exists
//   if (playerPanel) playerPanel.remove();

//   // create a new player panel
//   playerPanel = createDiv(
//     "<h1>" + selectedPosition.label + " - " + selectedPosition.name + "</h1>"
//   )
//     .position(0, height - 360)
//     .size(width, 100)
//     .class("player-panel");

//   // setup the selection box, it's options, and default
//   const playerSelection = createSelect();
//   playerSelection.parent(playerPanel);
//   playerSelection.option("-none-", "none");
//   teams[currentTeam].players.forEach((player) =>
//     playerSelection.option(player.name, player.id)
//   );
//   if (selectedPosition.player)
//     playerSelection.selected(selectedPosition.player.id);
//   else playerSelection.selected("none");

//   // handle change event
//   playerSelection.changed(() => {
//     console.log("selected player:" + playerSelection.value());
//     let positions =
//       teams[currentTeam].games[currentGame].innings[currentInning].positions;
//     // iterate through the current positions and clear the player object if it matches the selected player
//     let i = 0;
//     positions.forEach((position) => {
//       if (
//         position.player &&
//         position.player.id.toString() === playerSelection.value()
//       )
//         position.player = undefined;
//     });

//     // set the selected player to the position
//     if (playerSelection.value() === "none") selectedPosition.player = undefined;
//     else
//       selectedPosition.player =
//         teams[currentTeam].players[playerSelection.value()];

//     drawUi();
//     scrollToPageTop();
//   });
// }
