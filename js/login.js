const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

async function checkExistingSession() {
    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
        window.location.href = "dashboard.html";
    }
}

checkExistingSession();

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    loginMessage.textContent = "";

    const email = document.querySelector('input[type="email"]').value.trim();
    const password = document.querySelector('input[type="password"]').value;

    const button = loginForm.querySelector("button");
    button.disabled = true;
    button.textContent = "Entrando...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        loginMessage.textContent = "E-mail ou senha inválidos.";
        button.disabled = false;
        button.textContent = "Entrar";
        return;
    }

    const user = data.user;

    const { data: perfil } = await supabaseClient
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

    if (perfil && perfil.primeiro_acesso === true) {
        window.location.href = "conta.html";
        return;
    }
    

    window.location.href = "dashboard.html";
});