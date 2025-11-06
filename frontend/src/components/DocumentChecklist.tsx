'use client';

import { Document } from '@/lib/types';
import { useState } from 'react';

interface DocumentChecklistProps {
  documents: Document[];
  showCheckboxes?: boolean;
  compact?: boolean;
}

export default function DocumentChecklist({ 
  documents, 
  showCheckboxes = false,
  compact = false 
}: DocumentChecklistProps) {
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());

  const toggleDocument = (docName: string) => {
    const newChecked = new Set(checkedDocs);
    if (newChecked.has(docName)) {
      newChecked.delete(docName);
    } else {
      newChecked.add(docName);
    }
    setCheckedDocs(newChecked);
  };

  const requiredDocs = documents.filter(d => d.required);
  const optionalDocs = documents.filter(d => !d.required);
  const completionRate = showCheckboxes 
    ? Math.round((checkedDocs.size / documents.length) * 100) 
    : 0;

  if (documents.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <div className="text-4xl mb-2">📄</div>
        <p className="text-sm">Aucun document requis</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec progression si checkboxes actives */}
      {showCheckboxes && (
        <div className="bg-gradient-to-r from-[#FFD43B] to-[#FFC107] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-900">Préparation des documents</span>
            <span className="text-2xl font-bold text-gray-900">{completionRate}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Documents requis */}
      {requiredDocs.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <span className="text-red-500 mr-2">*</span>
            Documents obligatoires ({requiredDocs.length})
          </h3>
          <div className="space-y-2">
            {requiredDocs.map((doc, idx) => (
              <DocumentItem
                key={idx}
                doc={doc}
                isChecked={checkedDocs.has(doc.name)}
                onToggle={() => toggleDocument(doc.name)}
                showCheckbox={showCheckboxes}
                compact={compact}
              />
            ))}
          </div>
        </div>
      )}

      {/* Documents optionnels */}
      {optionalDocs.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center">
            <span className="text-gray-400 mr-2">○</span>
            Documents optionnels ({optionalDocs.length})
          </h3>
          <div className="space-y-2">
            {optionalDocs.map((doc, idx) => (
              <DocumentItem
                key={idx}
                doc={doc}
                isChecked={checkedDocs.has(doc.name)}
                onToggle={() => toggleDocument(doc.name)}
                showCheckbox={showCheckboxes}
                compact={compact}
              />
            ))}
          </div>
        </div>
      )}

      {/* Conseils */}
      {!compact && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Conseil</h4>
              <p className="text-sm text-blue-800">
                Préparez tous vos documents avant de venir pour éviter tout retard.
                Les documents marqués d'une * sont strictement obligatoires.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface DocumentItemProps {
  doc: Document;
  isChecked: boolean;
  onToggle: () => void;
  showCheckbox: boolean;
  compact: boolean;
}

function DocumentItem({ doc, isChecked, onToggle, showCheckbox, compact }: DocumentItemProps) {
  return (
    <div 
      className={`flex items-start space-x-3 rounded-lg p-3 transition-all ${
        isChecked 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
      } ${showCheckbox ? 'cursor-pointer' : ''}`}
      onClick={showCheckbox ? onToggle : undefined}
    >
      {showCheckbox ? (
        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
          isChecked 
            ? 'bg-green-500 border-green-500' 
            : 'bg-white border-gray-300'
        }`}>
          {isChecked && <span className="text-white text-sm">✓</span>}
        </div>
      ) : (
        <span className="text-2xl">
          {doc.required ? '✅' : '📄'}
        </span>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className={`font-semibold ${
            isChecked ? 'text-green-900 line-through' : 'text-gray-900'
          }`}>
            {doc.name}
          </span>
          {doc.required && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-semibold">
              Obligatoire
            </span>
          )}
        </div>
        {doc.description && !compact && (
          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
        )}
      </div>
    </div>
  );
}