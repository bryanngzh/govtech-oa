import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { Team } from "src/models/teamModel";
import { db } from "../configs/firebase";
import { Match, TeamStat } from "../models/matchModel";

export class MatchService {
  public async get(id: string): Promise<Match> {
    const matchSnapshot = await db.collection("matches").doc(id).get();
    if (!matchSnapshot.exists) {
      throw new Error(`Match with ID ${id} not found.`);
    }
    const matchData = matchSnapshot.data();
    if (matchData) {
      return {
        id: matchSnapshot.id,
        teamA: matchData.teamA,
        teamB: matchData.teamB,
        scoreA: matchData.scoreA,
        scoreB: matchData.scoreB,
      };
    }
    throw new Error(`Match with ID ${id} has no data.`);
  }

  public async getAllTeamStats(): Promise<TeamStat[] | null> {
    const teamsSnapshot = await db.collection("teams").get();
    const teams: Team[] = [];

    if (teamsSnapshot) {
      teamsSnapshot.forEach((doc: QueryDocumentSnapshot) => {
        const teamData = doc.data();
        teams.push({
          id: doc.id,
          name: teamData.name,
          regDate: teamData.regDate,
          group: teamData.group,
        });
      });
    }

    const teamStatsPromises = teams.map((team) =>
      this.getTeamStats(team.id as string)
    );
    const teamStats = await Promise.all(teamStatsPromises);

    return teamStats.filter((stat) => stat !== null) as TeamStat[];
  }

  public async getTeamStats(teamId: string): Promise<TeamStat | null> {
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

    const processMatch = (matchData: any, isTeamA: boolean) => {
      totalMatches++;
      const { scoreA, scoreB } = matchData;

      if (scoreA === scoreB) {
        draws++;
      } else if (isTeamA && scoreA > scoreB) {
        wins++;
      } else if (!isTeamA && scoreB > scoreA) {
        wins++;
      } else {
        losses++;
      }
    };

    if (matchSnapshotA) {
      matchSnapshotA.docs.forEach((doc) => {
        const matchData = doc.data();
        processMatch(matchData, true);
      });
    }

    if (matchSnapshotB) {
      matchSnapshotB.docs.forEach((doc) => {
        const matchData = doc.data();
        processMatch(matchData, false);
      });
    }

    return {
      id: teamId,
      totalMatches,
      wins,
      losses,
      draws,
    };
  }

  public async createOrUpdate(match: Match): Promise<Match> {
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

  public async getAll(): Promise<Match[]> {
    const matchesSnapshot = await db.collection("matches").get();
    const matches: Match[] = [];

    if (matchesSnapshot) {
      matchesSnapshot.forEach((doc: QueryDocumentSnapshot) => {
        const matchData = doc.data();
        matches.push({
          id: doc.id,
          teamA: matchData.teamA,
          teamB: matchData.teamB,
          scoreA: matchData.scoreA,
          scoreB: matchData.scoreB,
        });
      });
    }

    if (matches.length === 0) {
      throw new Error("No matches found.");
    }

    return matches;
  }

  public async delete(id: string): Promise<void> {
    const matchRef = db.collection("matches").doc(id);
    const matchSnapshot = await matchRef.get();

    if (!matchSnapshot.exists) {
      throw new Error(`Match with ID ${id} does not exist. Cannot delete.`);
    }

    await matchRef.delete();
  }
}
