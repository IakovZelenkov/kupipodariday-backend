import { IsString, IsEmail, IsUrl, IsOptional, Length } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @Length(2, 30)
  @IsString()
  username?: string;

  @IsOptional()
  @Length(2, 200)
  @IsString()
  about?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsEmail()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(5, 255)
  password?: string;
}
