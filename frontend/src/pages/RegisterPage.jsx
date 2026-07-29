import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import toast from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';

const FIELDS = [
  { name: 'mobile_number', label: 'Mobile Number', type: 'text', required: true },
  { name: 'password', label: 'Password', type: 'password', required: true },
  { name: 'confirm_password', label: 'Confirm Password', type: 'password', required: true },
  { name: 'owner_name', label: 'Owner Name', type: 'text', required: true },
  { name: 'shop_name', label: 'Shop Name', type: 'text', required: true },
  { name: 'place', label: 'Place', type: 'text', required: true },
  { name: 'address', label: 'Address', type: 'text', required: false },
  { name: 'pin_code', label: 'PIN Code', type: 'text', required: false },
  { name: 'gst_number', label: 'GST Number', type: 'text', required: false },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(' ') : 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">StockCity</h1>
          <p className="text-gray-500 mt-1">Create your shop account</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Shop Registration</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={f.name} className={f.name === 'address' ? 'col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <input
                  type={f.type}
                  className="input"
                  required={f.required}
                  value={form[f.name] || ''}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                />
              </div>
            ))}
            <div className="col-span-2 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Register Shop'}
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
