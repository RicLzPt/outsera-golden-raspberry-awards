import { Controller, Get } from '@nestjs/common';
import { MovieService } from '../../application/services/movie.srv';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  async getAllMovies() {
    return this.movieService.getAllMovies();
  }

  @Get('producers/awards-intervals')
  async getProducersAwardsIntervals() {
    return this.movieService.getProducersAwardsIntervals();
  }
}
