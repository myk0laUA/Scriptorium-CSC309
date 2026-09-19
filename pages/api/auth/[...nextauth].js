import NextAuth from 'next-auth';
import { authOptions } from '../../../utils/oauth';

export default function handler(req, res) {
  return NextAuth(req, res, authOptions(req));
}
