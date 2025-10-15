import React from 'react';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  id: string;
  button?: React.ReactNode;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ label, id, button, ...props }) => {
  return (
    <div className="relative">
      {label && <label htmlFor={id} className="block text-sm font-medium text-neutral-400 mb-2">{label}</label>}
      <textarea
        id={id}
        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all resize-y"
        {...props}
      />
      {button}
    </div>
  );
};

export default TextareaField;