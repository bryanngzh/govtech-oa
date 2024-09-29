import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../configs/firebase";
import { Team } from "../models/teamModel";

export class TeamService {
  public async get(id: string): Promise<Team | null> {
    const teamSnapshot = await db.collection("teams").doc(id).get();
    if (!teamSnapshot.exists) {
      return null;
    }
    const teamData = teamSnapshot.data();
    if (!teamData) {
      return null;
    }
    const team: Team = {
      id: teamData.id,
      name: teamData.name,
      regDate: teamData.regDate,
      group: teamData.group,
    };
    return team;
  }

  public async createOrUpdate(team: Team): Promise<Team> {
    const teamRef = team.id
      ? db.collection("teams").doc(team.id)
      : db.collection("teams").doc();

    if (team.id) {
      const teamSnapshot = await teamRef.get();
      if (!teamSnapshot.exists) {
        throw new Error(
          `Team with ID ${team.id} does not exist. Please provide a valid ID to update.`
        );
      }
    }

    await teamRef.set({
      name: team.name,
      regDate: team.regDate,
      group: team.group,
    });

    return { ...team, id: teamRef.id };
  }

  public async getAll(): Promise<Team[]> {
    const teamsSnapshot = await db.collection("teams").get();
    const teams: Team[] = [];

    teamsSnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const teamData = doc.data();
      teams.push({
        id: teamData.id,
        name: teamData.name,
        regDate: teamData.regDate,
        group: teamData.group,
      });
    });

    return teams;
  }

  public async delete(id: string): Promise<void> {
    const teamRef = db.collection("teams").doc(id);
    await teamRef.delete();
  }
}
