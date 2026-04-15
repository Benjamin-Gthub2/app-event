import { useState } from "react";
import Input from "./Input";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!email.includes("@")) {
            newErrors.email = "Email inválido";
        }

        if (password.length < 6) {
            newErrors.password = "Mínimo 6 caracteres";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            alert("Error: credenciales incorrectas");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="login-card" onSubmit={handleSubmit}>
            <h2>Bienvenido</h2>

            <Input
                label="Email"
                value={email}
                onChange={setEmail}
                error={errors.email}
            />

            <div className="input-group">
                <label>Contraseña</label>
                <div className="password-wrapper">
                    <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <span onClick={() => setShowPass(!showPass)}>👁️</span>
                </div>
                {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <button disabled={loading}>
                {loading ? "Cargando..." : "Ingresar"}
            </button>
        </form>
    );
}