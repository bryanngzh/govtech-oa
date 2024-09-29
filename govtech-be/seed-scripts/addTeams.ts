import { Team } from "../src/models/teamModel";
import { TeamService } from "../src/services/teamService";

const teamService = new TeamService();

const generateRegDate = (startDate: string, offsetMinutes: number): string => {
  const date = new Date(startDate);
  date.setMinutes(date.getMinutes() + offsetMinutes);
  return date.toISOString();
};

const baseRegDate = "2024-09-29T08:00:00Z";

const teams: Team[] = [
  { name: "A", regDate: generateRegDate(baseRegDate, 0), group: "1" },
  { name: "B", regDate: generateRegDate(baseRegDate, 5), group: "1" },
  { name: "C", regDate: generateRegDate(baseRegDate, 10), group: "1" },
  { name: "D", regDate: generateRegDate(baseRegDate, 15), group: "1" },
  { name: "E", regDate: generateRegDate(baseRegDate, 20), group: "1" },
  { name: "F", regDate: generateRegDate(baseRegDate, 25), group: "1" },
  { name: "G", regDate: generateRegDate(baseRegDate, 30), group: "2" },
  { name: "H", regDate: generateRegDate(baseRegDate, 35), group: "2" },
  { name: "I", regDate: generateRegDate(baseRegDate, 40), group: "2" },
  { name: "J", regDate: generateRegDate(baseRegDate, 45), group: "2" },
  { name: "K", regDate: generateRegDate(baseRegDate, 50), group: "2" },
  { name: "L", regDate: generateRegDate(baseRegDate, 55), group: "2" },
];

const addTeams = async () => {
  try {
    for (const team of teams) {
      const createdTeam = await teamService.createOrUpdate(team);
      console.log(
        `Added team: ${createdTeam.name} with regDate ${createdTeam.regDate} in group ${createdTeam.group}`
      );
    }
    console.log("All teams added successfully.");
  } catch (error) {
    console.error("Error adding teams:", error);
  }
};

addTeams();
