import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { HashService } from 'src/auth/hash/hash.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const usernameExists = await this.findByUsername(createUserDto.username);
    if (usernameExists) {
      throw new ConflictException('Пользователь с таким именем уже существует');
    }

    const emailExists = await this.findByEmail(createUserDto.email);
    if (emailExists) {
      throw new ConflictException('Пользователь с такой почтой уже существует');
    }

    // Workaround for empty about string from frontend
    if (createUserDto.about === '') {
      delete createUserDto.about;
    }

    const user = this.usersRepository.create(createUserDto);
    user.password = await this.hashService.hashPassword(createUserDto.password);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findByEmailOrUsername(
    filter: Partial<Pick<User, 'username' | 'email'>>,
  ): Promise<User> {
    return await this.usersRepository.findOne({
      where: [{ email: filter.email }, { username: filter.username }],
    });
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
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (updateUserDto.password) {
      const hashedPassword = await this.hashService.hashPassword(
        updateUserDto.password,
      );
      updateUserDto.password = hashedPassword;
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const usernameExists = await this.findByUsername(updateUserDto.username);
      if (usernameExists && usernameExists.id !== id) {
        throw new ConflictException(
          'Пользователь с таким логином уже зарегистрирован',
        );
      }
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.findByEmail(updateUserDto.email);
      if (emailExists && emailExists.id !== id) {
        throw new ConflictException(
          'Пользователь с такой почтой уже зарегистрирован',
        );
      }
    }

    await this.usersRepository.update(id, updateUserDto);

    const updatedUser = await this.findById(id);
    delete updatedUser.password;

    return updatedUser;
  }

  async findMany(query: string): Promise<User[]> {
    return this.usersRepository.find({
      where: [{ username: Like(`%${query}%`) }, { email: Like(`%${query}%`) }],
    });
  }
}
