import { Match } from "../src/models/matchModel";
import { MatchService } from "../src/services/matchService";

const matchService = new MatchService();

const matches: Match[] = [
  {
    teamA: "DJKeHm1SeNDma4mzkrm8",
    teamB: "a543FapM24vTmkubqM69",
    scoreA: 1,
    scoreB: 0,
  },
  {
    teamA: "7L6VcpVAQDqRGf4g9WKq",
    teamB: "6V33dhBK5Tywu98UxRtk",
    scoreA: 2,
    scoreB: 2,
  },
  {
    teamA: "GGtjT1hgl00armP87Ijv",
    teamB: "VrqXQM0HYlqlzpOwRMtw",
    scoreA: 3,
    scoreB: 1,
  },
  {
    teamA: "eli7bIjGZS6T7HLdm5lQ",
    teamB: "rIV4gvqefDj9x5Lpl9a6",
    scoreA: 0,
    scoreB: 1,
  },
  {
    teamA: "jJFfg5mHKSvRdRbiZWev",
    teamB: "WiBMNY49Y13oG5vTBBtx",
    scoreA: 4,
    scoreB: 3,
  },
  {
    teamA: "5YXEjDi2LF7O1yIWYbuF",
    teamB: "53HGSPzV0bMSi6lfdv6m",
    scoreA: 2,
    scoreB: 2,
  },
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
