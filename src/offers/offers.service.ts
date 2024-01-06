import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishesService } from 'src/wishes/wishes.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}

  async create(user: User, createOfferDto: CreateOfferDto): Promise<Offer> {
    const wish = await this.wishesService.findById(createOfferDto.itemId);

    if (wish.owner.id === user.id) {
      throw new ForbiddenException('Нельзя скидываться на подарок самому себе');
    }

    const sum = Number(wish.raised) + Number(createOfferDto.amount);

    if (sum > wish.price) {
      throw new ForbiddenException('Сумма превышает стоимость подарка');
    }

    await this.wishesService.updateRaised(wish.id, sum);

    const newOffer = this.offersRepository.create({
      amount: createOfferDto.amount,
      hidden: createOfferDto.hidden,
      user: user,
      item: wish,
    });

    return await this.offersRepository.save(newOffer);
  }

  async findAll() {
    const offers = await this.offersRepository.find({
      relations: { user: true, item: true },
    });

    if (!offers) {
      throw new NotFoundException('Предложения не найдены');
    }

    return offers;
  }

  async findById(id: number) {
    const offer = await this.offersRepository.findOne({
      where: { id },
      relations: { user: true, item: true },
    });

    if (!offer) {
      throw new NotFoundException('Предложение не найдено');
    }

    return offer;
  }
}
