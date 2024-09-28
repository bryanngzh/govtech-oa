import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Route,
  SuccessResponse,
} from "tsoa";
import { User } from "../models/userModel";
import { UserService } from "../services/userService";

@Route("users")
export class UsersController extends Controller {
  @Get()
  public async getUser(@Query() email: string): Promise<User | null> {
    const userService = new UserService();
    return userService.get(email);
  }

  @SuccessResponse("201", "Created")
  @Post()
  public async createUser(@Body() requestBody: User): Promise<User> {
    const userService = new UserService();
    this.setStatus(201);
    return userService.create(requestBody);
  }
}
