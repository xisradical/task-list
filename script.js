// script.js
document.addEventListener("DOMContentLoaded", () => {
    const dataCompra = document.getElementById("dataCompra");
    const valorTotal = document.getElementById("valorTotal");
    const valorDisponivel = document.getElementById("valorDisponivel");
    const totalGeral = document.getElementById("totalGeral");
    const itensTableBody = document.getElementById("itensTable").getElementsByTagName("tbody")[0];
    const historicoComprasDiv = document.getElementById("historicoCompras");

    const nomeItemInput = document.getElementById("nomeItem");
    const quantidadeItemInput = document.getElementById("quantidadeItem");
    const precoUnitarioItemInput = document.getElementById("precoUnitarioItem");

    let totalGasto = 0;

    // Pré-seleciona a data atual
    const hoje = new Date().toISOString().split("T")[0];
    dataCompra.value = hoje;

    // Carregar dados salvos no localStorage
    carregarDadosSalvos();

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

        const newRow = itensTableBody.insertRow();
        const totalPorItem = (quantidade * precoUnitario).toFixed(2);
        totalGasto += parseFloat(totalPorItem);
        totalGeral.textContent = totalGasto.toFixed(2);

        const valorTotalDisponivel = parseFloat(valorTotal.value) || 0;
        valorDisponivel.value = (valorTotalDisponivel - totalGasto).toFixed(2);

        newRow.innerHTML = `
            <td>${nomeItem}</td>
            <td><input type="number" class="quantidade-editavel" value="${quantidade}" min="1" onchange="atualizarCalculo(this)"></td>
            <td><input type="number" class="preco-editavel" value="${precoUnitario.toFixed(2)}" step="0.01" min="0.01" onchange="atualizarCalculo(this)"></td>
            <td class="total-item">${totalPorItem}</td>
            <td><input type="checkbox" class="promocao-checkbox"></td>
            <td><button onclick="removerItem(this)">X</button></td>
        `;

        // Limpa os campos de entrada
        nomeItemInput.value = "";
        quantidadeItemInput.value = "";
        precoUnitarioItemInput.value = "";

        // Salvar dados no localStorage
        salvarDadosNoLocalStorage();
    }

    window.atualizarCalculo = function (element) {
        const row = element.parentElement.parentElement;
        const quantidade = parseFloat(row.querySelector(".quantidade-editavel").value) || 0;
        const precoUnitario = parseFloat(row.querySelector(".preco-editavel").value) || 0;
        const totalPorItem = (quantidade * precoUnitario).toFixed(2);

        const totalAntigo = parseFloat(row.querySelector(".total-item").textContent) || 0;
        const diferenca = parseFloat(totalPorItem) - totalAntigo;

        totalGasto += diferenca;
        totalGeral.textContent = totalGasto.toFixed(2);

        const valorTotalDisponivel = parseFloat(valorTotal.value) || 0;
        valorDisponivel.value = (valorTotalDisponivel - totalGasto).toFixed(2);

        row.querySelector(".total-item").textContent = totalPorItem;

        // Salvar dados no localStorage
        salvarDadosNoLocalStorage();
    };

    window.removerItem = function (button) {
        const row = button.parentElement.parentElement;
        const totalPorItem = parseFloat(row.querySelector(".total-item").textContent) || 0;
        totalGasto -= totalPorItem;
        totalGeral.textContent = totalGasto.toFixed(2);

        const valorTotalDisponivel = parseFloat(valorTotal.value) || 0;
        valorDisponivel.value = (valorTotalDisponivel - totalGasto).toFixed(2);

        row.remove();

        // Salvar dados no localStorage
        salvarDadosNoLocalStorage();
    };

    function salvarCompra() {
        const data = dataCompra.value;
        const valorTotalCompra = parseFloat(valorTotal.value) || 0;
        const diferenca = (valorTotalCompra - totalGasto).toFixed(2);

        const compraDiv = document.createElement("div");
        compraDiv.className = "historico-compra";

        const headerDiv = document.createElement("div");
        headerDiv.className = "historico-compra-header";
        headerDiv.innerHTML = `
            <div>
                Data: ${data} | Valor Total: R$${valorTotalCompra.toFixed(2)} | 
                Total Geral: R$${totalGasto.toFixed(2)} | Diferença: R$${diferenca}
            </div>
            <button onclick="removerHistorico(this)">Remover</button>
        `;

        const detalhesDiv = document.createElement("div");
        detalhesDiv.className = "historico-compra-detalhes";
        detalhesDiv.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Nome do Item</th>
                        <th>Quantidade</th>
                        <th>Preço Unitário (R$)</th>
                        <th>Total por Item (R$)</th>
                        <th>Promoção</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from(itensTableBody.rows).map(row => `
                        <tr>
                            <td>${row.cells[0].textContent}</td>
                            <td>${row.cells[1].querySelector(".quantidade-editavel").value}</td>
                            <td>${row.cells[2].querySelector(".preco-editavel").value}</td>
                            <td>${row.cells[3].textContent}</td>
                            <td>${row.cells[4].querySelector(".promocao-checkbox").checked ? "Sim" : "Não"}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

        headerDiv.addEventListener("click", () => {
            detalhesDiv.style.display = detalhesDiv.style.display === "none" ? "block" : "none";
        });

        compraDiv.appendChild(headerDiv);
        compraDiv.appendChild(detalhesDiv);
        historicoComprasDiv.appendChild(compraDiv);

        // Salvar histórico no localStorage
        salvarHistoricoNoLocalStorage();
    }

    window.removerHistorico = function (button) {
        const compraDiv = button.parentElement.parentElement;
        compraDiv.remove();

        // Salvar histórico no localStorage
        salvarHistoricoNoLocalStorage();
    };

    function limparLista() {
        totalGasto = 0;
        totalGeral.textContent = "0.00";
        valorDisponivel.value = valorTotal.value;
        itensTableBody.innerHTML = "";

        // Limpar dados do localStorage
        localStorage.removeItem("listaDeCompras");
    }

    function exportarParaExcel() {
        const dadosItens = [];
        Array.from(itensTableBody.rows).forEach(row => {
            const nomeItem = row.cells[0].textContent;
            const quantidade = row.cells[1].querySelector(".quantidade-editavel").value;
            const precoUnitario = row.cells[2].querySelector(".preco-editavel").value;
            const totalItem = row.cells[3].textContent;
            const promocao = row.cells[4].querySelector(".promocao-checkbox").checked ? "Sim" : "Não";

            dadosItens.push([nomeItem, quantidade, precoUnitario, totalItem, promocao]);
        });

        const wb = XLSX.utils.book_new();
        const wsItens = XLSX.utils.aoa_to_sheet([
            ["Nome do Item", "Quantidade", "Preço Unitário (R$)", "Total por Item (R$)", "Promoção"],
            ...dadosItens
        ]);

        XLSX.utils.book_append_sheet(wb, wsItens, "Itens");
        XLSX.writeFile(wb, "lista_de_compras.xlsx");
    }

    function salvarDadosNoLocalStorage() {
        const dados = [];
        Array.from(itensTableBody.rows).forEach(row => {
            const nomeItem = row.cells[0].textContent;
            const quantidade = row.cells[1].querySelector(".quantidade-editavel").value;
            const precoUnitario = row.cells[2].querySelector(".preco-editavel").value;
            const totalItem = row.cells[3].textContent;
            const promocao = row.cells[4].querySelector(".promocao-checkbox").checked;

            dados.push({ nomeItem, quantidade, precoUnitario, totalItem, promocao });
        });

        localStorage.setItem("listaDeCompras", JSON.stringify(dados));
    }

    function salvarHistoricoNoLocalStorage() {
        const dados = [];
        Array.from(historicoComprasDiv.children).forEach(compraDiv => {
            const headerText = compraDiv.querySelector(".historico-compra-header div").textContent;
            const detalhesRows = compraDiv.querySelector(".historico-compra-detalhes tbody").children;

            const itens = Array.from(detalhesRows).map(row => ({
                nomeItem: row.cells[0].textContent,
                quantidade: row.cells[1].textContent,
                precoUnitario: row.cells[2].textContent,
                totalItem: row.cells[3].textContent,
                promocao: row.cells[4].textContent
            }));

            dados.push({ headerText, itens });
        });

        localStorage.setItem("historicoCompras", JSON.stringify(dados));
    }

    function carregarDadosSalvos() {
        const dadosSalvos = localStorage.getItem("listaDeCompras");
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            dados.forEach(item => {
                const newRow = itensTableBody.insertRow();
                newRow.innerHTML = `
                    <td>${item.nomeItem}</td>
                    <td><input type="number" class="quantidade-editavel" value="${item.quantidade}" min="1" onchange="atualizarCalculo(this)"></td>
                    <td><input type="number" class="preco-editavel" value="${item.precoUnitario}" step="0.01" min="0.01" onchange="atualizarCalculo(this)"></td>
                    <td class="total-item">${item.totalItem}</td>
                    <td><input type="checkbox" class="promocao-checkbox" ${item.promocao ? "checked" : ""}></td>
                    <td><button onclick="removerItem(this)">X</button></td>
                `;

                totalGasto += parseFloat(item.totalItem);
            });

            totalGeral.textContent = totalGasto.toFixed(2);
            const valorTotalDisponivel = parseFloat(valorTotal.value) || 0;
            valorDisponivel.value = (valorTotalDisponivel - totalGasto).toFixed(2);
        }

        const historicoSalvo = localStorage.getItem("historicoCompras");
        if (historicoSalvo) {
            const dados = JSON.parse(historicoSalvo);
            dados.forEach(compra => {
                const compraDiv = document.createElement("div");
                compraDiv.className = "historico-compra";

                const headerDiv = document.createElement("div");
                headerDiv.className = "historico-compra-header";
                headerDiv.innerHTML = `
                    <div>${compra.headerText}</div>
                    <button onclick="removerHistorico(this)">Remover</button>
                `;

                const detalhesDiv = document.createElement("div");
                detalhesDiv.className = "historico-compra-detalhes";
                detalhesDiv.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Nome do Item</th>
                                <th>Quantidade</th>
                                <th>Preço Unitário (R$)</th>
                                <th>Total por Item (R$)</th>
                                <th>Promoção</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${compra.itens.map(item => `
                                <tr>
                                    <td>${item.nomeItem}</td>
                                    <td>${item.quantidade}</td>
                                    <td>${item.precoUnitario}</td>
                                    <td>${item.totalItem}</td>
                                    <td>${item.promocao}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                `;

                headerDiv.addEventListener("click", () => {
                    detalhesDiv.style.display = detalhesDiv.style.display === "none" ? "block" : "none";
                });

                compraDiv.appendChild(headerDiv);
                compraDiv.appendChild(detalhesDiv);
                historicoComprasDiv.appendChild(compraDiv);
            });
        }
    }

    window.adicionarItem = adicionarItem;
    window.salvarCompra = salvarCompra;
    window.exportarParaExcel = exportarParaExcel;
    window.limparLista = limparLista;
});