import { Entity, Column, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Length, IsUrl } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { AbstractEntity } from 'src/entities/abstract-entity';
@Entity()
export class Wishlist extends AbstractEntity {
  @Column({ type: 'varchar', length: 250 })
  @Length(1, 250)
  name: string;

  @Column({ type: 'text', nullable: true })
  @Length(1, 1500)
  description: string;

  @Column({ type: 'varchar' })
  @IsUrl()
  image: string;

  @ManyToMany(() => Wish, (wish) => wish.name)
  @JoinTable()
  items: Wish[];

  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;
}
