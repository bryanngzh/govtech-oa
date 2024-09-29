import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Route,
  SuccessResponse,
} from "tsoa";
import { Match } from "../models/matchModel";
import { MatchService } from "../services/matchService";

@Route("matches")
export class MatchController extends Controller {
  private matchService = new MatchService();

  @Get()
  public async getMatch(@Query() id?: string): Promise<Match | Match[] | null> {
    if (id) {
      return this.matchService.get(id);
    } else {
      return this.matchService.getAll();
    }
  }

  @Get("team-stats")
  public async getTeamStats(@Query("teamId") teamId?: string): Promise<{
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
  } | null> {
    if (teamId) {
      return this.matchService.getTeamStats(teamId);
    } else {
      return null;
    }
  }

  @SuccessResponse("201", "Created")
  @Post()
  public async createOrUpdateMatch(@Body() requestBody: Match): Promise<Match> {
    this.setStatus(201);
    return this.matchService.createOrUpdate(requestBody);
  }

  @SuccessResponse("204", "Deleted")
  @Delete()
  public async deleteMatch(@Query("id") id: string): Promise<void> {
    await this.matchService.delete(id);
    this.setStatus(204);
  }
}
