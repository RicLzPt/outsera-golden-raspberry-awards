import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Movie } from '../../domain/entities/movie.ent';
import { MovieRepositoryInterface } from '../../domain/interfaces/movie.repository.interface';
import { DataLoader } from '../../domain/types/data.loader.type';

@Injectable()
export class MovieRepositoryImpl implements MovieRepositoryInterface {
  private repository: Repository<Movie>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Movie);
  }

  async save(movie: Movie): Promise<Movie> {
    return this.repository.save(movie);
  }

  async findAll(): Promise<Movie[]> {
    return this.repository.find();
  }

  async getProducersAwardsIntervalsMin(): Promise<DataLoader[]> {
    const sql = `
    
    WITH RECURSIVE seperaProdutores AS (

  -- Passo 1: Extraio o primeiro produtor antes da vírgula ou "and"
  SELECT 
    m.year,
    TRIM(SUBSTR(m.producers, 1, 
      CASE 
        WHEN INSTR(m.producers, ', ') > 0 THEN INSTR(m.producers, ', ') - 1
        WHEN INSTR(m.producers, ' and ') > 0 THEN INSTR(m.producers, ' and ') - 1
        ELSE LENGTH(m.producers)
      END
    )) AS producer,
    TRIM(SUBSTR(m.producers, 
      CASE 
        WHEN INSTR(m.producers, ', ') > 0 THEN INSTR(m.producers, ', ') + 2
        WHEN INSTR(m.producers, ' and ') > 0 THEN INSTR(m.producers, ' and ') + 5
        ELSE LENGTH(m.producers) + 1
      END
    )) AS remaining
  FROM movies m
  WHERE m.winner = 1

  UNION ALL

  -- Passo 2: Continuo extraindo os produtores restantes
  SELECT 
    year,
    TRIM(SUBSTR(remaining, 1, 
      CASE 
        WHEN INSTR(remaining, ', ') > 0 THEN INSTR(remaining, ', ') - 1
        WHEN INSTR(remaining, ' and ') > 0 THEN INSTR(remaining, ' and ') - 1
        ELSE LENGTH(remaining)
      END
    )) AS producer,
    TRIM(SUBSTR(remaining, 
      CASE 
        WHEN INSTR(remaining, ', ') > 0 THEN INSTR(remaining, ', ') + 2
        WHEN INSTR(remaining, ' and ') > 0 THEN INSTR(remaining, ' and ') + 5
        ELSE LENGTH(remaining) + 1
      END
    )) AS remaining
  FROM seperaProdutores
  WHERE remaining <> ''
),
RankedMovies AS (
  -- Ordeno os prêmios por produtor para calcular o prêmio anterior
  SELECT 
    producer,
    year AS winningYear,
    LAG(year) OVER (PARTITION BY producer ORDER BY year) AS previousWin
  FROM seperaProdutores
),
Intervals AS (
  -- Calculo os intervalos entre prêmios consecutivos
  SELECT 
    producer,
    winningYear - previousWin AS interval,
    previousWin,
    winningYear
  FROM RankedMovies
  WHERE previousWin IS NOT NULL
),
MinInterval AS (
  -- Pegamos o menor intervalo registrado
  SELECT MIN(interval) AS minInterval FROM Intervals
)
SELECT 
  i.producer, 
  i.interval, 
  i.previousWin, 
  i.winningYear
FROM Intervals i
JOIN MinInterval m
ON i.interval = m.minInterval;

`;
    const result = await this.dataSource.query(sql);
    // console.log(result);
    return result;
  }

  async getProducersAwardsIntervalsMax(): Promise<DataLoader[]> {
    const sql = `
    WITH RECURSIVE seperaProdutores AS (

      -- Passo 1: Aqui eu extraio o primeiro produtor antes da virgula ou "and"
      SELECT 
        m.year,
        TRIM(SUBSTR(m.producers, 1, 
          CASE 
            WHEN INSTR(m.producers, ', ') > 0 THEN INSTR(m.producers, ', ') - 1
            WHEN INSTR(m.producers, ' and ') > 0 THEN INSTR(m.producers, ' and ') - 1
            ELSE LENGTH(m.producers)
          END
        )) AS producer,
        TRIM(SUBSTR(m.producers, 
          CASE 
            WHEN INSTR(m.producers, ', ') > 0 THEN INSTR(m.producers, ', ') + 2
            WHEN INSTR(m.producers, ' and ') > 0 THEN INSTR(m.producers, ' and ') + 5
            ELSE LENGTH(m.producers) + 1
          END
        )) AS remaining
      FROM movies m
      WHERE m.winner = 1

      UNION ALL

      -- Passo 2: Aq continuo extraindo os produtores restante
      SELECT 
        year,
        TRIM(SUBSTR(remaining, 1, 
          CASE 
            WHEN INSTR(remaining, ', ') > 0 THEN INSTR(remaining, ', ') - 1
            WHEN INSTR(remaining, ' and ') > 0 THEN INSTR(remaining, ' and ') - 1
            ELSE LENGTH(remaining)
          END
        )) AS producer,
        TRIM(SUBSTR(remaining, 
          CASE 
            WHEN INSTR(remaining, ', ') > 0 THEN INSTR(remaining, ', ') + 2
            WHEN INSTR(remaining, ' and ') > 0 THEN INSTR(remaining, ' and ') + 5
            ELSE LENGTH(remaining) + 1
          END
        )) AS remaining
      FROM seperaProdutores
      WHERE remaining <> ''
    ),
    RankedMovies AS (
      -- Ordeno os prêmios por produtor para calcular o prêmio anterior
      SELECT 
        producer,
        year AS winningYear,
        LAG(year) OVER (PARTITION BY producer ORDER BY year) AS previousWin
      FROM seperaProdutores
    ),
    Intervals AS (
      -- Calculo os intervalos entre premios consecutivos
      SELECT 
        producer,
        winningYear - previousWin AS interval,
        previousWin,
        winningYear
      FROM RankedMovies
      WHERE previousWin IS NOT NULL
    ),
    MaxInterval AS (
      -- Pegamos o maior intervalo registrado
      SELECT MAX(interval) AS maxInterval FROM Intervals
    )
    SELECT 
      i.producer, 
      i.interval, 
      i.previousWin, 
      i.winningYear
    FROM Intervals i
    JOIN MaxInterval m
    ON i.interval = m.maxInterval;
`;
    const result = await this.dataSource.query(sql);

    console.log(result);
    return result;
  }
}
