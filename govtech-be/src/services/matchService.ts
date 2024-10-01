import {
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from "firebase-admin/firestore";
import { Team } from "src/models/teamModel";
import { db } from "../configs/firebase";
import { Match, TeamStat } from "../models/matchModel";

export class MatchService {
  /** Helper Functions */
  private async validateTeams(
    teamAId: string,
    teamBId: string
  ): Promise<{ teamA: Team; teamB: Team }> {
    const teamARef = db.collection("teams").doc(teamAId);
    const teamBRef = db.collection("teams").doc(teamBId);

    const [teamADoc, teamBDoc] = await Promise.all([
      teamARef.get(),
      teamBRef.get(),
    ]);

    if (!teamADoc.exists || !teamBDoc.exists) {
      if (!teamADoc.exists) {
        throw new Error(`Team with ID ${teamAId} does not exist.`);
      }
      if (!teamBDoc.exists) {
        throw new Error(`Team with ID ${teamBId} does not exist.`);
      }
    }

    const teamA: Team = teamADoc.data() as Team;
    const teamB: Team = teamBDoc.data() as Team;

    if (teamA.group !== teamB.group) {
      throw new Error(
        `Teams ${teamAId} and ${teamBId} are not in the same group.`
      );
    }

    return { teamA, teamB };
  }

  private async getAllTeamsAndMatches(): Promise<[Team[], Match[]]> {
    const [teamsSnapshot, matchesSnapshot] = await Promise.all([
      db.collection("teams").get(),
      db.collection("matches").get(),
    ]);

    const teams: Team[] = teamsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Team, "id">),
    }));

    const matches: Match[] = matchesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Match, "id">),
    }));

    return [teams, matches];
  }

  private calculateTeamStats(team: Team, matches: Match[]): TeamStat {
    let totalMatches = 0;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let points = 0;
    let altPoints = 0;

    matches.forEach((match) => {
      if (match.teamA === team.id || match.teamB === team.id) {
        totalMatches++;
        const isTeamA = match.teamA === team.id;
        const teamScore = isTeamA ? match.scoreA : match.scoreB;
        const opponentScore = isTeamA ? match.scoreB : match.scoreA;

        if (teamScore === opponentScore) {
          draws++;
          points += 1;
          altPoints += 3;
        } else if (teamScore > opponentScore) {
          wins++;
          points += 3;
          altPoints += 5;
        } else {
          losses++;
          altPoints += 1;
        }
      }
    });

    return {
      id: team.id,
      group: team.group,
      regDate: team.regDate,
      totalMatches,
      wins,
      losses,
      draws,
      points,
      altPoints,
    };
  }

  /**
   * Fetches match details by ID from the "matches" collection.
   *
   * @param {string} id - The unique match ID.
   * @returns {Promise<Match>} Resolves with match details:
   * - `id` {string}
   * - `teamA` {string}
   * - `teamB` {string}
   * - `scoreA` {number}
   * - `scoreB` {number}
   *
   * @throws {Error} If the match is not found or has no data.
   */
  public async get(id: string): Promise<Match> {
    const matchSnapshot = await db.collection("matches").doc(id).get();
    if (!matchSnapshot.exists) {
      throw new Error(`Match with ID ${id} not found.`);
    }
    const matchData = matchSnapshot.data();
    if (!matchData) {
      throw new Error(`Match with ID ${id} has no data.`);
    }
    return {
      id: matchSnapshot.id,
      teamA: matchData.teamA,
      teamB: matchData.teamB,
      scoreA: matchData.scoreA,
      scoreB: matchData.scoreB,
    };
  }

  /**
   * Retrieves all match details from the "matches" collection.
   *
   * @returns {Promise<Match[]>} Resolves with an array of match details:
   * - `id` {string}
   * - `teamA` {string}
   * - `teamB` {string}
   * - `scoreA` {number}
   * - `scoreB` {number}
   *
   * @throws {Error} If no matches are found.
   */
  public async getAll(): Promise<Match[]> {
    const matchesSnapshot = await db.collection("matches").get();

    if (matchesSnapshot.empty) {
      throw new Error("No matches found.");
    }

    const matches: Match[] = await Promise.all(
      matchesSnapshot.docs.map(async (doc: QueryDocumentSnapshot) => {
        const matchData = doc.data();
        return {
          id: doc.id,
          teamA: matchData.teamA,
          teamB: matchData.teamB,
          scoreA: matchData.scoreA,
          scoreB: matchData.scoreB,
        };
      })
    );

    return matches;
  }

  /**
   * Fetches match details by team ID from the "matches" collection.
   *
   * @param {string} teamId - The unique team ID.
   * @returns {Promise<Match[]>} Resolves with an array of match details:
   * - `id` {string}
   * - `teamA` {string}
   * - `teamB` {string}
   * - `scoreA` {number}
   * - `scoreB` {number}
   *
   * @throws {Error} If no matches are found for the specified team ID.
   */
  public async getMatchesByTeamId(teamId: string): Promise<Match[]> {
    const [matchesA, matchesB] = await Promise.all([
      db.collection("matches").where("teamA", "==", teamId).get(),
      db.collection("matches").where("teamB", "==", teamId).get(),
    ]);

    const processMatches = async (
      matchSnapshots: QuerySnapshot<DocumentData>
    ) => {
      return Promise.all(
        matchSnapshots.docs.map(async (matchSnapshot) => {
          const matchData = matchSnapshot.data();
          return {
            id: matchSnapshot.id,
            teamA: matchData.teamA,
            teamB: matchData.teamB,
            scoreA: matchData.scoreA,
            scoreB: matchData.scoreB,
          };
        })
      );
    };

    const [processedMatchesA, processedMatchesB] = await Promise.all([
      processMatches(matchesA),
      processMatches(matchesB),
    ]);

    const matches = [...processedMatchesA, ...processedMatchesB];

    if (matches.length === 0) {
      throw new Error(`No matches found for team with ID ${teamId}.`);
    }

    return matches;
  }

  /**
   * Creates a new match in the "matches" collection.
   *
   * @param {Match} match - The match object containing details to be added:
   * - `teamA` {string} - Name of team A (must be a valid team ID).
   * - `teamB` {string} - Name of team B (must be a valid team ID).
   * - `scoreA` {number} - Score of team A (must be a number).
   * - `scoreB` {number} - Score of team B (must be a number).
   *
   * @returns {Promise<Match>} Resolves with the created match details, including the ID.
   *
   * @throws {Error} If teamA or teamB are not valid team IDs.
   * @throws {Error} If scoreA or scoreB are not numbers.
   * @throws {Error} If teamA and teamB are not in the same group.
   */
  public async create(match: Match): Promise<Match> {
    if (typeof match.scoreA !== "number" || typeof match.scoreB !== "number") {
      throw new Error("Scores must be numbers.");
    }

    await this.validateTeams(match.teamA, match.teamB);

    const matchRef = db.collection("matches").doc();

    await matchRef.set({
      teamA: match.teamA,
      teamB: match.teamB,
      scoreA: match.scoreA,
      scoreB: match.scoreB,
    });

    return { ...match, id: matchRef.id };
  }

  /**
   * Updates an existing match in the "matches" collection.
   *
   * @param {string} id - The id of the match.
   * @param {Match} match - The match object containing details to be updated:
   * - `id` {string} - The unique match ID. Required for updates.
   * - `teamA` {string} - Name of team A (must be a valid team ID).
   * - `teamB` {string} - Name of team B (must be a valid team ID).
   * - `scoreA` {number} - Score of team A (must be a number).
   * - `scoreB` {number} - Score of team B (must be a number).
   *
   * @returns {Promise<Match>} Resolves with the updated match details.
   *
   * @throws {Error} If the match ID is invalid or the match does not exist.
   * @throws {Error} If teamA or teamB are not valid team IDs.
   * @throws {Error} If scoreA or scoreB are not numbers.
   * @throws {Error} If teamA and teamB are not in the same group.
   */
  public async update(id: string, match: Match): Promise<Match> {
    if (!id) {
      throw new Error("Match ID is required for updates.");
    }

    if (typeof match.scoreA !== "number" || typeof match.scoreB !== "number") {
      throw new Error("Scores must be numbers.");
    }

    await this.validateTeams(match.teamA, match.teamB);

    const matchRef = db.collection("matches").doc(id);
    const matchSnapshot = await matchRef.get();
    if (!matchSnapshot.exists) {
      throw new Error(
        `Match with ID ${id} does not exist. Please provide a valid ID to update.`
      );
    }

    await matchRef.set({
      teamA: match.teamA,
      teamB: match.teamB,
      scoreA: match.scoreA,
      scoreB: match.scoreB,
    });

    return { ...match, id: matchRef.id || id };
  }

  /**
   * Deletes a match from the "matches" collection based on the provided match ID.
   *
   * This method checks if the match exists before attempting to delete it.
   *
   * @param {string} id - The unique identifier of the match to delete.
   * @returns {Promise<void>} A promise that resolves when the match has been successfully deleted.
   *
   * @throws {Error} If the match with the specified ID does not exist.
   */
  public async delete(id: string): Promise<void> {
    const matchRef = db.collection("matches").doc(id);

    const matchSnapshot = await matchRef.get();

    if (!matchSnapshot.exists) {
      throw new Error(`Match with ID ${id} does not exist. Cannot delete.`);
    }

    await matchRef.delete();
  }

  /**
   * Retrieves match statistics for a specific team based on their ID,
   * along with the team’s group and registration date.
   *
   * This function calculates the total number of matches played, wins, losses, and draws
   * for the specified team by querying the "matches" collection and the "teams" collection.
   *
   * @param {string} teamId - The unique identifier of the team for which statistics are requested.
   * @returns {Promise<TeamStat | null>} A promise that resolves to an object containing the team's statistics:
   * - `id` {string} - The ID of the team.
   * - `totalMatches` {number} - The total number of matches played.
   * - `wins` {number} - The number of matches won.
   * - `losses` {number} - The number of matches lost.
   * - `draws` {number} - The number of matches drawn.
   * - `group` {string} - The group the team belongs to.
   * - `regDate` {Date} - The registration date of the team.
   */
  public async getTeamStats(teamId: string): Promise<TeamStat | null> {
    const [teamDoc, matchSnapshotA, matchSnapshotB] = await Promise.all([
      db.collection("teams").doc(teamId).get(),
      db.collection("matches").where("teamA", "==", teamId).get(),
      db.collection("matches").where("teamB", "==", teamId).get(),
    ]);

    if (!teamDoc.exists || !teamDoc.data()) {
      throw new Error(`Team with ID ${teamId} does not exist or has no data.`);
    }

    const { group, regDate } = teamDoc.data() as Team;
    const team: Team = { id: teamId, group, regDate };

    const matches = [...matchSnapshotA.docs, ...matchSnapshotB.docs].map(
      (doc) => doc.data() as Match
    );

    return this.calculateTeamStats(team, matches);
  }

  /**
   * Retrieves statistics for all teams based on their matches,
   * grouped by their respective groups.
   *
   * @returns {Promise<{ [group: string]: TeamStat[] }>} A promise that resolves to an object
   * where keys are group identifiers and values are arrays of team statistics for those groups.
   * Each statistic includes:
   * - `id` {string} - The ID of the team.
   * - `totalMatches` {number} - The total number of matches played.
   * - `wins` {number} - The number of matches won.
   * - `losses` {number} - The number of matches lost.
   * - `draws` {number} - The number of matches drawn.
   * - `group` {string} - The group the team belongs to.
   * - `regDate` {Date} - The registration date of the team.
   * - `points` {number} - The total points based on match results.
   * - `altPoints` {number} - The alternate points based on match results.
   */
  public async getAllTeamStats(): Promise<{ [group: string]: TeamStat[] }> {
    const [teams, matches] = await this.getAllTeamsAndMatches();

    const teamStats = teams.map((team) =>
      this.calculateTeamStats(team, matches)
    );

    return teamStats.reduce((groupedStats, stat) => {
      const { group } = stat;
      if (!groupedStats[group]) {
        groupedStats[group] = [];
      }
      groupedStats[group].push(stat);
      return groupedStats;
    }, {} as { [group: string]: TeamStat[] });
  }
}
