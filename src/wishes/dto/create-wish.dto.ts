import {
  IsString,
  IsUrl,
  Length,
  IsNumber,
  Min,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateWishDto {
  @Length(1, 250)
  @IsString()
  name: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image: string;

  @IsNumber()
  @Min(1)
  price: number;

  @Length(1, 1024)
  @IsString()
  description: string;

  @IsInt()
  @IsOptional()
  raised?: number;
}
