import { UserStatus } from './UserStatus';
export interface UserDetails {
    userId: string;
    firstName: string;
    lastName: string;
    ssn: number;
    login: string;
    password: string;
    email: string;
    dob: Date;
    lastLogin?: Date;
    accountCreated: Date;
    serviceComment?: string;
    status?: UserStatus;
}
