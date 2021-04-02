import { Guid } from 'guid-typescript';

export const GuidNoDash = (): string => {
  return Guid.create()
    .toString()
    .replace('-', '');
};

export const GuidFull = (): string => {
  return Guid.create().toString();
};
