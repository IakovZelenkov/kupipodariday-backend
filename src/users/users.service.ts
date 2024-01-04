import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const usernameExists = await this.findByUsername(createUserDto.username);
    if (usernameExists) {
      throw new ForbiddenException(
        'Пользователь с таким именем уже существует',
      );
    }

    const emailExists = await this.findByEmail(createUserDto.email);
    if (emailExists) {
      throw new ForbiddenException(
        'Пользователь с такой почтой уже существует',
      );
    }

    const user = this.usersRepository.create(createUserDto);
    // user.password = await hash(user.password, 10);
    return await this.usersRepository.save(user);
  }

  async findByUsername(username: string): Promise<User> {
    return await this.usersRepository.findOneBy({ username });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOneBy({ email });
  }

  async findById(id: number): Promise<User> {
    return await this.usersRepository.findOneBy({ id });
  }

  async removeOne(id: number): Promise<void> {
    await this.usersRepository.delete({ id });
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // TODO check for password

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const username = await this.findByUsername(updateUserDto.username);
      if (username && username.id !== id) {
        throw new ForbiddenException(
          'Пользователь с таким логином уже зарегистрирован',
        );
      }
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const email = await this.findByEmail(updateUserDto.email);
      if (email && email.id !== id) {
        throw new ForbiddenException(
          'Пользователь с такой почтой уже зарегистрирован',
        );
      }
    }

    const result = await this.usersRepository.update({ id }, updateUserDto);
    if (result.affected === 0) {
      throw new NotFoundException('Пользователь не найден');
    }

    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new NotFoundException('Пользователь не найден');
    }
    delete updatedUser.password;

    return updatedUser;
  }
}
