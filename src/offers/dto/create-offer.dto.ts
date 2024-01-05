import { IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNumber()
  itemId: number;

  @IsBoolean()
  hidden: boolean;
}
