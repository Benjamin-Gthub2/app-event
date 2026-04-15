export const login = async (email: string, password: string) => {
    return new Promise<{ token: string }>((resolve, reject) => {
        setTimeout(() => {
            if (email === "admin@test.com" && password === "123456") {
                resolve({ token: "fake-jwt-token" });
            } else {
                reject(new Error("Credenciales inválidas"));
            }
        }, 1000);
    });
};