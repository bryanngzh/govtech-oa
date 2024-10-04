import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Route,
  SuccessResponse,
} from "tsoa";
import { User } from "../models/UserModel";
import { UserService } from "../services/UserService";

/**
 * Controller for managing user-related operations.
 */
@Route("users")
export class UserController extends Controller {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  /**
   * Retrieve a user by their email address.
   * @param email - User's email address
   * @returns The user associated with the provided email or null if not found
   */
  @Get()
  public async getUser(@Query() email: string): Promise<User | null> {
    return this.userService.get(email);
  }

  /**
   * Create a new user.
   * @param requestBody - User data
   * @returns The created user
   */
  @SuccessResponse("201", "Created")
  @Post()
  public async createUser(@Body() requestBody: User): Promise<User> {
    this.setStatus(201);
    return this.userService.create(requestBody);
  }
}
