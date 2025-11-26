// Teams with players and win/loss ratio
const teams = [
  { name: "Red Rockets", players: ["Alice", "Bob", "Charlie"], wins: 0, losses: 0 },
  { name: "Blue Blazers", players: ["David", "Eva", "Frank"], wins: 0, losses: 0 },
  { name: "Green Giants", players: ["Grace", "Hank", "Ivy"], wins: 0, losses: 0 },
  { name: "Yellow Yaks", players: ["Jack", "Kara", "Leo"], wins: 0, losses: 0 }
];

// Games structure for double-elimination 4-team bracket
const games = [
  // Winners bracket round 1
  { id: 1, round: "W1", team1: "Red Rockets", team2: "Blue Blazers", score1: 0, score2: 0, winnerTo: 5, loserTo: 3 },
  { id: 2, round: "W1", team1: "Green Giants", team2: "Yellow Yaks", score1: 0, score2: 0, winnerTo: 6, loserTo: 4 },

  // Losers bracket round 1
  { id: 3, round: "L1", team1: null, team2: null, score1: 0, score2: 0, winnerTo: 7 },
  { id: 4, round: "L1", team1: null, team2: null, score1: 0, score2: 0, winnerTo: 7 },

  // Winners bracket final
  { id: 5, round: "W2", team1: null, team2: null, score1: 0, score2: 0, winnerTo: 8, loserTo: 4 },

  // Losers bracket final
  { id: 7, round: "L2", team1: null, team2: null, score1: 0, score2: 0, winnerTo: 8 },

  // Grand final
  { id: 8, round: "GF", team1: null, team2: null, score1: 0, score2: 0 }
];
