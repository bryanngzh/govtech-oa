import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { Team } from "src/models/teamModel";
import { db } from "../configs/firebase";
import { Match, TeamStat } from "../models/matchModel";

export class MatchService {
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

    const matches: Match[] = matchesSnapshot.docs.map(
      (doc: QueryDocumentSnapshot) => {
        const matchData = doc.data();
        return {
          id: doc.id,
          teamA: matchData.teamA,
          teamB: matchData.teamB,
          scoreA: matchData.scoreA,
          scoreB: matchData.scoreB,
        };
      }
    );

    return matches;
  }

  /**
   * Adds a new match or updates an existing match in the "matches" collection.
   *
   * If a match ID is provided, it updates the existing match.
   * If no ID is provided, it creates a new match.
   *
   * @param {Match} match - The match object containing details to be added or updated:
   * - `id` {string} (optional) - The unique match ID. Required for updates.
   * - `teamA` {string} - Name of team A (must be a valid team ID).
   * - `teamB` {string} - Name of team B (must be a valid team ID).
   * - `scoreA` {number} - Score of team A (must be a number).
   * - `scoreB` {number} - Score of team B (must be a number).
   *
   * @returns {Promise<Match>} Resolves with the added or updated match details, including the ID.
   *
   * @throws {Error} If an ID is provided but the match does not exist.
   * @throws {Error} If teamA or teamB are not valid team IDs.
   * @throws {Error} If scoreA or scoreB are not numbers.
   */
  public async createOrUpdate(match: Match): Promise<Match> {
    // Validate scores type
    if (typeof match.scoreA !== "number" || typeof match.scoreB !== "number") {
      throw new Error("Scores must be numbers.");
    }

    // Validate team IDs
    const teamARef = db.collection("teams").doc(match.teamA);
    const teamBRef = db.collection("teams").doc(match.teamB);

    const [teamADoc, teamBDoc] = await Promise.all([
      teamARef.get(),
      teamBRef.get(),
    ]);

    if (!teamADoc.exists) {
      throw new Error(`Team A with ID ${match.teamA} does not exist.`);
    }

    if (!teamBDoc.exists) {
      throw new Error(`Team B with ID ${match.teamB} does not exist.`);
    }

    const matchRef = match.id
      ? db.collection("matches").doc(match.id)
      : db.collection("matches").doc();

    if (match.id) {
      const matchSnapshot = await matchRef.get();
      if (!matchSnapshot.exists) {
        throw new Error(
          `Match with ID ${match.id} does not exist. Please provide a valid ID to update.`
        );
      }
    }

    await matchRef.set({
      teamA: match.teamA,
      teamB: match.teamB,
      scoreA: match.scoreA,
      scoreB: match.scoreB,
    });

    return { ...match, id: matchRef.id ?? match.id };
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
    const teamDoc = await db.collection("teams").doc(teamId).get();

    if (!teamDoc.exists) {
      throw new Error(`Team with ID ${teamId} does not exist.`);
    }

    const teamData = teamDoc.data();
    const group = teamData?.group;
    const regDate = teamData?.regDate;

    const matchSnapshotA = await db
      .collection("matches")
      .where("teamA", "==", teamId)
      .get();
    const matchSnapshotB = await db
      .collection("matches")
      .where("teamB", "==", teamId)
      .get();

    let totalMatches = 0;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let points = 0;
    let altPoints = 0;

    const processMatch = (matchData: any, isTeamA: boolean) => {
      totalMatches++;
      const { scoreA, scoreB } = matchData;

      if (scoreA === scoreB) {
        draws++;
        points += 1;
        altPoints += 3;
      } else if (isTeamA && scoreA > scoreB) {
        wins++;
        points += 3;
        altPoints += 5;
      } else if (!isTeamA && scoreB > scoreA) {
        wins++;
        points += 3;
        altPoints += 5;
      } else {
        losses++;
        altPoints += 1;
      }
    };

    matchSnapshotA.docs.forEach((doc) => {
      const matchData = doc.data();
      processMatch(matchData, true);
    });

    matchSnapshotB.docs.forEach((doc) => {
      const matchData = doc.data();
      processMatch(matchData, false);
    });

    return {
      id: teamId,
      group,
      regDate,
      totalMatches,
      wins,
      losses,
      draws,
      points,
      altPoints,
    };
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
    const teamsSnapshot = await db.collection("teams").get();

    const teams: Team[] = [];

    teamsSnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const teamData = doc.data();
      teams.push({
        id: doc.id,
        regDate: teamData.regDate,
        group: teamData.group,
      });
    });

    const teamStatsPromises = teams.map((team) =>
      this.getTeamStats(team.id as string)
    );

    const teamStats: TeamStat[] = (await Promise.all(
      teamStatsPromises
    )) as TeamStat[];

    // Group team statistics by their respective groups
    const groupedStats: { [group: string]: TeamStat[] } = {};

    teamStats.forEach((stat) => {
      if (stat) {
        const group = stat.group;
        if (!groupedStats[group]) {
          groupedStats[group] = [];
        }
        groupedStats[group].push(stat);
      }
    });

    return groupedStats;
  }
}
