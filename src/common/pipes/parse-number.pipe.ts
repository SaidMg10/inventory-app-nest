import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { CreateProductDto } from 'src/products/dto';

@Injectable()
export class ParseNumbersPipe implements PipeTransform {
  async transform(value: any) {
    // Convertir valores numéricos en strings a su tipo adecuado (number)
    if (typeof value === 'object') {
      Object.keys(value).forEach((key) => {
        if (typeof value[key] === 'string') {
          // Convertir valores específicos como 'price' y 'stock' a números
          if (key === 'price') {
            value[key] = this.parseDecimal(value[key]);
          }
          if (key === 'stock') {
            value[key] = this.parseInt(value[key]);
          }
        }
      });
    }

    // Validar el DTO después de la conversión
    const dto = Object.assign(new CreateProductDto(), value);
    const validationErrors = await validate(dto);

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors);
    }

    return value;
  }

  private parseDecimal(value: string): number {
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      throw new BadRequestException('Invalid price format');
    }
    return parsedValue;
  }

  private parseInt(value: string): number {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      throw new BadRequestException('Invalid stock format');
    }
    return parsedValue;
  }
}
