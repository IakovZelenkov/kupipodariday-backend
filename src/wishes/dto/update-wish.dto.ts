import {
  IsString,
  IsUrl,
  Length,
  IsNumber,
  Min,
  IsInt,
  IsOptional,
} from 'class-validator';

export class UpdateWishDto {
  @IsOptional()
  @Length(1, 250)
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  price?: number;

  @IsOptional()
  @Length(1, 1024)
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  raised?: number;

  @IsOptional()
  @IsInt()
  copied?: number;
}
