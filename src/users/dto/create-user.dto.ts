import { IsString, IsEmail, IsUrl, IsOptional, Length } from 'class-validator';

export class CreateUserDto {
  @Length(2, 30)
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(5, 255)
  password: string;
}
