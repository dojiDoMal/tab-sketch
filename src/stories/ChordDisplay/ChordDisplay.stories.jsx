import React from 'react';
import { Section, ChordDisplay, RhythmDisplay, LyricsDisplay } from '../../components/index.jsx';
import '../../styles.css';

export default {
    title: 'React/ChordDisplay',
    decorators: [
        (Story) => (
            <div style={{ padding: '24px', backgroundColor: '#1a1a1a', minHeight: '200px' }}>
                <Story />
            </div>
        ),
    ],
};

export const ChordDisplayBasic = {
    render: () => (
        <Section capo={3} tuning={-2} chordTitleColor="#35aabb">
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <ChordDisplay chord="G" shapeVariant={-1} />
                <ChordDisplay chord="C9" shapeVariant={3} />
                <ChordDisplay chord="Am" shapeVariant={0} />
                <ChordDisplay chord="Bm" shapeVariant={1} />
            </div>
        </Section>
    ),
};

export const ChordDisplayNoContext = {
    render: () => (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <ChordDisplay chord="G" shapeVariant={-1} />
            <ChordDisplay chord="Am" shapeVariant={0} />
            <ChordDisplay chord="D" shapeVariant={2} titleColor="#ff6b6b" />
        </div>
    ),
};

// --- Full Song ---

const REFRAO_I = `E eu vou [G:-1>]estar

Te esperando

Nem que já esteja velhinha [C9:3]gagá

Com noventa, viúva, sozinha

Não vou me [G:-1]importar

Vou ligar

Te chamar pra sair namorar no [C9:3]sofá

Nem que seja além dessa vida

Eu vou [G:-1>]estar

Te [C9:3|Cm>]esperando`;

const VERSOS_I = [
    `[G:-1<]Mesmo que você

Não caia na minha cantada

Mesmo que você conheça outro cara

Na [C9:3<]fila de um banco

Um tal de Fernando

Um lance, assim, sem graça`,

    `[G:-1<]Mesmo que vocês fiquem sem se gostar

Mesmo que vocês casem sem se amar

E [C9:3<]depois de seis meses

Um olhe pro outro

E aí, pois é, sei lá`,

    `[G:-1<]Mesmo que você suporte este casamento

Por causa dos filhos, por muito tempo

[C9:3>]Dez, vinte, trinta anos

Até se assustar

Com os seus cabelos brancos`,

    `Um [G:-1]dia vai sentar

Numa cadeira de balanço

Vai lembrar do tempo

Que tinha vinte anos

[C9:3>]Vai lembrar de mim e se perguntar

Por onde esse cara deve estar`,
];

const REFRAO_FINAL = `E eu vou [G:-1>]estar

Te esperando

Nem que já esteja velhinha [C9:3]gagá

Com noventa, viúva, sozinha

Não vou me [G:-1]importar

Vou ligar

Te chamar pra sair namorar no [C9:3]sofá

Nem que seja além dessa vida

Eu vou [G:-1>]estar

Te esperando

Nem que já esteja velhinha [C9:3]gagá

Com noventa, viúva, sozinha

Não vou me [G:-1]importar

Vou ligar

Te chamar pra sair namorar no [C9:3]sofá

Nem que seja além dessa vida

Eu vou [G:-1>]estar

Te [C9:3]esperando

Te [G:-1>]esperando`;

const LABELS_RITMOS = [
    '[Ritmo Alternativo]',
    '[Ritmo Principal]',
    '[Ritmo Pré-refrão]'
]

const RITMOS = [
    'D--UXUD-----XUDU',
    'D--UXUD--UDUXUDU',
    'D-D-D-D-D-D-D-D-',
];

export const FullSongExample = {
    render: () => (
        <Section
            capo={3}
            //tuning={-2}
            bpm={72}
            chordTitleColor="#35aabb"
        >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Chords */}
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <ChordDisplay chord="G" shapeVariant={-1} />
                    <ChordDisplay chord="C9" shapeVariant={3} />
                    <ChordDisplay chord="Cm" shapeVariant={0} />
                </div>

                {/* Rhythm */}
                {RITMOS.map((r, i) => {
                    return (<>
                        <LyricsDisplay raw>{LABELS_RITMOS[i]}</LyricsDisplay>
                        <RhythmDisplay key={i} pattern={r} timeSignature={[4, 4]} />
                    </>
                    )
                })}

                {/* Lyrics */}
                {VERSOS_I.map((v, i) => (
                    <LyricsDisplay key={`v1-${i}`}>{v}</LyricsDisplay>
                ))}

                <LyricsDisplay>
                    {REFRAO_I}
                </LyricsDisplay>

                {VERSOS_I.map((v, i) => (
                    <LyricsDisplay key={`v2-${i}`}>{v}</LyricsDisplay>
                ))}

                <LyricsDisplay>
                    {REFRAO_FINAL}
                </LyricsDisplay>
            </div>
        </Section>
    ),
};
