import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import Register from "../components/Register/Register.tsx";

export default function RegisterPage() {
    const navigate = useNavigate();

    return (
        <div>
            <Register onShowLogin={() => navigate('/')} />
        </div>
    );
}