import { User } from '@/entities/user.entity';

type NonNullableKeys = 'profile';

export type LoggedUserType = {
  [P in keyof User]: P extends NonNullableKeys ? NonNullable<User[P]> : User[P];
};
