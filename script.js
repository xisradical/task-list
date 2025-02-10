// script.js
document.addEventListener("DOMContentLoaded", () => {
    const dataCompra = document.getElementById("dataCompra");
    const valorTotal = document.getElementById("valorTotal");
    const valorDisponivel = document.getElementById("valorDisponivel");
    const totalGeral = document.getElementById("totalGeral");
    const itensTableBody = document.getElementById("itensTable").getElementsByTagName("tbody")[0];
    const historicoTableBody = document.getElementById("historicoTable").getElementsByTagName("tbody")[0];

    const nomeItemInput = document.getElementById("nomeItem");
    const quantidadeItemInput = document.getElementById("quantidadeItem");
    const precoUnitarioItemInput = document.getElementById("precoUnitarioItem");

    let totalGasto = 0;

    // Pré-seleciona a data atual
    const hoje = new Date().toISOString().split("T")[0];
    dataCompra.value = hoje;

    // Atualiza o valor disponível ao alterar o valor total
    valorTotal.addEventListener("input", () => {
        const valor = parseFloat(valorTotal.value) || 0;
        valorDisponivel.value = (valor - totalGasto).toFixed(2);
    });

    function adicionarItem() {
        const nomeItem = nomeItemInput.value.trim();
        const quantidade = parseFloat(quantidadeItemInput.value);
        const precoUnitario = parseFloat(precoUnitarioItemInput.value);

        if (!nomeItem || isNaN(quantidade) || isNaN(precoUnitario) || quantidade <= 0 || precoUnitario <= 0) {
            alert("Por favor, insira valores válidos.");
            return;
        }

        const totalPorItem = (quantidade * precoUnitario).toFixed(2);
        totalGasto += parseFloat(totalPorItem);
        totalGeral.textContent = totalGasto.toFixed(2);

        const valorTotalDisponivel = parseFloat(valorTotal.value) || 0;
        valorDisponivel.value = (valorTotalDisponivel - totalGasto).toFixed(2);

        const newRow = itensTableBody.insertRow();
        newRow.innerHTML = `
            <td>${nomeItem}</td>
            <td>${quantidade}</td>
            <td>${precoUnitario.toFixed(2)}</td>
            <td>${totalPorItem}</td>
            <td><button onclick="removerItem(this)">X</button></td>
        `;

        // Limpa os campos de entrada
        nomeItemInput.value = "";
        quantidadeItemInput.value = "";
        precoUnitarioItemInput.value = "";
    }

    window.removerItem = function (button) {
        const row = button.parentElement.parentElement;
        const totalPorItem = parseFloat(row.cells[3].textContent);
        totalGasto -= totalPorItem;
        totalGeral.textContent = totalGasto.toFixed(2);

        const valorTotalDisponivel = parseFloat(valorTotal.value) || 0;
        valorDisponivel.value = (valorTotalDisponivel - totalGasto).toFixed(2);

        row.remove();
    };

    function salvarCompra() {
        const data = dataCompra.value;
        const valorTotalCompra = parseFloat(valorTotal.value) || 0;
        const diferenca = (valorTotalCompra - totalGasto).toFixed(2);

        const newRow = historicoTableBody.insertRow();
        newRow.innerHTML = `
            <td>${data}</td>
            <td>${valorTotalCompra.toFixed(2)}</td>
            <td>${totalGasto.toFixed(2)}</td>
            <td>${diferenca}</td>
            <td><button onclick="removerHistorico(this)">Remover</button></td>
        `;

        limparItens();
    }

    window.removerHistorico = function (button) {
        const row = button.parentElement.parentElement;
        row.remove();
    };

    function limparItens() {
        totalGasto = 0;
        totalGeral.textContent = "0.00";
        valorDisponivel.value = valorTotal.value;
        itensTableBody.innerHTML = "";
    }

    function exportarParaExcel() {
        const wb = XLSX.utils.table_to_book(document.getElementById("itensTable"), { sheet: "Itens" });
        XLSX.writeFile(wb, "lista_de_compras.xlsx");
    }

    window.adicionarItem = adicionarItem;
    window.salvarCompra = salvarCompra;
    window.exportarParaExcel = exportarParaExcel;
});