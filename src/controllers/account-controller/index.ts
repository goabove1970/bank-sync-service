import { getConfig } from "@root/app.config";
import { AccountController } from "./account-controller";

const accountController: AccountController = new AccountController(
  getConfig().ApiServiceConfig
);
export default accountController;
