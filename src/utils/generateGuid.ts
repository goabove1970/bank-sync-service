import { Guid } from 'guid-typescript';

export const GuidEight = (): string => {
  return Guid.create()
    .toString()
    .replace('-', '')
    .substr(0, 8);
};

export const GuidNoDash = (): string => {
  return Guid.create()
    .toString()
    .replace('-', '');
};

export const GuidFull = (): string => {
  return Guid.create().toString();
};
