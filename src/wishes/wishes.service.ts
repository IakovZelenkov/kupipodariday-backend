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

    await this.wishesRepository.update(id, updateWishDto);
  }

  async updateRaised(id: number, amount: number) {
    const wish = await this.findById(id);

    wish.raised = amount;
    await this.wishesRepository.save(wish);
  }

  async removeOne(id: number, userId: number): Promise<void> {
    const wish = await this.findById(id);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете удалять чужие подарки');
    }
    await this.wishesRepository.delete({ id });
  }

  async findLastWIshes(): Promise<Wish[]> {
    const lastWishes = await this.wishesRepository.find({
      order: { createdAt: 'DESC' },
      take: 40,
    });

    return lastWishes;
  }

  async findTopWishes(): Promise<Wish[]> {
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

  async copyWish(id: number, user: User): Promise<Wish> {
    const wish = await this.findById(id);

    if (wish.owner.id === user.id) {
      throw new ForbiddenException('Нельзя копировать свой подарок');
    }

    const isCopied = await this.wishesRepository.findOne({
      where: {
        name: wish.name,
        link: wish.link,
        image: wish.image,
        price: wish.price,
        owner: { id: user.id },
      },
    });

    if (isCopied) {
      throw new ForbiddenException('Вы уже копировали этот подарок');
    }

    await this.wishesRepository.increment({ id: wish.id }, 'copied', 1);

    const newWishData: CreateWishDto = {
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
    };

    return this.create(user, newWishData);
  }
}
