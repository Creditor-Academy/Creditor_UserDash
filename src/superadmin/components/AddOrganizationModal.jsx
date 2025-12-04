import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

export default function AddOrganizationModal({
  isOpen,
  onClose,
  onSuccess,
  editingOrg = null,
}) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const isEditMode = !!editingOrg;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    monthly_price: '',
    annual_price: '',
    user_limit: '',
    storage_limit: '',
    credit: '',
    status: 'ACTIVE',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load editing org data when modal opens
  useEffect(() => {
    if (isEditMode && editingOrg) {
      setFormData({
        name: editingOrg.name || '',
        description: editingOrg.description || '',
        logo_url: editingOrg.logo_url || '',
        monthly_price: editingOrg.monthly_price || '',
        annual_price: editingOrg.annual_price || '',
        user_limit: editingOrg.user_limit || '',
        storage_limit: editingOrg.storage_limit || '',
        credit: editingOrg.credit || '',
        status: editingOrg.status || 'ACTIVE',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        logo_url: '',
        monthly_price: '',
        annual_price: '',
        user_limit: '',
        storage_limit: '',
        credit: '',
        status: 'ACTIVE',
      });
    }
    setError(null);
    setSuccess(false);
  }, [isOpen, editingOrg, isEditMode]);

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

      const accessToken =
        localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!accessToken) {
        throw new Error('Access token not found. Please login again.');
      }

      let url, method, successMessage;

      if (isEditMode) {
        url = `${apiBaseUrl}/api/org/orgUpdate/${editingOrg.id}`;
        method = 'PUT';
        successMessage = 'Organization updated successfully!';
      } else {
        url = `${apiBaseUrl}/api/org/create`;
        method = 'POST';
        successMessage = 'Organization created successfully!';
      }

      const response = await fetch(url, {
        method,
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
            `Failed to ${isEditMode ? 'update' : 'create'} organization (${response.status})`
        );
      }

      const data = await response.json();
      console.log(
        `Organization ${isEditMode ? 'updated' : 'created'} successfully:`,
        data
      );

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
        err.message ||
          `An error occurred while ${isEditMode ? 'updating' : 'creating'} the organization`
      );
      console.error(
        `Error ${isEditMode ? 'updating' : 'creating'} organization:`,
        err
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          className="p-4 rounded-lg flex items-start gap-3 animate-pulse"
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
              Organization {isEditMode ? 'updated' : 'created'} successfully!
            </p>
          </div>
        </div>
      )}

      <div>
        <label
          className="block text-sm font-semibold mb-2 uppercase tracking-wider"
          style={{ color: colors.text.secondary }}
        >
          Organization Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter organization name"
          className="w-full px-4 py-3 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-offset-0"
          style={{
            backgroundColor: colors.bg.primary,
            borderColor: colors.border,
            color: colors.text.primary,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#3B82F6')}
          onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
          required
        />
      </div>

      <div>
        <label
          className="block text-sm font-semibold mb-2 uppercase tracking-wider"
          style={{ color: colors.text.secondary }}
        >
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter organization description"
          className="w-full px-4 py-3 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-offset-0 min-h-[100px] resize-none"
          style={{
            backgroundColor: colors.bg.primary,
            borderColor: colors.border,
            color: colors.text.primary,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#3B82F6')}
          onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
          required
        />
      </div>

      <div>
        <label
          className="block text-sm font-semibold mb-2 uppercase tracking-wider"
          style={{ color: colors.text.secondary }}
        >
          Logo URL (optional)
        </label>
        <input
          type="url"
          name="logo_url"
          value={formData.logo_url}
          onChange={handleInputChange}
          placeholder="https://example.com/logo.png"
          className="w-full px-4 py-3 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-offset-0"
          style={{
            backgroundColor: colors.bg.primary,
            borderColor: colors.border,
            color: colors.text.primary,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#3B82F6')}
          onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
        />
      </div>

      {/* Pricing & Limits Section */}
      <div className="pt-6 border-t" style={{ borderColor: colors.border }}>
        <h4
          className="text-lg font-bold mb-4 uppercase tracking-wider"
          style={{ color: colors.text.primary }}
        >
          Pricing & Limits
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Monthly Price */}
          <div>
            <label
              className="block text-sm font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors.text.secondary }}
            >
              Monthly Price (optional)
            </label>
            <input
              type="number"
              name="monthly_price"
              value={formData.monthly_price}
              onChange={handleInputChange}
              placeholder="999.99"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-offset-0"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3B82F6')}
              onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
            />
          </div>

          {/* Annual Price */}
          <div>
            <label
              className="block text-sm font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors.text.secondary }}
            >
              Annual Price (optional)
            </label>
            <input
              type="number"
              name="annual_price"
              value={formData.annual_price}
              onChange={handleInputChange}
              placeholder="9999.99"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-offset-0"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3B82F6')}
              onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
            />
          </div>

          {/* User Limit */}
          <div>
            <label
              className="block text-sm font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors.text.secondary }}
            >
              User Limit (optional)
            </label>
            <input
              type="number"
              name="user_limit"
              value={formData.user_limit}
              onChange={handleInputChange}
              placeholder="100"
              min="0"
              className="w-full px-4 py-3 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-offset-0"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3B82F6')}
              onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
            />
          </div>

          {/* Storage Limit */}
          <div>
            <label
              className="block text-sm font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors.text.secondary }}
            >
              Storage Limit in Bytes (optional)
            </label>
            <input
              type="number"
              name="storage_limit"
              value={formData.storage_limit}
              onChange={handleInputChange}
              placeholder="1000000000"
              min="0"
              className="w-full px-4 py-3 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-offset-0"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3B82F6')}
              onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
            />
          </div>

          {/* Credits */}
          <div>
            <label
              className="block text-sm font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors.text.secondary }}
            >
              Available Credits (optional)
            </label>
            <input
              type="number"
              name="credit"
              value={formData.credit}
              onChange={handleInputChange}
              placeholder="5000"
              min="0"
              className="w-full px-4 py-3 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-offset-0"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3B82F6')}
              onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
            />
          </div>

          {/* Status */}
          <div>
            <label
              className="block text-sm font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors.text.secondary }}
            >
              Status (optional)
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-offset-0"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3B82F6')}
              onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
            >
              <option value="ACTIVE">Active</option>
              {/* <option value="PENDING">Pending</option> */}
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* <div className="pt-6 border-t" style={{ borderColor: colors.border }}>
        <h4
          className="text-lg font-bold mb-4 uppercase tracking-wider"
          style={{ color: colors.text.primary }}
        >
          Admin Details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label
              className="block text-sm font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors.text.secondary }}
            >
              Admin Name *
            </label>
            <input
              type="text"
              name="admin_name"
              value={formData.admin_name}
              onChange={handleInputChange}
              placeholder="Admin's full name"
              className="w-full px-4 py-3 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-offset-0"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#3B82F6'}
              onBlur={e => e.currentTarget.style.borderColor = colors.border}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors.text.secondary }}
            >
              Admin Email *
            </label>
            <input
              type="email"
              name="admin_email"
              value={formData.admin_email}
              onChange={handleInputChange}
              placeholder="admin@organization.com"
              className="w-full px-4 py-3 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-offset-0"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#3B82F6'}
              onBlur={e => e.currentTarget.style.borderColor = colors.border}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors.text.secondary }}
            >
              {isEditMode ? 'New Password (leave blank to keep current)' : 'Admin Password'} *
            </label>
            <input
              type="password"
              name="admin_password"
              value={formData.admin_password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-offset-0"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#3B82F6'}
              onBlur={e => e.currentTarget.style.borderColor = colors.border}
              required={!isEditMode}
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors.text.secondary }}
            >
              Admin Phone *
            </label>
            <input
              type="tel"
              name="admin_phone"
              value={formData.admin_phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-offset-0"
              style={{
                backgroundColor: colors.bg.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#3B82F6'}
              onBlur={e => e.currentTarget.style.borderColor = colors.border}
              required
            />
          </div>
        </div>
      </div> */}

      <div
        className="flex justify-end gap-3 pt-6 border-t"
        style={{ borderColor: colors.border }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
          style={{
            backgroundColor: colors.bg.primary,
            color: colors.text.primary,
            border: `1px solid ${colors.border}`,
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.backgroundColor = colors.bg.hover)
          }
          onMouseLeave={e =>
            (e.currentTarget.style.backgroundColor = colors.bg.primary)
          }
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading || success}
          className="px-8 py-2.5 rounded-lg text-white font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          style={{
            background: isEditMode
              ? 'linear-gradient(135deg, #10B981, #059669)'
              : 'linear-gradient(135deg, #3B82F6, #2563EB)',
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.transform = 'translateY(-2px)')
          }
          onMouseLeave={e =>
            (e.currentTarget.style.transform = 'translateY(0)')
          }
        >
          {isLoading
            ? isEditMode
              ? 'Updating...'
              : 'Creating...'
            : isEditMode
              ? 'Update Organization'
              : 'Create Organization'}
        </button>
      </div>
    </form>
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: colors.bg.secondary }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-8 border-b"
          style={{
            borderColor: colors.border,
            background: `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)`,
          }}
        >
          <div>
            <h2
              className="text-3xl font-bold"
              style={{ color: colors.text.primary }}
            >
              {isEditMode ? 'Edit Organization' : 'Add New Organization'}
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: colors.text.secondary }}
            >
              {isEditMode
                ? 'Update organization details and admin information'
                : 'Create a new organization with admin credentials'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0 ml-4"
            style={{ color: colors.text.primary }}
            aria-label="Close"
          >
            <X size={28} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8">{renderForm()}</div>
      </div>
    </div>
  );
}
