import { Match } from "../src/models/matchModel";
import { MatchService } from "../src/services/matchService";

const matchService = new MatchService();

const matches: Match[] = [
  { teamA: "A", teamB: "B", scoreA: 1, scoreB: 0 },
  { teamA: "C", teamB: "D", scoreA: 2, scoreB: 2 },
  { teamA: "E", teamB: "F", scoreA: 3, scoreB: 1 },
  { teamA: "G", teamB: "H", scoreA: 0, scoreB: 1 },
  { teamA: "I", teamB: "J", scoreA: 4, scoreB: 3 },
  { teamA: "K", teamB: "L", scoreA: 2, scoreB: 2 },
];

const addMatches = async () => {
  try {
    for (const match of matches) {
      const createdMatch = await matchService.createOrUpdate(match);
      console.log(
        `Added match: ${createdMatch.teamA} vs ${createdMatch.teamB}, score: ${createdMatch.scoreA}-${createdMatch.scoreB}`
      );
    }
    console.log("All matches added successfully.");
  } catch (error) {
    console.error("Error adding matches:", error);
  }
};

addMatches();
