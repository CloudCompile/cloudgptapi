// Small wrapper to normalize jwt-decode import shape (CJS vs ESM)
import * as jwtLib from 'jwt-decode';

type JwtFn = (token: string) => any;

const jwtDecode: JwtFn = (jwtLib as any)?.default && typeof (jwtLib as any).default === 'function'
  ? (jwtLib as any).default
  : (typeof jwtLib === 'function' ? (jwtLib as any) : (jwtLib as any).jwtDecode || ((jwtLib as any) as JwtFn));

export default function decode<T = any>(token: string): T {
  return (jwtDecode as any)(token) as T;
}
