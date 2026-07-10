# Batalha Naval (Battleship)

Jogo de Batalha Naval feito do zero com React, TypeScript e Vite. Jogador contra computador (IA simples de caça e alvo).

## Como jogar

1. Posicione sua frota manualmente clicando no tabuleiro (use o botão de orientação para girar o navio) ou clique em **Posicionar aleatoriamente**.
2. Clique em **Iniciar Batalha**.
3. Clique nas células do tabuleiro inimigo para atirar. Acerto, erro e navio afundado são indicados na tela.
4. O computador joga logo em seguida. Vence quem afundar toda a frota adversária primeiro.

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

## Estrutura

- `src/game/types.ts` — tipos e especificação dos navios
- `src/game/board.ts` — criação do tabuleiro, posicionamento e lógica de tiro
- `src/game/ai.ts` — IA do computador (caça e alvo: atira aleatoriamente até acertar, depois foca nas células vizinhas)
- `src/components/BoardGrid.tsx` — grade do tabuleiro
- `src/App.tsx` — telas de posicionamento, batalha e fim de jogo
