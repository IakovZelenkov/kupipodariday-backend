import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly saltRounds = 10;

  async hashPassword(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    const hash = await bcrypt.hash(data, salt);
    return hash;
  }

  async checkPassword(data: string, hash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(data, hash);
    return isMatch;
  }
}
