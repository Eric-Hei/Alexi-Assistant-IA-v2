import React, { useState, useEffect } from 'react';
import { Persona, PersonaCategory, PersonaFormData } from '../types';

interface PersonaModalProps {
  isOpen: boolean;
  persona?: Persona | null;
  onClose: () => void;
  onSave: (data: PersonaFormData) => void;
  onDelete?: (persona: Persona) => void;
  onSetDefault?: (persona: Persona) => void;
}

const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  persona,
  onClose,
  onSave,
  onDelete,
  onSetDefault,
}) => {
  const [formData, setFormData] = useState<PersonaFormData>({
    name: '',
    prompt: '',
    description: '',
    category: PersonaCategory.OTHER,
    color: '#3B82F6',
    icon: '🤖',
  });

  const [errors, setErrors] = useState<Partial<PersonaFormData>>({});

  useEffect(() => {
    if (persona) {
      setFormData({
        name: persona.name,
        prompt: persona.prompt,
        description: persona.description || '',
        category: persona.category || PersonaCategory.OTHER,
        color: persona.color || '#3B82F6',
        icon: persona.icon || '🤖',
      });
    } else {
      setFormData({
        name: '',
        prompt: '',
        description: '',
        category: PersonaCategory.OTHER,
        color: '#3B82F6',
        icon: '🤖',
      });
    }
    setErrors({});
  }, [persona, isOpen]);

  const getCategoryLabel = (category: PersonaCategory) => {
    const labels = {
      [PersonaCategory.PROFESSIONAL]: 'Professionnel',
      [PersonaCategory.CREATIVE]: 'Créatif',
      [PersonaCategory.EDUCATIONAL]: 'Éducatif',
      [PersonaCategory.ENTERTAINMENT]: 'Divertissement',
      [PersonaCategory.PERSONAL]: 'Personnel',
      [PersonaCategory.TECHNICAL]: 'Technique',
      [PersonaCategory.OTHER]: 'Autre'
    };
    return labels[category] || category;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonaFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.prompt.trim()) {
      newErrors.prompt = 'Le prompt est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleDelete = () => {
    if (persona && onDelete) {
      if (confirm(`Êtes-vous sûr de vouloir supprimer "${persona.name}" ?`)) {
        onDelete(persona);
        onClose();
      }
    }
  };

  const handleSetDefault = () => {
    if (persona && onSetDefault) {
      onSetDefault(persona);
    }
  };

  const predefinedIcons = ['🤖', '👤', '💼', '🎨', '📚', '🎭', '⚙️', '🔬', '💡', '🎯', '🌟', '🚀'];
  const predefinedColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 id="modal-title" className="text-2xl font-bold text-white">
              {persona ? 'Modifier l\'Assistant' : 'Créer un Nouvel Assistant'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Fermer la fenêtre"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="ex: Rédacteur Créatif"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brève description de cet assistant"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as PersonaCategory })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(PersonaCategory).map(category => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Icône
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-20 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-center text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="🤖"
                />
                <span className="text-gray-400">ou choisir :</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {predefinedIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`p-2 rounded-lg text-lg transition-colors ${
                      formData.icon === icon
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Couleur
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-8 gap-2">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.color === color
                        ? 'border-white scale-110'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prompt Système *
              </label>
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                rows={6}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.prompt ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Définissez la personnalité et le comportement de cet assistant IA..."
              />
              {errors.prompt && <p className="text-red-400 text-sm mt-1">{errors.prompt}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex space-x-2">
                {persona && onDelete && !persona.isDefault && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Supprimer
                  </button>
                )}
                {persona && onSetDefault && !persona.isDefault && (
                  <button
                    type="button"
                    onClick={handleSetDefault}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Définir par défaut
                  </button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {persona ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonaModal;
