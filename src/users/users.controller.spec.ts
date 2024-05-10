import { NotFoundException } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({id, email: 'a@a.com', password: 'pass'} as User)
      },
      find: (email: string) => {
        return Promise.resolve([{id: 1, email, password: 'pass'} as User])
      },
      // remove: () => {},
      // update: () => {}
    }


    fakeAuthService = {
      // signup: (email: string, password: string) => {
      //   return Promise.resolve({id: 1, email, password} as User)
      // },
      signin: (email: string, password: string) => {
        return Promise.resolve({id: 1, email, password} as User)
      }
    }

    const module:TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide:  AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  })

  it('controller should be defined', async() => {
    expect(controller).toBeDefined();
  })

  it('throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;

    await (expect(controller.findUser("1"))).rejects.toThrow(NotFoundException);
  })

  it('findAllUsers return list of user with given an email', async () => {
    const users = await controller.findAllUsers('a@a.com');

    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('a@a.com');
  })

  it('finduser return a single user with given a id', async () => {
    const user = await controller.findUser("1");

    expect(user).toBeDefined();
  })

  it('signin updates session', async () => {
    const session = {userId: 2};
    const user = await controller.signin({email: 'a@a.com', password: 'pass'}, session);

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  })

});
