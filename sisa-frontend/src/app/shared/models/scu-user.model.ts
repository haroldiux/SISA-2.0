import { ScuRoleEnum } from '../enums/scu-role.enum';

/**
 * User and Authentication models.
 *
 * @author GentleAI SISA Architecture Team
 */
export interface ScuUserModel {
  id: number;
  username: string;
  email: string;
  role: ScuRoleEnum;
  sedeId: number | null;
  sedeNombre: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
}

export interface ScuAuthResponseModel {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: ScuUserModel;
}
