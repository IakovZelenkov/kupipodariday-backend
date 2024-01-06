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

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
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

    if (wish.raised > 0) {
      throw new ForbiddenException(
        'Нельзя менять стоимость подарка, уже есть желающие скинуться',
      );
    }

    await this.wishesRepository.update({ id }, updateWishDto);
  }

  async removeOne(id: number, userId: number): Promise<void> {
    const wish = await this.findById(id);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете удалять чужие подарки');
    }
    await this.wishesRepository.delete({ id });
  }

  async getLastWIshes(): Promise<Wish[]> {
    const lastWishes = await this.wishesRepository.find({
      order: { id: 'DESC' },
      take: 40,
    });

    return lastWishes;
  }

  async getTopWishes(): Promise<Wish[]> {
    const topWishes = await this.wishesRepository.find({
      order: { copied: 'DESC' },
      take: 10,
    });

    return topWishes;
  }

  async findManyByUserId(userId: number): Promise<Wish[]> {
    const wishes = await this.wishesRepository.find({
      where: { owner: { id: userId } },
    });

    return wishes;
  }

  async findManyByUsername(username: string): Promise<Wish[]> {
    const wishes = await this.wishesRepository.find({
      where: { owner: { username } },
    });

    return wishes;
  }
}
