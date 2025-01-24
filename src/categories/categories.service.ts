import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { In, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findOne(term: string) {
    let category: Category;
    if (isUUID(term)) {
      category = await this.categoryRepository.findOneBy({ id: term });
    } else {
      const queryBuilder =
        this.categoryRepository.createQueryBuilder('category');
      category = await queryBuilder
        .where(`UPPER(name) =:name`, { name: term.toUpperCase() })
        .getOne();
    }
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const toUpdate = updateCategoryDto;
    const category = await this.categoryRepository.preload({
      id,
      ...toUpdate,
    });
    if (!category) throw new NotFoundException('Category not found');
    return await this.categoryRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOneBy({ id: id });
    if (!category) throw new NotFoundException('Category not found');
    await this.categoryRepository.remove(category);
    return `Category with id: ${id} has been deleted`;
  }

  async search(term: string) {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');
    const categories = await queryBuilder
      .where(`UPPER(name) LIKE :name`, { name: `%${term.toUpperCase()}%` })
      .getMany();
    return categories;
  }

  async findMultipleCategories(categories: string[]) {
    const results = await this.categoryRepository.find({
      where: { id: In(categories) },
    });

    return results;
  }
}
