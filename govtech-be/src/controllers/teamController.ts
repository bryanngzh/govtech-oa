import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Route,
  SuccessResponse,
} from "tsoa";
import { Team } from "../models/teamModel";
import { TeamService } from "../services/teamService";

/**
 * Controller for managing team-related operations.
 */
@Route("teams")
export class TeamController extends Controller {
  private teamService: TeamService;

  constructor() {
    super();
    this.teamService = new TeamService();
  }

  /**
   * Retrieve a single team by ID or all teams.
   * @param id - Optional team ID
   * @returns A single team or an array of all teams
   */
  @Get()
  public async getTeam(@Query() id?: string): Promise<Team | Team[]> {
    return id ? this.teamService.get(id) : this.teamService.getAll();
  }

  /**
   * Create a new team.
   * @param requestBody - Team data
   * @returns The created team
   */
  @SuccessResponse("201", "Created")
  @Post()
  public async createTeam(
    @Query() id: string,
    @Body() requestBody: Team
  ): Promise<Team> {
    this.setStatus(201);
    return this.teamService.create(id, requestBody);
  }

  /**
   * Update an existing team.
   * @param id - Team ID
   * @param requestBody - Updated team data
   * @returns The updated team
   */
  @SuccessResponse("200", "Updated")
  @Put()
  public async updateTeam(
    @Query() id: string,
    @Body() requestBody: Team
  ): Promise<Team> {
    return await this.teamService.update(id, requestBody);
  }

  /**
   * Delete a team.
   * @param id - Team ID
   */
  @SuccessResponse("204", "Deleted")
  @Delete()
  public async deleteTeam(@Query() id: string): Promise<void> {
    await this.teamService.delete(id);
    this.setStatus(204);
  }
}
