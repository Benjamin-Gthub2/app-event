import { useState } from "react";
import Login from "../components/Login/Login";
import Register from "../components/Register/Register";
import "../styles/login.css";

export default function LoginPage() {
    const [view, setView] = useState<'login' | 'register'>('login');

    return (
        <div>
            {view === 'login'
                ? <Login />
                : <Register onShowLogin={() => setView('login')} />
            }
        </div>
    );
}