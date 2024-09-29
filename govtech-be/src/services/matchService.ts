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
    if (!matchData) {
      return null;
    }
    const match: Match = {
      id: matchData.id,
      teamA: matchData.teamA,
      teamB: matchData.teamB,
      scoreA: matchData.scoreA,
      scoreB: matchData.scoreB,
    };
    return match;
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

    return { ...match, id: matchRef.id };
  }

  public async getAll(): Promise<Match[]> {
    const matchesSnapshot = await db.collection("matches").get();
    const matches: Match[] = [];

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

    return matches;
  }

  public async delete(id: string): Promise<void> {
    const matchRef = db.collection("matches").doc(id);
    await matchRef.delete();
  }
}
