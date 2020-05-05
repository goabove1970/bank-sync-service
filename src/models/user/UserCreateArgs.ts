export interface UserCreateArgs {
  firstName: string;
  lastName: string;
  ssn: number;
  login: string;
  password: string;
  email: string;
  dob: Date;
  lastLogin: Date;
  accountCreated: Date;
}
