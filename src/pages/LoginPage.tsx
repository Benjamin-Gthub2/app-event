import LoginForm from "../components/LoginForm";
// import Login from "../components/login";
import "../styles/login.css";

export default function LoginPage() {
    return (
        <div className="login-container">
            <LoginForm />
            {/*<Login />*/}
        </div>
    );
}