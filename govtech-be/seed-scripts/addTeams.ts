import { Team } from "../src/models/TeamModel";
import { TeamService } from "../src/services/TeamService";

const teamService = new TeamService();

const generateRegDate = (startDate: string, offsetMinutes: number): string => {
  const date = new Date(startDate);
  date.setMinutes(date.getMinutes() + offsetMinutes);
  return date.toISOString();
};

const baseRegDate = "2024-09-29T08:00:00Z";

const teams: Team[] = [
  { id: "A", regDate: generateRegDate(baseRegDate, 0), group: "1" },
  { id: "B", regDate: generateRegDate(baseRegDate, 5), group: "1" },
  { id: "C", regDate: generateRegDate(baseRegDate, 10), group: "1" },
  { id: "D", regDate: generateRegDate(baseRegDate, 15), group: "1" },
  { id: "E", regDate: generateRegDate(baseRegDate, 20), group: "1" },
  { id: "F", regDate: generateRegDate(baseRegDate, 25), group: "1" },
  { id: "G", regDate: generateRegDate(baseRegDate, 30), group: "2" },
  { id: "H", regDate: generateRegDate(baseRegDate, 35), group: "2" },
  { id: "I", regDate: generateRegDate(baseRegDate, 40), group: "2" },
  { id: "J", regDate: generateRegDate(baseRegDate, 45), group: "2" },
  { id: "K", regDate: generateRegDate(baseRegDate, 50), group: "2" },
  { id: "L", regDate: generateRegDate(baseRegDate, 55), group: "2" },
];

const addTeams = async () => {
  try {
    for (const team of teams) {
      const createdTeam = await teamService.createOrUpdate(team);
      console.log(
        `Added team: ${createdTeam.id} with regDate ${createdTeam.regDate} in group ${createdTeam.group}`
      );
    }
    console.log("All teams added successfully.");
  } catch (error) {
    console.error("Error adding teams:", error);
  }
};

addTeams();
