function buscarAtendimentoPorNumero() {
  const numeroAtendimento = document.getElementById('numero-atendimento').value;
  fetch(`/api/tratativa_atendimento/numero/${numeroAtendimento}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao buscar atendimento');
      }
      return response.json();
    })
    .then(data => {
      const infoAtendimento = document.getElementById('info-atendimento');
      infoAtendimento.innerHTML = '';

      if (data.success) {
        const atendimento = data.atendimento;
        const dataAberturaFormatada = formatarData(new Date(atendimento.data_abertura));
        const dataUltimaAtualizacaoFormatada = formatarData(new Date(atendimento.data_ultima_atualizacao));

        let analistaInfo = '';
        if (atendimento.analista_nome) {
          analistaInfo += `<p>Analista: ${atendimento.analista_nome}</p>`;
        }

        let comentarioInfo = '';
        if (atendimento.comentarios && atendimento.comentarios.length > 0) {
          comentarioInfo += `<h2>Comentários</h2>`;
          atendimento.comentarios.forEach(comentario => {
            const dataComentarioFormatada = formatarData(new Date(comentario.data_comentario));
            comentarioInfo += `<p>${dataComentarioFormatada} - ${comentario.analista_nome}: ${comentario.comentario}</p>`;
          });
        }

        infoAtendimento.innerHTML = `
          <h2>Informações do Atendimento</h2>
          <p>Número do Atendimento: ${atendimento.numero_atendimento}</p>
          <p>CNPJ: ${atendimento.cnpj}</p>
          <p>Data de Abertura: ${dataAberturaFormatada}</p>
          <p>Data da Última Atualização: ${dataUltimaAtualizacaoFormatada}</p>
          ${analistaInfo}
          ${comentarioInfo}
        `;

        infoAtendimento.style.display = 'block';
      } else {
        alert('Não foram encontrados atendimentos para o número informado.');
      }
    })
    .catch(error => {
      console.error('Erro na requisição:', error);
      alert('Erro ao buscar atendimento. Verifique o console para mais detalhes.');
    });
}

function buscarAtendimentoPorCNPJ() {
  const cnpj = document.getElementById('cnpj').value;
  fetch(`/api/tratativa_atendimento/cnpj/${cnpj}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao buscar atendimento por CNPJ');
      }
      return response.json();
    })
    .then(data => {
      const infoAtendimento = document.getElementById('info-atendimento');
      infoAtendimento.innerHTML = '';

      if (data.success) {
        const atendimentos = data.atendimentos;
        if (atendimentos.length > 0) {
          atendimentos.forEach(atendimento => {
            const dataAberturaFormatada = formatarData(new Date(atendimento.data_abertura));
            const dataUltimaAtualizacaoFormatada = formatarData(new Date(atendimento.data_ultima_atualizacao));

            let analistaInfo = '';
            if (atendimento.analista_nome) {
              analistaInfo += `<p>Analista: ${atendimento.analista_nome}</p>`;
            }

            let comentarioInfo = '';
            if (atendimento.comentarios && atendimento.comentarios.length > 0) {
              comentarioInfo += `<h2>Comentários</h2>`;
              atendimento.comentarios.forEach(comentario => {
                const dataComentarioFormatada = formatarData(new Date(comentario.data_comentario));
                comentarioInfo += `<p>${dataComentarioFormatada} - ${comentario.analista_nome}: ${comentario.comentario}</p>`;
              });
            }

            infoAtendimento.innerHTML += `
              <h2>Informações do Atendimento</h2>
              <p>Número do Atendimento: ${atendimento.numero_atendimento}</p>
              <p>CNPJ: ${atendimento.cnpj}</p>
              <p>Data de Abertura: ${dataAberturaFormatada}</p>
              <p>Data da Última Atualização: ${dataUltimaAtualizacaoFormatada}</p>
              ${analistaInfo}
              ${comentarioInfo}
            `;
          });
          infoAtendimento.style.display = 'block';
        } else {
          alert('Não foram encontrados atendimentos para o CNPJ informado.');
        }
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('Erro na requisição:', error);
      alert('Erro ao buscar atendimento por CNPJ. Verifique o console para mais detalhes.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const filterButton = document.getElementById('filterButtonSemAnalista');
  filterButton.addEventListener('click', buscarAtendimentoSemAnalista);
});

function buscarAtendimentoSemAnalista() {
  fetch('/api/tratativa_atendimento/analista_nome')
    .then(response => response.json())
    .then(data => {
      const infoAtendimento = document.getElementById('data');
      infoAtendimento.innerHTML = '';

      if (Array.isArray(data.atendimentos) && data.atendimentos.length > 0) {
        const table = document.createElement('table');
        table.innerHTML = `
          <tr>
            <th>Número de Atendimento</th>
            <th>CNPJ</th>
            <th>Data de Abertura</th>
            <th>Data da Última Atualização</th>
            <th>Nome do Analista</th>
            <th>Último Comentário</th>
          </tr>
        `;
        data.atendimentos.forEach(atendimento => {
          const dataAberturaFormatada = formatarData(new Date(atendimento.data_abertura));
          const dataUltimaAtualizacaoFormatada = formatarData(new Date(atendimento.data_ultima_atualizacao));
          const analista = atendimento.analista_nome || 'Nenhum';
          const comentario = atendimento.ultimo_comentario || 'Nenhum comentário';

          table.innerHTML += `
            <tr>
              <td><a href="/detalhes.html?id=${atendimento.id}">${atendimento.numero_atendimento}</a></td>
              <td>${atendimento.cnpj}</td>
              <td>${dataAberturaFormatada}</td>
              <td>${dataUltimaAtualizacaoFormatada}</td>
              <td>${analista}</td>
              <td>${comentario}</td>
            </tr>
          `;
        });
        table.setAttribute('border', '1');
        infoAtendimento.appendChild(table);
      } else {
        infoAtendimento.innerHTML = '<p>Nenhum atendimento sem analista encontrado.</p>';
      }
    })
    .catch(error => console.error('Erro ao buscar atendimentos sem analista:', error));
}

function enviarContato() {
  console.log("Botão Enviar clicado!");
  var form = document.getElementById('contatoForm');
  var formData = new FormData(form);

  fetch('/api/abertura_atendimento', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert(data.message);
    } else {
      alert('Erro ao enviar o contato.');
    }
  })
  .catch(error => {
    console.error(error);
    alert('Erro ao enviar o contato.');
  });
}

function formatarData(data) {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

function redirecionarParaPaginaAutenticacao() {
  window.location.href = "http://localhost:3000/autenticacao.html";
}

function redirecionarParaPaginaAcessoAnalista() {
  window.location.href = "http://localhost:3000/acessoAnalista.html";
}

function redirecionarParaPaginaRelatarProblema() {
  window.location.href = "http://localhost:3000/relatarBug.html";
}

function redirecionarParaPaginaAcompanharResolucao() {
  window.location.href = "http://localhost:3000/acompanharResolucao.html";
}