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
import { Team } from "../models/teamModel";
import { TeamService } from "../services/teamService";

@Route("teams")
export class TeamController extends Controller {
  private teamService = new TeamService();

  @Get()
  public async getTeam(@Query() id?: string): Promise<Team | Team[] | null> {
    if (id) {
      return this.teamService.get(id);
    } else {
      return this.teamService.getAll();
    }
  }

  @SuccessResponse("201", "Created")
  @Post()
  public async createOrUpdateTeam(@Body() requestBody: Team): Promise<Team> {
    this.setStatus(201);
    return this.teamService.createOrUpdate(requestBody);
  }

  @SuccessResponse("204", "Deleted")
  @Delete()
  public async deleteTeam(@Query("id") id: string): Promise<void> {
    await this.teamService.delete(id);
    this.setStatus(204);
  }
}
