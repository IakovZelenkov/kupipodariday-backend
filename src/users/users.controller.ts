import {
  Controller,
  Get,
  Post,
  Patch,
  Req,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: any): Promise<User> {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  @Patch('me')
  async updateMe(
    @Req() req: any,
    @Body() updateUsertDto: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.updateOne(req.user.id, updateUsertDto);
  }

  @Get(':username')
  async findByUsername(@Param('username') username: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  @Post('find')
  async findUsers(@Body() body: { query: string }): Promise<User[]> {
    return this.usersService.findMany(body.query);
  }
}
