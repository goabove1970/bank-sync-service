import { CONFIG } from "@root/app.config";
import { AccountController } from "./account-controller";

const accountController: AccountController = new AccountController(
  CONFIG.ApiServiceConfig
);
export default accountController;
