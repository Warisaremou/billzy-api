import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLE_PERMISSIONS } from "../constants/permissions";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import type { JwtPayload } from "../types/index";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user }: { user: JwtPayload } = request;

    if (!user) {
      return false;
    }

    // Get user's permissions based on their role
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];

    // Check if user has all required permissions
    const hasPermission = requiredPermissions.every((permission) => userPermissions.includes(permission as any));

    return hasPermission;
  }
}
