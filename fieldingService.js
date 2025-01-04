function placePlayers(players, positions, apiKey) {
  if (apiKey) return getAiPlayerPositions(players, positions, apiKey);
  else return getPlayerPositions(players, positions);
}

async function getAiPlayerPositions(players, positions, apiKey) {
  const simplePositions = positions.map((position) => ({
    label: position.label,
    player: position.player?.id,
  }));
  const playersJson = JSON.stringify(players);
  const positionsJson = JSON.stringify(simplePositions);
  const fieldingPlayersPrompt = `You are the manager of a youth baseball team.
  You need to determine the fielding positions for the players on the team.
  Each player has a name, an id, a rank, and a list of positions they can play in order of most importance for that player. 
  The available positions in order of importance are as follows using standard baseball position numbers:
  1 = pitcher, 2 = catcher, 3 = first base, 6 = short stop, 5 = third base, 4 = second base, 8 = center field, 7 = left field, 9 = right field, 0 = sitting out.
  Here are the list of players:
  ${playersJson}
  Each position has a label to indicate it's fielding position and is associated with a player by their id.
  Some of the positions will already be set with a player.
  Here are the current positions for the team as an array of JSON objects:
  ${positionsJson}
  Assign players to all the remaining positions that are not already associated with a player and return back the JSON for the array of Position objects only in the response.
  The positions should be ordered by label in the response.
  Every available position should be associated with a player id.
  Each player can only fill one position at a time so their id cannot be associated with more than one position.
  Association to a position should be based on a players rank and the list of ordered positions they can play.
  The highest ranked players should be associated to the most important positions based on their own ordered list of positions and availability.
  A weighted ranking should be used to determine which player gets to play a position based off the ordering of the given position in their list and their overall rank with a 60% bias for their position ordering.
  Make sure each player is associated with only one position, and that all positions have a player.`;

  console.log(fieldingPlayersPrompt);

  return postChatRequest(apiKey, fieldingPlayersPrompt)
    .then((response) => {
      console.log("fielding response: " + response);
      response = response.replaceAll("`", "");
      response = response.replaceAll("json", "");
      let newPositions = JSON.parse(response);

      newPositions.forEach((newPosition) => {
        const position = positions.find((p) => p.label === newPosition.label);
        const player = players[newPosition.player];
        position.player = player;
      });
      console.log("updated positions =" + JSON.stringify(positions));
    })
    .catch((error) => {
      console.log(`error ${JSON.stringify(error)}`);
    });
}

function getPlayerPositions(players, positions) {
  return new Promise((resolve, reject) => {
    const assignedPlayers = new Set(
      positions
        .filter((position) => position.player)
        .map((position) => position.player.id)
    );
    const availablePlayers = players.filter(
      (player) => !assignedPlayers.has(player.id)
    );

    positions.forEach((position) => {
      if (!position.player) {
        // Find the best player for this position (lowest weight)
        let bestPlayer = null;
        let bestWeight = Infinity;
        console.log(`===== postion ${position.name} ========`);

        availablePlayers.forEach((player) => {
          const weight = calculateWeight(player, position.label);
          console.log(`player ${player.name} weight = ${weight}`);
          if (weight < bestWeight) {
            bestWeight = weight;
            bestPlayer = player;
          }
        });

        // Assign the best player to the position
        if (bestPlayer) {
          position.player = bestPlayer;
          assignedPlayers.add(bestPlayer.id);
          availablePlayers.splice(availablePlayers.indexOf(bestPlayer), 1);
        }
      }
    });
    resolve();
  });
}

// Calculate weight for a player's preference for a position
function calculateWeight(player, positionLabel) {
  const positionRank =
    player.positions.split(",").indexOf(positionLabel.toString()) + 1;
  //return positionRank >= 0 ? player.rank * 10 + positionRank : Infinity;
  return positionRank > 0 ? player.rank * positionRank : 1000000;
}
