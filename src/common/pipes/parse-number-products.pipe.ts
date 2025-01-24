import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from 'src/products/dto/create-product.dto';

@Injectable()
export class ParsePriceAndStockPipe implements PipeTransform {
  transform(value: any): CreateProductDto {
    const price = parseFloat(value.price);
    const stock = parseInt(value.stock, 10);

    if (isNaN(price) || isNaN(stock)) {
      throw new BadRequestException('Price and stock must be valid numbers');
    }

    if (price <= 0) {
      throw new BadRequestException('Price must be a positive number');
    }

    if (stock <= 0) {
      throw new BadRequestException('Stock must be a positive number');
    }

    if (!Number.isInteger(stock)) {
      throw new BadRequestException('Stock must be an integer number');
    }

    return {
      ...value,
      price,
      stock,
    };
  }
}
