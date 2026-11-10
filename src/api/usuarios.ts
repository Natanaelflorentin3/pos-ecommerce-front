import { api } from './axios';
import type { UsuarioInput, UsuarioSistema } from '../types/catalogo';

export async function listarUsuarios() {
  const { data } = await api.get<UsuarioSistema[]>('/usuarios');
  return data;
}

export async function crearUsuario(datos: UsuarioInput) {
  const { data } = await api.post<UsuarioSistema>('/usuarios', datos);
  return data;
}