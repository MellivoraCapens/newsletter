import { IUserDTO } from "../../src/models/User";

export {};

declare global {
  namespace Express {
    interface Request {
      user: IUserDTO;
    }
  }
}
