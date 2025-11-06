'use client';

import { Service } from '@/lib/types';

interface ServiceCardProps {
  service: Service;
  onTakeTicket: (service: Service) => void;
}

export default function ServiceCard({ service, onTakeTicket }: ServiceCardProps) {
  const getAffluenceColor = (level: string) => {
    switch (level) {
      case 'faible':
        return 'bg-green-100 text-green-800';
      case 'modérée':
        return 'bg-yellow-100 text-yellow-800';
      case 'élevée':
        return 'bg-orange-100 text-orange-800';
      case 'très_élevée':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ouvert':
        return 'bg-green-500';
      case 'fermé':
        return 'bg-red-500';
      case 'en_pause':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="card p-6 hover:scale-[1.02] transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#FFD43B] rounded-lg flex items-center justify-center text-2xl">
            {service.icon === 'hospital' ? '🏥' : 
             service.icon === 'building-columns' ? '🏦' : '🏢'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
            <p className="text-sm text-gray-500">{service.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`}></span>
          <span className="text-sm font-medium text-gray-700 capitalize">
            {service.status}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4">{service.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Temps d'attente</div>
          <div className="text-xl font-bold text-gray-900">
            {service.estimated_wait_time} min
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">File d'attente</div>
          <div className="text-xl font-bold text-gray-900">
            {service.current_queue_size} pers.
          </div>
        </div>
      </div>

      {/* Affluence */}
      <div className="mb-4">
        <span className={`badge ${getAffluenceColor(service.affluence_level)}`}>
          Affluence {service.affluence_level}
        </span>
      </div>

      {/* Horaires */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <span className="mr-2">🕒</span>
        <span>{service.opening_hours}</span>
      </div>

      {/* Location */}
      {service.location && (
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <span className="mr-2">📍</span>
          <span>{service.location.address}</span>
        </div>
      )}

      {/* Documents requis */}
      {service.required_documents.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">Documents requis :</div>
          <div className="space-y-1">
            {service.required_documents.slice(0, 2).map((doc, idx) => (
              <div key={idx} className="flex items-center text-sm text-gray-600">
                <span className="mr-2">
                  {doc.required ? '✅' : '📄'}
                </span>
                <span>{doc.name}</span>
              </div>
            ))}
            {service.required_documents.length > 2 && (
              <div className="text-sm text-gray-500 italic">
                +{service.required_documents.length - 2} autres documents
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => onTakeTicket(service)}
        disabled={service.status !== 'ouvert'}
        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
          service.status === 'ouvert'
            ? 'bg-[#FFD43B] text-gray-900 hover:bg-[#FFC107] hover:shadow-lg'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {service.status === 'ouvert' ? '🎫 Prendre un ticket' : '🔒 Service fermé'}
      </button>
    </div>
  );
}