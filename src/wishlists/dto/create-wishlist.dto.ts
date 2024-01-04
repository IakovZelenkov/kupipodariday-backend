import { IsString, IsUrl, IsArray, IsOptional, Length } from 'class-validator';

export class CreateWishlistDto {
  @Length(1, 250)
  @IsString()
  name: string;

  @Length(1, 1500)
  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  itemsId: number[];

  @IsUrl()
  image: string;
}
