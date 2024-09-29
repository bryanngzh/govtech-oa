import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { Group } from "src/models/groupModel";
import { db } from "../configs/firebase";
import { Team } from "../models/teamModel";
export class TeamService {
  public async get(id: string): Promise<Team | null> {
    const teamSnapshot = await db.collection("teams").doc(id).get();
    if (!teamSnapshot.exists) {
      return null;
    }
    const teamData = teamSnapshot.data();
    let team: Team | null = null;
    if (teamData) {
      team = {
        id: teamData.id,
        name: teamData.name,
        regDate: teamData.regDate,
        group: teamData.group,
      };
    }
    return team;
  }

  public async createOrUpdate(team: Team): Promise<Team> {
    const teamRef = team.id
      ? db.collection("teams").doc(team.id)
      : db.collection("teams").doc();

    if (team.id) {
      const teamSnapshot = await teamRef.get();
      if (!teamSnapshot || (teamSnapshot && !teamSnapshot.exists)) {
        throw new Error(
          `Team with ID ${team.id} does not exist. Please provide a valid ID to update.`
        );
      }
    }

    const groupRef = db.collection("groups").doc(team.group);
    const groupSnapshot = await groupRef.get();

    if (groupSnapshot && groupSnapshot.exists) {
      const groupData = groupSnapshot.data();
      let currentCount: number = 0;
      if (groupData) {
        currentCount = groupData.count;
      }
      const newCount = currentCount + 1;
      await groupRef.update({ count: newCount });
    } else {
      const newGroupData: Group = { count: 1 };
      await groupRef.set(newGroupData);
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
    const teamSnapshot = await teamRef.get();

    if (!teamSnapshot.exists) {
      throw new Error(`Team with ID ${id} does not exist.`);
    }

    const teamData = teamSnapshot.data();
    let groupId = null;
    if (teamData) {
      groupId = teamData.group;
    }

    await teamRef.delete();

    if (groupId) {
      const groupRef = db.collection("groups").doc(groupId);
      const groupSnapshot = await groupRef.get();

      if (groupSnapshot.exists) {
        const groupData = groupSnapshot.data();
        let currentCount: number = 0;
        if (groupData) {
          currentCount = groupData.count;
        }
        const newCount = currentCount > 0 ? currentCount - 1 : 0;

        await groupRef.update({ count: newCount });

        if (newCount === 0) {
          await groupRef.delete();
        }
      }
    }
  }
}
