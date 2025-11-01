import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-2">{label}</label>}
      <input
        id={id}
        className="w-full px-4 py-3 bg-transparent border-none rounded-lg text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all neumorphic-concave"
        {...props}
      />
    </div>
  );
};

export default InputField;