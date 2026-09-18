# Tratamento completo dos geradores de IA

## Objetivo
Elevar a qualidade de imagem, vídeo, 3D, avatar, logo, texto e música, eliminando qualquer imagem com marca Pollinations e preservando o visual, o mascote, os temas e as ferramentas atuais.

## Implementação

1. **Imagem, avatar, logo e capas sem marca**
   - Remover Pollinations de todos os caminhos visuais, inclusive reservas e quadros de vídeo.
   - Atualizar a geração principal para o modelo padrão atual de imagens da Lovable, com formato correto, qualidade máxima suportada, proporção real e instruções específicas por ferramenta.
   - Manter FAL apenas como provedor secundário já existente, sem adicionar nova API paga.
   - Validar a imagem recebida antes de exibi-la; em falha, mostrar a mensagem real e segura em vez de entregar uma imagem inferior ou marcada.

2. **Vídeo com mais qualidade e continuidade**
   - Melhorar os prompts de cena com identidade fixa do personagem, ambiente, iluminação, câmera e movimento consistentes.
   - Usar o vídeo nativo já configurado quando disponível.
   - Melhorar o vídeo local de reserva com quadros sem marca, enquadramento correto, transições mais suaves e preservação da proporção.
   - Não transformar uma imagem estática marcada em “vídeo”; se não houver quadros válidos, encerrar com erro claro.

3. **3D e demais ferramentas visuais**
   - Melhorar o prompt intermediário do 3D para fundo limpo, objeto inteiro, materiais legíveis e geometria consistente.
   - Remover reservas Pollinations do 3D e do criador de capas.
   - Garantir que cada nova geração substitua corretamente a anterior e libere arquivos temporários do navegador.

4. **Texto, chat, letras e música**
   - Padronizar respostas vazias, cancelamento, erros de conexão, créditos, limite e indisponibilidade.
   - Corrigir a política de tentativas: repetir somente erros temporários (`429`/`5xx`) com espera curta e limitada; não repetir `400`, `401`, `402` ou `403`.
   - Preservar a base de conhecimento musical e os formatos de letras já definidos, sem inserir conteúdo falso quando a IA estiver indisponível.

5. **Confiabilidade geral**
   - Centralizar mensagens de erro dos geradores e impedir novas tentativas automáticas quando a conta estiver sem créditos.
   - Manter os controles, downloads, histórico e salvamento existentes.
   - Implantar as funções alteradas e testar os principais fluxos no navegador em tela pequena e desktop.

## Limite externo importante
Os registros atuais mostram que a conta da IA está retornando **402 — créditos insuficientes**. O código deixará de produzir imagens com marca e ficará pronto para alta qualidade, mas geração por IA não pode ser simultaneamente ilimitada, gratuita e sem provedor financiado. Enquanto não houver créditos, a ferramenta mostrará o bloqueio corretamente; ela não substituirá o resultado por Pollinations.

## Resultado esperado
- Nenhuma imagem exibida ou usada em vídeos conterá a marca Pollinations.
- Imagens e prompts terão qualidade superior quando o provedor estiver disponível.
- Vídeos terão melhor continuidade e composição.
- Todas as ferramentas terão falhas previsíveis, mensagens claras e nenhum resultado falso.
