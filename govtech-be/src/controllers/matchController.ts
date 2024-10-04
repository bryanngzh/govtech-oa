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
import { Match, TeamStat } from "../models/MatchModel";
import { MatchService } from "../services/MatchService";

/**
 * Controller for managing match-related operations.
 */
@Route("matches")
export class MatchController extends Controller {
  private matchService: MatchService;

  constructor() {
    super();
    this.matchService = new MatchService();
  }

  /**
   * Retrieve a single match by ID or all matches.
   * @param id - Optional match ID
   * @returns A single match, an array of all matches, or null if not found
   */
  @Get()
  public async getMatch(@Query() id?: string): Promise<Match | Match[] | null> {
    return id ? this.matchService.get(id) : this.matchService.getAll();
  }

  /**
   * Get matches for a specific team.
   * @param teamId - Team ID
   * @returns An array of matches for the specified team
   */
  @Get("by-team")
  public async getMatchesByTeamId(@Query() teamId: string): Promise<Match[]> {
    if (!teamId) {
      throw new Error("Team ID is required.");
    }
    return this.matchService.getMatchesByTeamId(teamId);
  }

  /**
   * Create a new match.
   * @param requestBody - Match data
   * @returns The created match
   */
  @SuccessResponse("201", "Created")
  @Post()
  public async createMatch(@Body() requestBody: Match): Promise<Match> {
    this.setStatus(201);
    return this.matchService.create(requestBody);
  }

  /**
   * Update an existing match.
   * @param id - Match ID
   * @param requestBody - Updated match data
   * @returns The updated match
   */
  @SuccessResponse("200", "Updated")
  @Put()
  public async updateMatch(
    @Query() id: string,
    @Body() requestBody: Match
  ): Promise<Match> {
    return this.matchService.update(id, requestBody);
  }

  /**
   * Delete a match.
   * @param id - Match ID
   */
  @SuccessResponse("204", "Deleted")
  @Delete()
  public async deleteMatch(@Query() id: string): Promise<void> {
    await this.matchService.delete(id);
    this.setStatus(204);
  }

  /**
   * Get team stats for a specific team or all teams grouped.
   * @param teamId - Optional team ID
   * @returns Team stats for a specific team or grouped stats for all teams
   */
  @Get("team-stats")
  public async getTeamStats(
    @Query() teamId?: string
  ): Promise<TeamStat | { [group: string]: TeamStat[] } | null> {
    return teamId
      ? this.matchService.getTeamStats(teamId)
      : this.matchService.getAllTeamStats();
  }
}
