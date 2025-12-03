import { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

export default function AddOrganizationModal({ isOpen, onClose, onSuccess }) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    admin_email: '',
    admin_password: '',
    admin_name: '',
    admin_phone: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!apiBaseUrl) {
        throw new Error(
          'API base URL is not configured. Please check your .env file.'
        );
      }

      const accessToken = localStorage.getItem('authToken');
      if (!accessToken) {
        throw new Error('Access token not found. Please login again.');
      }

      const response = await fetch(`${apiBaseUrl}/api/org/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to create organization (${response.status})`
        );
      }

      const data = await response.json();
      console.log('Organization created successfully:', data);

      setSuccess(true);

      setTimeout(() => {
        setFormData({
          name: '',
          description: '',
          logo_url: '',
          admin_email: '',
          admin_password: '',
          admin_name: '',
          admin_phone: '',
        });
        setSuccess(false);
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err.message || 'An error occurred while creating the organization'
      );
      console.error('Error creating organization:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#EF4444',
            borderWidth: '1px',
          }}
        >
          <AlertCircle
            size={20}
            style={{ color: '#EF4444', marginTop: '2px' }}
          />
          <div>
            <p className="font-medium" style={{ color: '#EF4444' }}>
              Error
            </p>
            <p className="text-sm mt-1" style={{ color: '#DC2626' }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {success && (
        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: '#10B981',
            borderWidth: '1px',
          }}
        >
          <CheckCircle
            size={20}
            style={{ color: '#10B981', marginTop: '2px' }}
          />
          <div>
            <p className="font-medium" style={{ color: '#10B981' }}>
              Success
            </p>
            <p className="text-sm mt-1" style={{ color: '#059669' }}>
              Organization created successfully!
            </p>
          </div>
        </div>
      )}

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.text.primary }}
        >
          Organization Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter organization name"
          className="w-full px-4 py-2 rounded-lg border transition-colors"
          style={{
            backgroundColor: colors.bg.primary,
            borderColor: colors.border,
            color: colors.text.primary,
          }}
          required
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.text.primary }}
        >
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter organization description"
          className="w-full px-4 py-2 rounded-lg border transition-colors min-h-[100px]"
          style={{
            backgroundColor: colors.bg.primary,
            borderColor: colors.border,
            color: colors.text.primary,
          }}
          required
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.text.primary }}
        >
          Logo URL (optional)
        </label>
        <input
          type="url"
          name="logo_url"
          value={formData.logo_url}
          onChange={handleInputChange}
          placeholder="https://example.com/logo.png"
          className="w-full px-4 py-2 rounded-lg border transition-colors"
          style={{
            backgroundColor: colors.bg.primary,
            borderColor: colors.border,
            color: colors.text.primary,
          }}
        />
      </div>

      <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
        <h4
          className="text-md font-semibold mb-3"
          style={{ color: colors.text.primary }}
        >
          Admin Details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Admin Name *
            </label>
            <input
              type="text"
              name="admin_name"
              value={formData.admin_name}
              onChange={handleInputChange}
              placeholder="Admin's full name"
              className="w-full px-4 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Admin Email *
            </label>
            <input
              type="email"
              name="admin_email"
              value={formData.admin_email}
              onChange={handleInputChange}
              placeholder="admin@organization.com"
              className="w-full px-4 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Admin Password *
            </label>
            <input
              type="password"
              name="admin_password"
              value={formData.admin_password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Admin Phone *
            </label>
            <input
              type="tel"
              name="admin_phone"
              value={formData.admin_phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          style={{
            backgroundColor: colors.bg.primary,
            color: colors.text.primary,
            border: `1px solid ${colors.border}`,
          }}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading || success}
          className="px-6 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #FF7A3D, #A065F4)',
          }}
        >
          {isLoading ? 'Creating...' : 'Create Organization'}
        </button>
      </div>
    </form>
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: colors.bg.secondary }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: colors.border }}
        >
          <h2
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            Add New Organization
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-opacity-10 rounded-lg transition-colors"
            style={{ color: colors.text.primary }}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">{renderForm()}</div>
      </div>
    </div>
  );
}
