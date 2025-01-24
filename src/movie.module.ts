import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './domain/entities/movie.ent';
import { MovieController } from './infra/controllers/movie.ctl';
import { MovieService } from './application/services/movie.srv';
import { MovieRepositoryImpl } from './infra/repositories/movie.repository.impl';
import { MovieLoader } from './infra/database/movie-loader';
import { MovieRepositoryInterfaceToken } from './domain/interfaces/movie.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Movie])],
  controllers: [MovieController],
  providers: [
    MovieService,
    MovieLoader,
    {
      provide: MovieRepositoryInterfaceToken,
      useClass: MovieRepositoryImpl,
    },
  ],
  exports: [MovieService],
})
export class MovieModule {}
