import React from 'react';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  id: string;
  button?: React.ReactNode;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ label, id, button, ...props }) => {
  return (
    <div className="relative">
      {label && <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-2">{label}</label>}
      <textarea
        id={id}
        className="w-full px-4 py-3 bg-transparent border-none rounded-lg text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all resize-y neumorphic-concave"
        {...props}
      />
      {button}
    </div>
  );
};

export default TextareaField;