import { Entity, Column, ManyToOne } from 'typeorm';
import { IsBoolean, IsNumber } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { AbstractEntity } from 'src/entities/abstract-entity';
@Entity()
export class Offer extends AbstractEntity {
  @ManyToOne(() => User, (user) => user.offers)
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers)
  item: Wish;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  amount: number;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  hidden: boolean;
}
