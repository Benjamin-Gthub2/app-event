type Props = {
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
};

export default function Input({
                                  label,
                                  type = "text",
                                  value,
                                  onChange,
                                  error,
                              }: Props) {
    return (
        <div className="input-group">
            <label>{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {error && <span className="error">{error}</span>}
        </div>
    );
}