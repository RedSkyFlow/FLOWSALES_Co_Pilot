
'use client';

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface InputWithLabelProps {
    id: string;
    label: string;
    type?: string;
    register?: UseFormRegisterReturn;
    error?: FieldError;
    useTextarea?: boolean;
    children?: React.ReactNode;
    placeholder?: string;
}

export function InputWithLabel({ id, label, type = 'text', register, error, useTextarea = false, children, placeholder }: InputWithLabelProps) {
    const InputComponent = useTextarea ? Textarea : Input;
    const inputProps = {
        id,
        type: useTextarea ? undefined : type,
        placeholder,
        className: error ? 'border-destructive' : '',
        ...register,
    };

    return (
        <div className="space-y-1">
            <Label htmlFor={id}>{label}</Label>
            {children ? children : <InputComponent {...inputProps} />}
            {error && <p className="text-destructive text-xs mt-1">{error.message}</p>}
        </div>
    );
}
