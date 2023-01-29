import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleDto } from './dto/role.dto';
import { Role } from './entity/roles.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('Roles Controller', () => {
  let controller: RolesController;
  let service: RolesService;
  let guard: JwtAuthGuard;

  describe('getRoles', () => {
    it('should get an array of roles', async () => {
      await expect(controller.getRoles()).resolves.toEqual([
        {
          message: 'Roles fetched',
          data: {},
        },
      ]);
    });
  });
});
