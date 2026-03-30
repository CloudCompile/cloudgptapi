// Small wrapper to normalize jwt-decode import shape (CJS vs ESM)
import { jwtDecode } from 'jwt-decode';

export default function decode<T = any>(token: string): T {
  return jwtDecode(token) as unknown as T;
}
