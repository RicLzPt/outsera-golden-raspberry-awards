import { Inject, Injectable } from '@nestjs/common';
import { MovieRepositoryInterfaceToken } from '../../domain/interfaces/movie.repository.interface';
import { DataLoader } from '../../domain/types/data.loader.type';

@Injectable()
export class MovieService {
  constructor(
    @Inject(MovieRepositoryInterfaceToken) private readonly movieRepository,
  ) {}

  async getAllMovies() {
    return this.movieRepository.findAll();
  }

  async getProducersAwardsIntervals() {
    const resultsMax: DataLoader[] =
      await this.movieRepository.getProducersAwardsIntervalsMax();
    const resultsMin: DataLoader[] =
      await this.movieRepository.getProducersAwardsIntervalsMin();

    return {
      min: resultsMin.map(({ ...rest }) => rest),
      max: resultsMax.map(({ ...rest }) => rest),
    };
  }
}
