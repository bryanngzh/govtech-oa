import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../configs/firebase";
import { Match } from "../models/matchModel";

export class MatchService {
  public async get(id: string): Promise<Match | null> {
    const matchSnapshot = await db.collection("matches").doc(id).get();
    if (!matchSnapshot.exists) {
      return null;
    }
    const matchData = matchSnapshot.data();
    let match: Match | null = null;
    if (matchData) {
      match = {
        id: matchData.id,
        teamA: matchData.teamA,
        teamB: matchData.teamB,
        scoreA: matchData.scoreA,
        scoreB: matchData.scoreB,
      };
    }
    return match;
  }

  public async getTeamStats(teamId: string): Promise<{
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
  } | null> {
    const matchSnapshot = await db
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
    if (matchSnapshot) {
      matchSnapshot.forEach((doc) => {
        const matchData = doc.data();
        processMatch(matchData, true);
      });
    }

    if (matchSnapshotB) {
      matchSnapshotB.forEach((doc) => {
        const matchData = doc.data();
        processMatch(matchData, false);
      });
    }

    return {
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

    return matches;
  }

  public async delete(id: string): Promise<void> {
    const matchRef = db.collection("matches").doc(id);
    await matchRef.delete();
  }
}
