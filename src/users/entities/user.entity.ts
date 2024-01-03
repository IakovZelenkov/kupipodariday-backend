import { Entity, Column, OneToMany, Unique } from 'typeorm';
import { Length, IsEmail, IsUrl, IsOptional, IsString } from 'class-validator';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Offer } from 'src/offers/entities/offer.entity';
import { Wishlist } from 'src/wishlists/entities/wishlist.entity';
import { AbstractEntity } from 'src/entities/abstract-entity';

@Entity()
@Unique(['username', 'email'])
export class User extends AbstractEntity {
  @Column('varchar', { length: 30, unique: true })
  @Length(2, 30)
  username: string;

  @Column({ type: 'text', default: 'Пока ничего не рассказал о себе' })
  @IsString()
  @Length(2, 200)
  @IsOptional()
  about: string;

  @Column({ type: 'varchar', default: 'https://i.pravatar.cc/300' })
  @IsUrl()
  @IsOptional()
  avatar: string;

  @Column({ type: 'varchar', unique: true })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @Length(5, 255)
  password: string;

  @OneToMany(() => Wish, (wish) => wish.owner)
  wishes: Wish[];

  @OneToMany(() => Offer, (offer) => offer.user)
  offers: Offer[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.owner)
  wishlists: Wishlist[];
}
