
import React from 'react';

interface FormSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, description, children }) => {
    return (
        <section className="bg-black/20 p-6 rounded-2xl border border-white/10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-neutral-100 mb-1">{title}</h2>
            <p className="text-neutral-400 mb-6">{description}</p>
            <div className="space-y-5">
                {children}
            </div>
        </section>
    )
}

export default FormSection;
