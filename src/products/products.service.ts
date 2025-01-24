import { Injectable } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductImages, Products } from './entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private readonly productsRepository: Repository<Products>,
    @InjectRepository(ProductImages)
    private readonly productImagesRepository: Repository<ProductImages>,

    private readonly categoriesService: CategoriesService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    files: Array<Express.Multer.File>,
    createProductDto: CreateProductDto,
  ) {
    const queryRunner =
      this.productsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingProduct = await this.productsRepository.findOne({
        where: { name: createProductDto.name },
      });
      if (existingProduct) {
        throw new Error(
          `El producto con el nombre "${createProductDto.name}" ya existe.`,
        );
      }
      const categories = await this.categoriesService.findMultipleCategories(
        createProductDto.categories,
      );
      if (!categories || categories.length === 0) {
        throw new Error('No se encontraron categorías válidas');
      }
      const { ...productData } = createProductDto;
      const product = this.productsRepository.create({
        ...productData,
        categories,
      });
      const uploadResults = await this.cloudinaryService.uploadImages(files);
      if (!uploadResults || uploadResults.length === 0) {
        throw new Error('No se pudieron subir las imágenes');
      }
      const imagesProduct = uploadResults.map(({ secure_url, public_id }) => {
        return this.productImagesRepository.create({
          secureUrl: secure_url,
          publicId: public_id,
        });
      });
      await this.productImagesRepository.save(imagesProduct);
      product.images = imagesProduct;
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      return product;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al crear el producto:', error);
      throw new Error(
        `No se pudo crear el producto: ${error.message || 'Error desconocido'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.productsRepository.find();
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async update(
    id: string,
    files: Array<Express.Multer.File>,
    updateProductDto: UpdateProductDto,
  ) {
    const queryRunner =
      this.productsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const product = await this.productsRepository.findOne({
        where: { id },
        relations: ['images', 'categories'],
      });
      if (!product) {
        throw new Error(`El producto con id "${id}" no existe.`);
      }
      if (updateProductDto.categories) {
        const categories = await this.categoriesService.findMultipleCategories(
          updateProductDto.categories,
        );
        if (!categories || categories.length === 0) {
          throw new Error('No se encontraron categorías válidas.');
        }
        product.categories = categories;
      }
      const { ...productData } = updateProductDto;
      Object.assign(product, productData);

      if (files && files.length > 0) {
        const oldImages = product.images;
        if (oldImages.length > 0) {
          await Promise.all(
            oldImages.map((img) =>
              this.cloudinaryService.deleteImage(img.publicId),
            ),
          );
          await this.productImagesRepository.remove(oldImages);
        }
        const uploadResults = await this.cloudinaryService.uploadImages(files);
        if (!uploadResults || uploadResults.length === 0) {
          throw new Error('No se pudieron subir las imágenes.');
        }
        const imagesProduct = uploadResults.map(({ secure_url, public_id }) => {
          return this.productImagesRepository.create({
            secureUrl: secure_url,
            publicId: public_id,
          });
        });
        await this.productImagesRepository.save(imagesProduct);
        product.images = imagesProduct;
      }
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      return product;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al actualizar el producto:', error);
      throw new Error(
        `No se pudo actualizar el producto: ${error.message || 'Error desconocido'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    if (!product) {
      throw new Error('El producto no existe');
    }

    try {
      const publicIds = product.images
        .filter((image) => image.publicId)
        .map((image) => image.publicId);

      if (publicIds.length > 0) {
        await this.cloudinaryService.deleteImages(publicIds);
      }

      await this.productImagesRepository.remove(product.images);

      await this.productsRepository.remove(product);

      return 'Producto e imágenes eliminados exitosamente';
    } catch (error) {
      console.error('Error al eliminar el producto y sus imágenes:', error);
      throw new Error('No se pudo eliminar el producto y sus imágenes');
    }
  }

  async findAllPlain() {
    const product = await this.findAll();
    return product.map(({ images, categories, ...rest }) => ({
      ...rest,
      images: images.map((image) => image.secureUrl),
      categories: categories.map((category) => category.name),
    }));
  }

  async findOnePlain(id: string) {
    const { images = [], categories = [], ...rest } = await this.findOne(id);
    return {
      ...rest,
      images: images.map((image) => image.secureUrl),
      categories: categories.map((category) => category.name),
    };
  }

  async search(term: string) {
    const queryBuilder = this.productsRepository.createQueryBuilder('product');
    const products = await queryBuilder
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.categories', 'category')
      .where(`UPPER(product.name) LIKE :name`, {
        name: `%${term.toUpperCase()}%`,
      })
      .addSelect(['image.secureUrl'])
      .addSelect(['category.name'])
      .getMany();
    return products.map(({ images = [], categories = [], ...rest }) => ({
      ...rest,
      images: images.map((image) => image.secureUrl),
      categories: categories.map((category) => category.name),
    }));
  }
}
