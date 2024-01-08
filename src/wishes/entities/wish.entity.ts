import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Length, IsUrl, IsNumber, Min, IsInt, IsString } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Offer } from 'src/offers/entities/offer.entity';
import { AbstractEntity } from 'src/entities/abstract-entity';

@Entity()
export class Wish extends AbstractEntity {
  @Column({ type: 'varchar', length: 250 })
  @Length(1, 250)
  name: string;

  @Column({ type: 'varchar' })
  @IsUrl()
  link: string;

  @Column({ type: 'varchar' })
  @IsUrl()
  image: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  raised: number;

  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  @Column({ type: 'text' })
  @IsString()
  @Length(1, 1024)
  description: string;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];

  @Column({ type: 'int', default: 0 })
  @IsInt()
  copied: number;
}
