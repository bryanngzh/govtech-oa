import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../configs/firebase";
import { Team } from "../models/teamModel";

export class TeamService {
  public async get(id: string): Promise<Team | null> {
    const teamSnapshot = await db.collection("teams").doc(id).get();

    if (!teamSnapshot.exists) {
      throw new Error(`Team with ID ${id} not found.`);
    }

    const teamData = teamSnapshot.data();
    return teamData
      ? {
          id,
          name: teamData.name,
          regDate: teamData.regDate,
          group: teamData.group,
        }
      : null;
  }

  public async getAll(): Promise<Team[]> {
    const teamsSnapshot = await db.collection("teams").get();

    if (teamsSnapshot) {
      const teamsPromises = teamsSnapshot.docs.map(
        (doc: QueryDocumentSnapshot) => {
          const teamData = doc.data();
          return {
            id: doc.id,
            name: teamData.name,
            regDate: teamData.regDate,
            group: teamData.group,
          };
        }
      );

      return Promise.all(teamsPromises);
    } else {
      throw new Error("No teams found.");
    }
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
      const teamData = teamSnapshot.data();
      if (teamData && teamData.group != team.group) {
        const groupRef = db.collection("groups").doc(teamData.group);
        const groupSnapshot = await groupRef.get();
        if (groupSnapshot.exists) {
          let currentCount = 0;
          const groupData = groupSnapshot.data();
          if (groupData) {
            currentCount = groupData.count;
          }
          let newCount: number = 0;
          if (currentCount > 0) {
            newCount = currentCount - 1;
          }
          await Promise.all([
            groupRef.update({ count: newCount }),
            newCount === 0 ? groupRef.delete() : Promise.resolve(),
          ]);
        }
      }
    }

    const groupRef = db.collection("groups").doc(team.group);
    const groupSnapshot = await groupRef.get();
    let currentCount: number = 0;
    if (groupSnapshot.exists) {
      const groupData = groupSnapshot.data();
      if (groupData) {
        currentCount = groupData.count;
      }
    }

    const newCount = currentCount + 1;

    await Promise.all([
      groupSnapshot.exists
        ? groupRef.update({ count: newCount })
        : groupRef.set({ count: 1 }),
      teamRef.set({
        name: team.name,
        regDate: team.regDate,
        group: team.group,
      }),
    ]);

    return { ...team, id: teamRef.id };
  }

  public async delete(id: string): Promise<void> {
    const teamRef = db.collection("teams").doc(id);
    const teamSnapshot = await teamRef.get();

    if (!teamSnapshot.exists) {
      throw new Error(`Team with ID ${id} does not exist.`);
    }

    const teamData = teamSnapshot.data();
    let groupId: string | null = null;
    if (teamData) {
      groupId = teamData.group;
    }

    await teamRef.delete();

    if (groupId) {
      const groupRef = db.collection("groups").doc(groupId);
      const groupSnapshot = await groupRef.get();

      if (groupSnapshot.exists) {
        let currentCount = 0;
        const groupData = groupSnapshot.data();
        if (groupData) {
          currentCount = groupData.count;
        }
        let newCount: number = 0;
        if (currentCount > 0) {
          newCount = currentCount - 1;
        }
        await Promise.all([
          groupRef.update({ count: newCount }),
          newCount === 0 ? groupRef.delete() : Promise.resolve(),
        ]);
      }
    }
  }
}
