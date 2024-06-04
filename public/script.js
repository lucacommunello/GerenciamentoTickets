function buscarAtendimentoPorNumero() {
    const numeroAtendimento = document.getElementById('numero-atendimento').value;
    fetch(`/api/tratativa_atendimento/numero/${numeroAtendimento}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const infoAtendimento = document.getElementById('info-atendimento');
          infoAtendimento.innerHTML = ''; 
          data.atendimentos.forEach(atendimento => {
            const dataAberturaFormatada = formatarData(new Date(atendimento.data_abertura));
            const dataUltimaAtualizacaoFormatada = formatarData(new Date(atendimento.data_ultima_atualizacao));
  
            let analistaInfo = '';
            if (atendimento.analista_nome) {
              analistaInfo += `<p>Analista: ${atendimento.analista_nome}</p>`;
            }
            let comentarioInfo = '';
            if (atendimento.ultimo_comentario) {
              comentarioInfo += `<p>Comentário: ${atendimento.ultimo_comentario}</p>`;
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
          alert(data.message);
        }
      })
      .catch(error => console.error(error));
  }
  
  function buscarAtendimentoPorCNPJ() {
    const cnpj = document.getElementById('cnpj').value;
    fetch(`/api/tratativa_atendimento/cnpj/${cnpj}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const infoAtendimento = document.getElementById('info-atendimento');
          infoAtendimento.innerHTML = ''; 
          data.atendimentos.forEach(atendimento => {
            const dataAberturaFormatada = formatarData(new Date(atendimento.data_abertura));
            const dataUltimaAtualizacaoFormatada = formatarData(new Date(atendimento.data_ultima_atualizacao));
  
            let analistaInfo = '';
            if (atendimento.analista_nome) {
              analistaInfo += `<p>Analista: ${atendimento.analista_nome}</p>`;
            }
            let comentarioInfo = '';
            if (atendimento.ultimo_comentario) {
              comentarioInfo += `<p>Comentário: ${atendimento.ultimo_comentario}</p>`;
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
          alert(data.message);
        }
      })
      .catch(error => console.error(error));
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
                  const dataAberturaFormatada = formatarData(atendimento.data_abertura);
                  const dataUltimaAtualizacaoFormatada = formatarData(atendimento.data_ultima_atualizacao);
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
      function redirecionarParaPaginaAcessoAnalista() {
            window.location.href = "http://localhost:3000/autenticacao.html";
        }

        function redirecionarParaPaginaRelatarProblema() {
            window.location.href = "http://localhost:3000/relatarBug.html";
        }
        function redirecionarParaPaginaAcompanharResolucao() {
            window.location.href = "http://localhost:3000/acompanharResolucao.html";
        }