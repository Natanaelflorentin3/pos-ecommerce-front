import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { api, mensajeError } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { destinoPorRol } from '../../utils/destino';

const esquema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresá la contraseña'),
});
type Datos = z.infer<typeof esquema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const iniciarSesion = useAuthStore((s) => s.iniciarSesion);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Datos>({ resolver: zodResolver(esquema) });

  const onSubmit = async (datos: Datos) => {
    setError('');
    try {
      const { data } = await api.post('/auth/login', datos);
      iniciarSesion(data.access_token);
      const usuario = useAuthStore.getState().usuario;
      if (usuario) navigate(destinoPorRol(usuario.rol), { replace: true });
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Iniciar sesión</h1>

        <div>
          <input {...register('email')} placeholder="Email" className="w-full border rounded-lg p-2" />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <input {...register('password')} type="password" placeholder="Contraseña" className="w-full border rounded-lg p-2" />
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        </div>

        {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</p>}

        <button disabled={isSubmitting} className="w-full bg-blue-600 text-white rounded-lg p-2 disabled:opacity-50">
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
        <p className="text-sm text-center">
          ¿No tenés cuenta? <Link to="/registro" className="text-blue-600">Registrate</Link>
        </p>
      </form>
    </div>
  );
}