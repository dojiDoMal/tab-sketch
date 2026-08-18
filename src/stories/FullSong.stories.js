import { renderChord, renderRhythm, renderLyrics, chords } from '../index.js';

export default {
  title: 'FullSong',
};

export const Song = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.padding = '24px';

    // --- Bloco 1: Acordes com capo 3 ---
    const chordsSection = document.createElement('div');
    chordsSection.style.display = 'flex';
    chordsSection.style.flexWrap = 'wrap';

    const songChords = [
      { name: 'G', variant: -1 }, // última variant
      { name: 'C9', variant: 3 },
      { name: 'Cm', variant: 0 },
    ];
    songChords.forEach(({ name, variant }) => {
      const variants = chords[name] || [];
      const idx = variant === -1 ? variants.length - 1 : variant;
      const chordData = variants[idx];
      if (chordData) {
        const container = document.createElement('div');
        renderChord(container, chordData, { capo: 3 });
        chordsSection.appendChild(container);
      }
    });

    wrapper.appendChild(chordsSection);

    // --- Bloco 2: Ritmo 72 bpm ---
    const rhythmSection = document.createElement('div');
    rhythmSection.style.display = 'flex';
    rhythmSection.style.flexWrap = 'wrap';
    renderRhythm(rhythmSection, {
      bpm: 72,
      timeSignature: [4, 4],
      pattern: ['D', '_', '_', 'U', 'X', 'U', 'D', '_', '_', 'U', 'D', 'U', 'X', 'U', 'D', 'U'],
    });
    wrapper.appendChild(rhythmSection);

    // --- Dados da letra (todas as seções) ---
    const lyricsSections = [
      {
        lines: [
          { segments: [{ chord: 'A#', text: 'Mesmo', align: 'flex-start' }, { text: 'que você' }] },
          { segments: [{ text: 'Não caia na minha cantada' }] },
          { segments: [{ text: 'Mesmo que você conheça outro cara' }] },
          { segments: [{ text: 'Na' }, { chord: 'D#9', text: 'fila', align: 'center' }, { text: 'de um banco' }] },
          { segments: [{ text: 'Um tal de Fernando' }] },
          { segments: [{ text: 'Um lance, assim, sem graça' }] },
        ],
      },
      {
        lines: [
          { segments: [{ chord: 'A#', text: 'Mesmo', align: 'flex-start' }, { text: 'que vocês fiquem sem se gostar' }] },
          { segments: [{ text: 'Mesmo que vocês casem sem se amar' }] },
          { segments: [{ text: 'E' }, { chord: 'D#9', text: 'depois', align: 'flex-start' }, { text: 'de seis meses' }] },
          { segments: [{ text: 'Um olhe pro outro' }] },
          { segments: [{ text: 'E aí, pois é, sei lá' }] },
        ],
      },
      {
        lines: [
          { segments: [{ chord: 'A#', text: 'Mesmo', align: 'flex-start' }, { text: 'que você suporte este casamento' }] },
          { segments: [{ text: 'Por causa dos filhos, por muito tempo' }] },
          { segments: [{ chord: 'D#9', text: 'Dez', align: 'flex-end' }, { text: ', vinte, trinta anos' }] },
          { segments: [{ text: 'Até se assustar' }] },
          { segments: [{ text: 'Com os seus cabelos brancos' }] },
        ],
      },
      {
        lines: [
          { segments: [{ text: 'Um' }, { chord: 'A#', text: 'dia', align: 'center' }, { text: 'vai sentar' }] },
          { segments: [{ text: 'Numa cadeira de balanço' }] },
          { segments: [{ text: 'Vai lembrar do tempo' }] },
          { segments: [{ text: 'Que tinha vinte anos' }] },
          { segments: [{ chord: 'D#9', text: 'Vai', align: 'flex-end' }, { text: 'lembrar de mim e se perguntar' }] },
          { segments: [{ text: 'Por onde esse cara deve estar' }] },
        ],
      },
      {
        lines: [
          { segments: [{ text: 'E eu vou' }, { chord: 'A#', text: 'estar', align: 'flex-end' }] },
          { segments: [{ text: 'Te esperando' }] },
          { segments: [{ text: 'Nem que já esteja velhinha' }, { chord: 'D#9', text: 'gagá', align: 'center' }] },
          { segments: [{ text: 'Com noventa, viúva, sozinha' }] },
          { segments: [{ text: 'Não vou me' }, { chord: 'A#', text: 'importar', align: 'center' }] },
          { segments: [{ text: 'Vou ligar' }] },
          { segments: [{ text: 'Te chamar pra sair namorar no' }, { chord: 'D#9', text: 'sofá', align: 'center' }] },
          { segments: [{ text: 'Nem que seja além dessa vida' }] },
          { segments: [{ text: 'Eu vou' }, { chord: 'A#', text: 'estar', align: 'flex-end' }] },
          { segments: [{ text: 'Te' }, { chord: ['D#9', 'D#m'], text: 'esperando', align: 'flex-end' }] },
        ],
      },
    ];

    // Renderiza a letra duas vezes (repetição)
    for (let repeat = 0; repeat < 2; repeat++) {
      lyricsSections.forEach((section) => {
        const el = document.createElement('div');
        renderLyrics(el, section);
        wrapper.appendChild(el);
      });
    }

    return wrapper;
  },
};
