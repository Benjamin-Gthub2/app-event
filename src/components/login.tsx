import { useState, FormEvent, ChangeEvent } from "react";
import "../styles/login.css";

export default function Login() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = {
            email,
            password,
        };

        console.log(data);
        alert("Login enviado 🚀");
    };

    return (
        <div className="login-container">
            <form className="login-card" onSubmit={handleSubmit}>
                <h2>Bienvenido</h2>
                <p className="subtitle">Inicia sesión para continuar</p>

                <div className="input-group">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setEmail(e.target.value)
                        }
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Contraseña</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setPassword(e.target.value)
                        }
                        required
                    />
                </div>

                <button type="submit">Ingresar</button>

                <p className="footer-text">
                    ¿No tienes cuenta? <span>Regístrate</span>
                </p>
            </form>
        </div>
    );
}