import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
    private readonly usersService: UsersService,
  ) {}

  async create(owner: User, createWishDto: CreateWishDto): Promise<Wish> {
    const wish = this.wishesRepository.create(createWishDto);
    wish.owner = owner;
    return this.wishesRepository.save(wish);
  }

  async findAll(): Promise<Wish[]> {
    return await this.wishesRepository.find();
  }

  async findManyById(arrayOfIds: number[]): Promise<Wish[]> {
    return this.wishesRepository.findBy({ id: In(arrayOfIds) });
  }

  async findById(id: number): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: { offers: true, owner: true },
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    return wish;
  }

  async update(
    id: number,
    updateWishDto: UpdateWishDto,
    userId: number,
  ): Promise<void> {
    const wish = await this.findById(id);
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужие подарки');
    }
    // TODO Check for raised and price
    await this.wishesRepository.update({ id }, updateWishDto);
  }

  async removeOne(id: number, userId: number): Promise<void> {
    const wish = await this.findById(id);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете удалять чужие подарки');
    }
    await this.wishesRepository.delete({ id });
  }

  // TODO Wish Copying, Last Wishes
}
