import { Products } from 'src/products/entities';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('varchar', { length: 127, unique: true })
  name: string;
  @ManyToMany(() => Products, (product) => product.categories)
  products: Products[];
}
