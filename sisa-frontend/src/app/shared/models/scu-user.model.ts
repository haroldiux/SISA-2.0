import { ScuRoleEnum } from '../enums/scu-role.enum';

/**
 * User and Authentication models.
 *
 * @author GentleAI SISA Architecture Team
 */
export interface ScuUserModel {
  id: number;
  username: string;
  ci?: string;
  email: string;
  role: ScuRoleEnum;
  sedeId: number | null;
  sedeNombre: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  mustChangePassword?: boolean;
  activo?: boolean;
  isActive?: boolean;
  asignaciones?: any[];
}

export interface ScuAuthResponseModel {
  accessToken: string;
  token?: string;
  refreshToken?: string | null;
  tokenType: string;
  expiresIn: number;
  mustChangePassword?: boolean;
  user: ScuUserModel;
}
