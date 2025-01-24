import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { ProductImages } from '../entities';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  description: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsPositive()
  price: number;

  @Transform(({ value }) => parseInt(value))
  @Type(() => Number)
  @IsInt()
  stock: number;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: ProductImages[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  categories?: string[];
}
