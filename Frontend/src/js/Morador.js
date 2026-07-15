const form = document.getElementById("formMorador");

form.addEventListener("submit", async function (event) {
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
        andar: Number(andar),
        apartamento
    };

    try {
        const url = window.NexportApi?.registro('/moradores') || 'http://localhost:3002/moradores';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(morador)
        });

        if (response.ok) {
            alert("Morador cadastrado com sucesso!");
            form.reset();
            // Redireciona para a lista de moradores após o cadastro bem-sucedido
            window.location.href = "moradores.html";
        } else {
            const data = await response.json().catch(() => ({}));
            alert("Erro ao cadastrar morador: " + (data.erro || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error("Erro ao cadastrar morador:", error);
        alert("Erro ao conectar com o servidor.");
    }
});