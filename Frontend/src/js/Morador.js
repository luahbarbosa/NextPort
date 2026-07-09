const form = document.getElementById("formMorador");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const andar = document.getElementById("andar").value;
    const apartamento = document.getElementById("apartamento").value.trim();

    if (!nome || !cpf || !email || !senha || !andar || !apartamento) {
        alert("Preencha todos os campos.");
        return;
    }

    const morador = {
        nome,
        cpf,
        email,
        senha,
        andar,
        apartamento
    };

    console.log("Morador cadastrado:", morador);

    alert("Morador cadastrado com sucesso!");

    form.reset();
});