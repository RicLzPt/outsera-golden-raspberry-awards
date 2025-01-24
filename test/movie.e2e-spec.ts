import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MovieController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/movies/producers/awards-intervals (GET) - Deve retornar codigo 200', async () => {
    const response = await request(app.getHttpServer())
      .get('/movies/producers/awards-intervals')
      .expect(200);
  });

  it('/movies/producers/awards-intervals (GET) - Deve retornar um objto com min e max na estrutura', async () => {
    const response = await request(app.getHttpServer())
      .get('/movies/producers/awards-intervals')
      .expect(200);

    expect(response.body).toHaveProperty('min');
    expect(response.body).toHaveProperty('max');
    expect(Array.isArray(response.body.min)).toBeTruthy();
    expect(Array.isArray(response.body.max)).toBeTruthy();
  });

  it('/movies/producers/awards-intervals (GET) - Deve retornar um objto com min e max na estrutura', async () => {
    const response = await request(app.getHttpServer()).get(
      '/movies/producers/awards-intervals',
    );
    console.log(response.body);
    if (response.body.min.length > 0) {
      expect(response.body.min[0]).toHaveProperty('producer');
      expect(response.body.min[0]).toHaveProperty('interval');
      expect(response.body.min[0]).toHaveProperty('previousWin');
      expect(response.body.min[0]).toHaveProperty('winningYear');
    }

    if (response.body.max.length > 0) {
      expect(response.body.max[0]).toHaveProperty('producer');
      expect(response.body.max[0]).toHaveProperty('interval');
      expect(response.body.max[0]).toHaveProperty('previousWin');
      expect(response.body.max[0]).toHaveProperty('winningYear');
    }
  });

  it('/movies/producers/awards-intervals (GET) - Deve retornar valores corretos', async () => {
    const response = await request(app.getHttpServer()).get(
      '/movies/producers/awards-intervals',
    );
    console.log(response.body);
    if (response.body.min.length > 0) {
      expect(response.body.min[0].producer).toBe('Joel Silver');
      expect(response.body.min[0].interval).toBe(1);
      expect(response.body.min[0].previousWin).toBe(1990);
      expect(response.body.min[0].winningYear).toBe(1991);
    }

    if (response.body.max.length > 0) {
      expect(response.body.max[0].producer).toBe('Matthew Vaughn');
      expect(response.body.max[0].interval).toBe(13);
      expect(response.body.max[0].previousWin).toBe(2002);
      expect(response.body.max[0].winningYear).toBe(2015);
    }
  });
});
