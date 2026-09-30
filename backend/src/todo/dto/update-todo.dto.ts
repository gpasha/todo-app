import { Priority } from '@prisma/client'
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title?: string

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string

  @IsOptional()
  @IsBoolean()
  completed?: boolean

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority

  @IsOptional()
  @IsDateString()
  dueDate?: string
}
