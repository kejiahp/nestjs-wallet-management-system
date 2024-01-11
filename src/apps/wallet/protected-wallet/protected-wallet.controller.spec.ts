import { Test, TestingModule } from '@nestjs/testing';
import { ProtectedWalletController } from './protected-wallet.controller';

describe('ProtectedWalletController', () => {
  let controller: ProtectedWalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProtectedWalletController],
    }).compile();

    controller = module.get<ProtectedWalletController>(
      ProtectedWalletController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
