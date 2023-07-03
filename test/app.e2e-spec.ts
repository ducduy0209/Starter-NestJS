import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'duy0209@gmail.com',
      password: 'test1234',
    };
    describe('Signup', () => {
      it('Should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('Should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('Should throw if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('Should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      let accessToken: string;
      it('Should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('Should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('Should throw if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('Should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('Should get current user', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .get('/users/me')
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('Should edit user', () => {
        const dto: EditUserDto = {
          email: 'test1234@gmail.com',
          firstName: 'Dang',
          lastName: 'Duy',
        };
        return pactum
          .spec()
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .patch('/users')
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });
  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('Should get bookmarks', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .get('/bookmarks')
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'Task',
        description: 'Task description',
        link: 'facebook.com',
      };
      it('Should create bookmark', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .post('/bookmarks')
          .expectStatus(201)
          .withBody(dto)
          .stores('bookmarkId', 'id');
      });
    });
    describe('Get bookmarks', () => {
      it('Should get bookmarks', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .get('/bookmarks')
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Get bookmark by id', () => {
      it('Should get bookmark by id', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .get('/bookmarks/$S{bookmarkId}')
          .expectStatus(200);
      });
    });
    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        link: 'https://www.youtube.com/watch?v=GHTA143_b-s&list=LL&index=11&t=2964s',
      };
      it('Should edit bookmark by id', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBody(dto)
          .expectStatus(200);
      });
    });
    describe('Delete bookmark by id', () => {
      it('Should delete bookmark by id', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .delete('/bookmarks/$S{bookmarkId}')
          .expectStatus(204);
      });
    });
  });
});
