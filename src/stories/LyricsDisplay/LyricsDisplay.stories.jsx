import React from 'react';
import { Section, LyricsDisplay } from '../../components/index.jsx';
import '../../styles.css';

export default {
    title: 'React/LyricsDisplay',
    decorators: [
        (Story) => (
            <div style={{ padding: '24px', backgroundColor: '#1a1a1a', minHeight: '200px' }}>
                <Story />
            </div>
        ),
    ],
};

export const LyricsDisplayBasic = {
    render: () => (
        <Section chordTitleColor="#35aabb">
            <LyricsDisplay>
                {`[A#<]Mesmo que você
Não caia na minha cantada
Mesmo que você conheça outro cara
Na [D#9<]fila de um banco
Um tal de Fernando
Um lance, assim, sem graça`}
            </LyricsDisplay>
        </Section>
    ),
};

export const LyricsDisplayAlignments = {
    render: () => (
        <Section chordTitleColor="#ff6b6b">
            <LyricsDisplay>
                {`[A#<]Mesmo que vocês fiquem sem se gostar
Mesmo que vocês casem sem se amar
E [D#9]depois de seis meses
Um olhe pro outro
E aí, pois é, sei lá`}
            </LyricsDisplay>
        </Section>
    ),
};
