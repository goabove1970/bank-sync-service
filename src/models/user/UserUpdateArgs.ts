import { UserCreateArgs } from './UserCreateArgs';
export interface UserUpdateArgs extends UserCreateArgs {
  forceUpdate?: boolean;
  userId: string;
  status?: number;
}
