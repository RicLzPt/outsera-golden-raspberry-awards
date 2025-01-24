import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as csvParser from 'csv-parser';
import { Movie } from '../../domain/entities/movie.ent';

@Injectable()
export class MovieLoader implements OnModuleInit {
  private readonly logger = new Logger(MovieLoader.name);

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async onModuleInit() {
    try {
      await this.loadMovies();
    } catch (error) {
      this.logger.error(
        'Erro ao carregar os filmes no banco de dados',
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao carregar os dados do CSV.',
      );
    }
  }

  private async loadMovies(): Promise<void> {
    const filePath = './src/data/movielist.csv';

    const movieCount = await this.movieRepository.count();
    if (movieCount > 0) {
      this.logger.log('Banco de dados já possui filmes. Pulando importação.');
      return;
    }

    this.logger.log('Carregando filmes do CSV para o banco de dados...');

    try {
      const movies = await this.parseCSV(filePath);
      await this.movieRepository.save(movies);
      this.logger.log('Filmes importados com sucesso!');
    } catch (error) {
      this.logger.error('Erro ao carregar CSV', error.stack);
      throw new InternalServerErrorException(
        'Erro ao importar os filmes do CSV.',
      );
    }
  }

  private parseCSV(filePath: string): Promise<Partial<Movie>[]> {
    return new Promise((resolve, reject) => {
      const movies: Partial<Movie>[] = [];

      const stream = fs
        .createReadStream(filePath)
        .pipe(csvParser({ separator: ';' }))
        .on('data', (row) => {
          try {
            const winnerValue = row.winner?.trim().toLowerCase();
            const isWinner = winnerValue === 'yes';

            movies.push({
              title: row.title?.trim() || 'Título Desconhecido',
              studios: row.studios?.trim() || 'Estúdio Desconhecido',
              producers: row.producers?.trim() || 'Produtor Desconhecido',
              year: Number(row.year?.trim()) || 0,
              winner: isWinner,
            });
          } catch (error) {
            this.logger.warn(
              `Erro ao processar linha do CSV: ${JSON.stringify(row)}`,
              error.stack,
            );
          }
        })
        .on('end', () => {
          this.logger.log(
            `CSV lido com sucesso, total de filmes: ${movies.length}`,
          );
          resolve(movies);
        })
        .on('error', (error) => {
          this.logger.error('Erro ao ler o arquivo CSV', error.stack);
          reject(
            new InternalServerErrorException(
              'Erro ao processar o arquivo CSV.',
            ),
          );
        });

      stream.on('open', () =>
        this.logger.log('Arquivo CSV aberto com sucesso.'),
      );
      stream.on('close', () => this.logger.log('Leitura do CSV concluída.'));
    });
  }
}
