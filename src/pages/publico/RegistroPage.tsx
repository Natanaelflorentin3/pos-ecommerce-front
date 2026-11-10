import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { api, mensajeError } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const esquema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 letras'),
  apellido: z.string().min(2, 'Mínimo 2 letras'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(6, 'Teléfono inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type Datos = z.infer<typeof esquema>;

const campos: { name: keyof Datos; placeholder: string; type?: string }[] = [
  { name: 'nombre', placeholder: 'Nombre' },
  { name: 'apellido', placeholder: 'Apellido' },
  { name: 'email', placeholder: 'Email' },
  { name: 'telefono', placeholder: 'Teléfono' },
  { name: 'password', placeholder: 'Contraseña', type: 'password' },
];

export default function RegistroPage() {
  const navigate = useNavigate();
  const iniciarSesion = useAuthStore((s) => s.iniciarSesion);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Datos>({ resolver: zodResolver(esquema) });

  const onSubmit = async (datos: Datos) => {
    setError('');
    try {
      await api.post('/auth/register', datos);
      // Queda activo de inmediato: lo logueamos directamente
      const { data } = await api.post('/auth/login', { email: datos.email, password: datos.password });
      iniciarSesion(data.access_token);
      navigate('/', { replace: true });
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>
        {campos.map((c) => (
          <div key={c.name}>
            <input {...register(c.name)} type={c.type ?? 'text'} placeholder={c.placeholder} className="w-full border rounded-lg p-2" />
            {errors[c.name] && <p className="text-red-600 text-sm">{errors[c.name]?.message}</p>}
          </div>
        ))}
        {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</p>}
        <button disabled={isSubmitting} className="w-full bg-blue-600 text-white rounded-lg p-2 disabled:opacity-50">
          {isSubmitting ? 'Creando...' : 'Registrarme'}
        </button>
        <p className="text-sm text-center">
          ¿Ya tenés cuenta? <Link to="/login" className="text-blue-600">Ingresá</Link>
        </p>
      </form>
    </div>
  );
}