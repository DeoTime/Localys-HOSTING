'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Menu, createMenu, updateMenu } from '@/lib/supabase/profiles';

interface MenuModalProps {
  userId: string;
  businessId?: string;
  menu: Menu | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function MenuModal({ userId, businessId, menu, isOpen, onClose, onSave }: MenuModalProps) {
  const { t } = useTranslation();
  const [menuName, setMenuName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or menu changes
  useEffect(() => {
    if (isOpen) {
      if (menu) {
        setMenuName(menu.menu_name);
        setDescription(menu.description || '');
        setCategory(menu.category || 'General');
      } else {
        setMenuName('');
        setDescription('');
        setCategory('General');
      }
      setError(null);
    }
  }, [isOpen, menu]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!menuName.trim()) {
        setError(t('menu.menu_name_required') || 'Menu name is required');
        setLoading(false);
        return;
      }

      if (menu) {
        // Update existing menu
        const { error: updateError } = await updateMenu(menu.id, {
          menu_name: menuName,
          description,
          category,
        });

        if (updateError) {
          setError(updateError.message || 'Failed to update menu');
        } else {
          onSave();
        }
      } else {
        // Create new menu
        const { error: createError } = await createMenu(userId, {
          menu_name: menuName,
          description,
          category,
          business_id: businessId,
        });

        if (createError) {
          setError(createError.message || 'Failed to create menu');
        } else {
          onSave();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="menu-modal-title"
    >
      <div className="relative w-full sm:max-w-lg bg-black rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[80vh] sm:max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 id="menu-modal-title" className="text-lg font-semibold text-white">
            {menu ? t('menu.edit_menu') || 'Edit Menu' : t('menu.create_menu') || 'Create Menu'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto bg-gray-900 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Menu Name */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                {t('menu.menu_name') || 'Menu Name'}
              </label>
              <input
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder={t('menu.menu_name_placeholder') || 'e.g., Appetizers, Main Courses'}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                {t('menu.description') || 'Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('menu.description_placeholder') || 'Add a description for this menu section...'}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                {t('menu.category') || 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="General">General</option>
                <option value="Appetizers">Appetizers</option>
                <option value="Main Courses">Main Courses</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
                <option value="Salads">Salads</option>
                <option value="Soups">Soups</option>
                <option value="Sides">Sides</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700 bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading || !menuName.trim()}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('common.saving') || 'Saving...'}
                </span>
              ) : (
                menu ? t('common.update') || 'Update' : t('common.create') || 'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
