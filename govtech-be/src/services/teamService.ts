import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../configs/firebase";
import { Team } from "../models/teamModel";

/**
 * Service for managing team-related operations.
 */
export class TeamService {
  /**
   * Retrieve a team by its ID.
   * @param id - The ID of the team to retrieve.
   * @returns A promise that resolves to the retrieved team.
   * @throws Will throw an error if the team does not exist.
   */
  public async get(id: string): Promise<Team> {
    const teamSnapshot = await db.collection("teams").doc(id).get();

    if (!teamSnapshot.exists) {
      throw new Error(`Team with ID ${id} not found.`);
    }

    const teamData = teamSnapshot.data();
    if (!teamData) {
      throw new Error(`Team with ID ${id} has no data.`);
    }

    return {
      id: teamSnapshot.id,
      regDate: teamData.regDate,
      group: teamData.group,
    };
  }

  /**
   * Retrieve all teams.
   * @returns A promise that resolves to an array of teams.
   * @throws Will throw an error if no teams are found.
   */
  public async getAll(): Promise<Team[]> {
    const teamsSnapshot = await db.collection("teams").get();

    if (teamsSnapshot.empty) {
      throw new Error("No teams found.");
    }

    const teams: Team[] = await Promise.all(
      teamsSnapshot.docs.map(async (doc: QueryDocumentSnapshot) => {
        const teamData = doc.data();
        return {
          id: doc.id,
          regDate: teamData.regDate,
          group: teamData.group,
        };
      })
    );

    return teams;
  }

  /**
   * Create a new team with ID.
   * @param team - The team data to create.
   * @param id - ID for the team.
   * @returns A promise that resolves to the created team with the specified ID.
   * @throws Will throw an error if the team with the specified ID already exists.
   */
  public async create(id: string, team: Team): Promise<Team> {
    const teamRef = db.collection("teams").doc(id);

    const existingTeamSnapshot = await teamRef.get();
    if (existingTeamSnapshot.exists) {
      throw new Error(`Team with ID ${id} already exists.`);
    }

    await teamRef.set({
      regDate: team.regDate,
      group: team.group,
    });

    return { ...team, id: teamRef.id };
  }

  /**
   * Update an existing team.
   * @param id - The ID of the team to update.
   * @param team - The updated team data.
   * @returns A promise that resolves to the updated team.
   * @throws Will throw an error if the team does not exist.
   */
  public async update(id: string, team: Team): Promise<Team> {
    const teamRef = db.collection("teams").doc(id);
    const teamSnapshot = await teamRef.get();

    if (!teamSnapshot.exists) {
      throw new Error(`Team with ID ${id} not found.`);
    }

    await teamRef.update({
      regDate: team.regDate,
      group: team.group,
    });

    return { ...team, id };
  }

  /**
   * Delete a team by its ID.
   * @param id - The ID of the team to delete.
   * @returns A promise that resolves when the team is deleted.
   * @throws Will throw an error if the team does not exist.
   */
  public async delete(id: string): Promise<void> {
    const teamRef = db.collection("teams").doc(id);
    const teamSnapshot = await teamRef.get();

    if (!teamSnapshot.exists) {
      throw new Error(`Team with ID ${id} does not exist.`);
    }

    await teamRef.delete();
  }
}
