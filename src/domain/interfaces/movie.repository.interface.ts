import { Movie } from '../entities/movie.ent';
import { DataLoader } from '../types/data.loader.type';

export const MovieRepositoryInterfaceToken = 'MovieRepositoryInterfaceToken';

export interface MovieRepositoryInterface {
  save(movie: Movie): Promise<Movie>;
  findAll(): Promise<Movie[]>;
  getProducersAwardsIntervalsMin(): Promise<DataLoader[]>;
  getProducersAwardsIntervalsMax(): Promise<DataLoader[]>;
}
