import {
  IsString,
  IsEmail,
  IsUrl,
  IsNotEmpty,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @Length(2, 30)
  @IsString()
  username: string;

  @IsOptional()
  @Length(2, 200)
  @IsString()
  about?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  avatar?: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
