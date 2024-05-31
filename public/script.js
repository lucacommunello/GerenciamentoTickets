function buscarAtendimentoPorNumero() {
    const numeroAtendimento = document.getElementById('numero-atendimento').value;
    fetch(`/api/tratativa_atendimento/${numeroAtendimento}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const infoAtendimento = document.getElementById('info-atendimento');
          infoAtendimento.innerHTML = ''; // Limpa o conteúdo anterior
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
            if (atendimento.nome_analista) {
              analistaInfo += `<p>Analista: ${atendimento.nome_analista}</p>`;
            }
            let comentarioInfo = '';
            if (atendimento.ultimo_comentario) {
              comentarioInfo += `<p>Último Comentário: ${atendimento.ultimo_comentario}</p>`;
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
      const infoAtendimento = document.getElementById('info-atendimento');
      infoAtendimento.innerHTML = ''; // Limpa o conteúdo anterior

      if (Array.isArray(data) && data.length > 0) {
        infoAtendimento.innerHTML = '<h2>Atendimentos Sem Analista</h2>';
        data.forEach(atendimento => {
          const dataAberturaFormatada = formatarData(new Date(atendimento.data_abertura));
          const dataUltimaAtualizacaoFormatada = formatarData(new Date(atendimento.data_ultima_atualizacao));

          let analistaInfo = '<p>Analista: Nenhum</p>';
          let comentarioInfo = `<p>Último Comentário: ${atendimento.ultimo_comentario || 'Nenhum comentário'}</p>`;

          infoAtendimento.innerHTML += `
            <div class="atendimento">
              <p>Número do Atendimento: ${atendimento.numero_atendimento}</p>
              <p>CNPJ: ${atendimento.cnpj}</p>
              <p>Data de Abertura: ${dataAberturaFormatada}</p>
              <p>Data da Última Atualização: ${dataUltimaAtualizacaoFormatada}</p>
              ${analistaInfo}
              ${comentarioInfo}
            </div>
          `;
        });
        infoAtendimento.style.display = 'block';
      } else {
        infoAtendimento.innerHTML = '<p>Nenhum atendimento sem analista encontrado.</p>';
        infoAtendimento.style.display = 'block';
      }
    })
    .catch(error => console.error('Erro ao buscar atendimentos sem analista:', error));
}

  function redirecionarParaPaginaAcessoAnalista() {
          window.location.href = "http://localhost:3000/autenticacao.html";
      }

      document.getElementById('login-form').addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o envio do formulário padrão

        const formData = new FormData(event.target);
        const username = formData.get('username');
        const password = formData.get('password');

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Usuário ou senha incorretos.');
            }
            return response.json();
        })
        .then(data => {
            // Usuário autenticado com sucesso, redirecionar para outra página
            window.location.href = '/acessoAnalista.html';
        })
        .catch(error => {
            // Exibir mensagem de erro
            document.getElementById('error-message').textContent = error.message;
            document.getElementById('error-message').style.display = 'block';
        });
    });

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
  const mes = String(data.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
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