/** Tipo exclusivamente interno. Não exportar pelo entrypoint público ou importar no mobile. */
export interface PrivateUserData {
  readonly uid: string;
  readonly birthDate: string;
  readonly email?: string;
  readonly phone?: string;
}

// Coordenadas não pertencem nem ao contrato privado do MVP.
// Documento, verificação e administração exigirão modelos próprios se autorizados.
