import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const HANDWRITING_FONTS = [
  'Caveat',
  'Patrick Hand',
  'Indie Flower',
  'Kalam',
];

export default function HandwrittenRenderer({ note, cleanMode = false, onCleanModeChange }) {
  const [currentFont] = useState(HANDWRITING_FONTS[0]);

  const renderCornellStyle = () => (
    <div className="space-y-8">
      {note.sections.map((section, index) => (
        <div key={index} className="border-2 border-gray-300 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-100 px-4 py-2 border-b-2 border-gray-300">
            <h2 className={`text-xl font-bold ${!cleanMode ? 'handwritten-heading' : ''}`}>
              {section.heading}
            </h2>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-12 min-h-[200px]">
            {/* Cue Column (30%) */}
            <div className="col-span-4 border-r-2 border-gray-300 p-4 bg-yellow-50/30">
              {section.marginNote && (
                <div className={`text-sm ${!cleanMode ? 'handwritten-text' : ''}`}>
                  <p className="font-semibold text-primary mb-2">Key Points:</p>
                  <p>{section.marginNote}</p>
                </div>
              )}
            </div>

            {/* Notes Column (70%) */}
            <div className="col-span-8 p-4 lined-paper">
              <div className={!cleanMode ? 'handwritten-text' : ''}>
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Summary Section */}
      {note.quickReview && note.quickReview.length > 0 && (
        <div className="border-2 border-gray-300 rounded-lg p-4 bg-blue-50/30">
          <h3 className={`text-lg font-bold mb-3 ${!cleanMode ? 'handwritten-heading' : ''}`}>
            Summary
          </h3>
          <ul className={`space-y-2 ${!cleanMode ? 'handwritten-text' : ''}`}>
            {note.quickReview.map((point, index) => (
              <li key={index} className="flex gap-2">
                <span>•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderOutlineStyle = () => (
    <div className="lined-paper p-6 rounded-lg border-2 border-gray-300">
      <h1 className={`text-2xl font-bold mb-6 ${!cleanMode ? 'handwritten-heading' : ''}`}>
        {note.title}
      </h1>

      <div className="space-y-6">
        {note.sections.map((section, index) => (
          <div key={index} className="relative">
            <h2 className={`text-xl font-semibold mb-3 ${!cleanMode ? 'handwritten-heading' : ''}`}>
              {section.heading}
            </h2>

            <div className={`ml-4 ${!cleanMode ? 'handwritten-text' : ''}`}>
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>

            {section.marginNote && (
              <div className="mt-2 ml-4 p-2 bg-yellow-100/50 border-l-4 border-yellow-400 rounded">
                <p className={`text-sm italic ${!cleanMode ? 'handwritten-text' : ''}`}>
                  💡 {section.marginNote}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {note.quickReview && note.quickReview.length > 0 && (
        <div className="mt-8 pt-6 border-t-2 border-gray-300">
          <h3 className={`text-lg font-bold mb-3 ${!cleanMode ? 'handwritten-heading' : ''}`}>
            Quick Review
          </h3>
          <ul className={`space-y-2 ${!cleanMode ? 'handwritten-text' : ''}`}>
            {note.quickReview.map((point, index) => (
              <li key={index}>• {point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderFlowStyle = () => (
    <div className="graph-paper p-6 rounded-lg border-2 border-gray-300">
      <h1 className={`text-2xl font-bold mb-6 text-center ${!cleanMode ? 'handwritten-heading' : ''}`}>
        {note.title}
      </h1>

      <div className="space-y-8">
        {note.sections.map((section, index) => (
          <div key={index} className="relative">
            <div className="inline-block border-2 border-primary rounded-lg px-4 py-2 bg-white">
              <h2 className={`text-lg font-semibold ${!cleanMode ? 'handwritten-heading' : ''}`}>
                {section.heading}
              </h2>
            </div>

            {index < note.sections.length - 1 && (
              <div className="flex items-center justify-center my-2">
                <span className="text-2xl text-primary">↓</span>
              </div>
            )}

            <div className={`mt-3 ml-8 ${!cleanMode ? 'handwritten-text' : ''}`}>
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>

            {section.marginNote && (
              <div className="mt-2 ml-8 flex items-start gap-2">
                <span className="text-primary text-xl">→</span>
                <p className={`text-sm italic bg-blue-100/50 px-3 py-1 rounded ${!cleanMode ? 'handwritten-text' : ''}`}>
                  {section.marginNote}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderBulletStyle = () => (
    <div className="dotted-paper p-6 rounded-lg border-2 border-gray-300">
      <h1 className={`text-2xl font-bold mb-6 ${!cleanMode ? 'handwritten-heading' : ''}`}>
        {note.title}
      </h1>

      <div className="space-y-6">
        {note.sections.map((section, index) => (
          <div key={index}>
            <h2 className={`text-lg font-semibold mb-2 ${!cleanMode ? 'handwritten-heading' : ''}`}>
              {section.heading}
            </h2>

            <div className={`ml-4 ${!cleanMode ? 'handwritten-text' : ''}`}>
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>

            {section.marginNote && (
              <div className="mt-2 ml-4 flex items-start gap-2">
                <span className="text-yellow-600">★</span>
                <p className={`text-sm ${!cleanMode ? 'handwritten-text' : ''}`}>
                  {section.marginNote}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {note.quickReview && note.quickReview.length > 0 && (
        <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
          <h3 className={`text-lg font-bold mb-3 ${!cleanMode ? 'handwritten-heading' : ''}`}>
            ⚡ Quick Review
          </h3>
          <ul className={`space-y-2 ${!cleanMode ? 'handwritten-text' : ''}`}>
            {note.quickReview.map((point, index) => (
              <li key={index} className="flex gap-2">
                <span>○</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderFormulas = () => {
    if (!note.formulas || note.formulas.length === 0) return null;

    return (
      <Card className="p-4 mt-6 bg-purple-50/30">
        <h3 className={`text-lg font-bold mb-3 ${!cleanMode ? 'handwritten-heading' : ''}`}>
          📐 Key Formulas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {note.formulas.map((formula, index) => (
            <div
              key={index}
              className={`p-3 bg-white rounded border border-purple-200 ${!cleanMode ? 'handwritten-text' : ''}`}
            >
              <code className="text-sm">{formula}</code>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderByStyle = () => {
    switch (note.style) {
      case 'CORNELL':
        return renderCornellStyle();
      case 'OUTLINE':
        return renderOutlineStyle();
      case 'FLOW':
        return renderFlowStyle();
      case 'BULLET':
        return renderBulletStyle();
      default:
        return renderOutlineStyle();
    }
  };

  return (
    <div>
      {/* Clean Mode Toggle */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <Label htmlFor="clean-mode" className="text-sm">
          Clean Mode
        </Label>
        <Switch
          id="clean-mode"
          checked={cleanMode}
          onCheckedChange={onCleanModeChange}
        />
      </div>

      {/* Handwriting Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Patrick+Hand&family=Indie+Flower&family=Kalam:wght@400;700&display=swap');

        .handwritten-text {
          font-family: '${currentFont}', cursive;
          font-size: 1.1rem;
          line-height: 1.8;
          transform: rotate(-0.3deg);
        }

        .handwritten-heading {
          font-family: '${currentFont}', cursive;
          transform: rotate(-0.5deg);
        }

        .lined-paper {
          background-image: linear-gradient(transparent, transparent calc(1.5rem - 1px), #e5e7eb 1.5rem);
          background-size: 100% 1.5rem;
        }

        .graph-paper {
          background-image: 
            linear-gradient(#e5e7eb 1px, transparent 1px),
            linear-gradient(90deg, #e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .dotted-paper {
          background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Render note content */}
      {renderByStyle()}

      {/* Formulas */}
      {renderFormulas()}
    </div>
  );
}
