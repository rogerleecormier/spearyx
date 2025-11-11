import React from 'react';
import { Body, Caption, Overline } from '@/components/Typography';

export type FormatOption = 'pdf' | 'xlsx' | 'csv' | 'png' | 'pptx';

interface Format {
  id: FormatOption;
  label: string;
  description: string;
  icon: string;
  ext: string;
}

interface FormatSelectorProps {
  selected?: FormatOption;
  onChange?: (format: FormatOption) => void;
  disabled?: boolean;
  showDescriptions?: boolean;
}

const FORMATS: Format[] = [
  {
    id: 'pdf',
    label: 'PDF Document',
    description: 'Professional report with table and legend',
    icon: '📄',
    ext: '.pdf',
  },
  {
    id: 'xlsx',
    label: 'Excel Spreadsheet',
    description: 'Editable spreadsheet with multiple sheets',
    icon: '📊',
    ext: '.xlsx',
  },
  {
    id: 'csv',
    label: 'CSV File',
    description: 'Comma-separated values for data processing',
    icon: '📋',
    ext: '.csv',
  },
  {
    id: 'png',
    label: 'PNG Image',
    description: 'High-resolution image at 96, 150, or 300 DPI',
    icon: '🖼️',
    ext: '.png',
  },
  {
    id: 'pptx',
    label: 'PowerPoint',
    description: 'Presentation with title, matrix, and breakdown',
    icon: '📽️',
    ext: '.pptx',
  },
];

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  selected,
  onChange,
  disabled = false,
  showDescriptions = true,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <Body className="font-semibold text-slate-900">Export Format</Body>
        <Caption className="text-slate-600">
          Choose the format that best fits your needs
        </Caption>
      </div>

      <div className={`grid grid-cols-1 gap-2 ${showDescriptions ? 'sm:grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-5'}`}>
        {FORMATS.map((format) => (
          <button
            key={format.id}
            onClick={() => onChange?.(format.id)}
            disabled={disabled}
            className={`
              flex gap-3 rounded-lg border-2 p-3 text-left transition-all
              ${
                selected === format.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-emerald-300'
              }
              disabled:cursor-not-allowed disabled:opacity-50
            `}
          >
            <span className="flex-shrink-0 text-2xl">{format.icon}</span>
            <div className="flex-1 min-w-0">
              <Body className="font-semibold text-slate-900">
                {format.label}
              </Body>
              {showDescriptions && (
                <Caption className="text-slate-600 line-clamp-2">
                  {format.description}
                </Caption>
              )}
              <Overline className="text-slate-500">{format.ext}</Overline>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FormatSelector;
