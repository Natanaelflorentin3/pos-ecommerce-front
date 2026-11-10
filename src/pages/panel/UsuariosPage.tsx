import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { crearUsuario, listarUsuarios } from '../../api/usuarios';
import { mensajeError } from '../../api/axios';
import type { UsuarioSistema } from '../../types/catalogo';

const esquema = z.object({
  nombre: z.string().trim().min(2, 'Mínimo 2 letras'),
  apellido: z.string().trim().min(2, 'Mínimo 2 letras'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  rol: z.enum(['CAJERO', 'ADMIN']),
});
type Datos = z.infer<typeof esquema>;

const campos: { name: Exclude<keyof Datos, 'rol'>; placeholder: string; type?: string }[] = [
  { name: 'nombre', placeholder: 'Nombre' },
  { name: 'apellido', placeholder: 'Apellido' },
  { name: 'email', placeholder: 'Email' },
  { name: 'password', placeholder: 'Contraseña', type: 'password' },
];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [recarga, setRecarga] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Datos>({ resolver: zodResolver(esquema), defaultValues: { rol: 'CAJERO' } });

  useEffect(() => {
    listarUsuarios()
      .then(setUsuarios)
      .catch((e) => setError(mensajeError(e)));
  }, [recarga]);

  const onSubmit = async (datos: Datos) => {
    setError('');
    setExito('');
    try {
      const nuevo = await crearUsuario(datos);
      setExito(`Se creó la cuenta de ${nuevo.nombre} (${nuevo.rol})`);
      reset();
      setRecarga((n) => n + 1);
    } catch (e) {
      setError(mensajeError(e)); // ej: "El email ya está registrado"
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Usuarios del sistema</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-4 space-y-3 max-w-2xl">
        <h2 className="font-semibold">Crear cuenta de staff</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {campos.map((c) => (
            <div key={c.name}>
              <input {...register(c.name)} type={c.type ?? 'text'} placeholder={c.placeholder} className="w-full border rounded-lg p-2" />
              {errors[c.name] && <p className="text-red-600 text-sm">{errors[c.name]?.message}</p>}
            </div>
          ))}
          <select {...register('rol')} className="border rounded-lg p-2">
            <option value="CAJERO">Cajero</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</p>}
        {exito && <p className="bg-green-100 text-green-700 p-2 rounded text-sm">{exito}</p>}
        <button disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
          {isSubmitting ? 'Creando...' : 'Crear usuario'}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.nombre} {u.apellido}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.rol}</td>
                <td className="p-3">{u.activo ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}