import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async create(
    user: User,
    createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    const items = await Promise.all(
      createWishlistDto.itemsId.map((id) => this.wishesService.findById(id)),
    );

    const wishlist = this.wishlistsRepository.create({
      ...createWishlistDto,
      owner: user,
      items,
    });

    return this.wishlistsRepository.save(wishlist);
  }

  async findById(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });

    if (!wishlist) {
      throw new NotFoundException('Список подарков не найден');
    }

    return wishlist;
  }

  async findAll(): Promise<Wishlist[]> {
    const wishlists = await this.wishlistsRepository.find({
      relations: ['owner', 'items'],
    });

    return wishlists;
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    user: User,
  ): Promise<Wishlist> {
    const wishlist = await this.findById(id);

    if (!wishlist) {
      throw new NotFoundException('Список подарков не найден');
    }

    if (wishlist.owner.id !== user.id) {
      throw new ForbiddenException('Вы не можете редактировать чужие списки');
    }

    const wishes = await this.wishesService.findManyById(
      updateWishlistDto.itemsId,
    );

    return await this.wishlistsRepository.save({
      ...wishlist,
      name: updateWishlistDto.name,
      image: updateWishlistDto.image,
      description: updateWishlistDto.description,
      items: wishes,
    });
  }

  async remove(id: number, userId): Promise<Wishlist> {
    const wishlist = await this.findById(id);

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете удалять чужие списки');
    }

    await this.wishlistsRepository.delete(id);
    return wishlist;
  }
}
