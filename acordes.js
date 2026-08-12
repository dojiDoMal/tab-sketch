const acordes = {
    Am: [{
        metadata: { name: 'Am', variant: 0, strings: ['x', 'bass', 'open', 'open', 'open', 'open'] },
        shape: [
            { text: '1', casa: 1, corda: 'B' },
            { text: '2', casa: 2, corda: 'G' },
            { text: '3', casa: 2, corda: 'D' },
        ],
    }],
    Bm: [{
        metadata: { name: 'Bm', variant: 0, strings: ['x', 'bass', 'open', 'open', 'open', 'open'] },
        shape: [
            { type: 'bar', casa: 2, cordaFim: 'A', cordaInicio: 'e' },
            { text: '1', casa: 3, corda: 'B' },
            { text: '2', casa: 4, corda: 'G' },
            { text: '3', casa: 4, corda: 'D' },
        ],
    }],
    Em: [{
        metadata: { name: 'Em', variant: 0, strings: ['bass', 'open', 'open', 'open', 'open', 'open'] },
        shape: [
            { text: '1', casa: 2, corda: 'A' },
            { text: '2', casa: 2, corda: 'D' },
        ],
    }],
    E: [{
        metadata: { name: 'E', variant: 0, strings: ['bass', 'open', 'open', 'open', 'open', 'open'] },
        shape: [
            { text: '1', casa: 1, corda: 'G' },
            { text: '2', casa: 2, corda: 'A' },
            { text: '3', casa: 2, corda: 'D' },
        ],
    }],
    F: [{
        metadata: { name: 'F', variant: 0, strings: ['x', 'bass', 'open', 'open', 'open', 'open'] },
        shape: [
            { type: 'bar', casa: 1, cordaInicio: 'e', cordaFim: 'E' },
            { text: '1', casa: 2, corda: 'G' },
            { text: '2', casa: 3, corda: 'D' },
            { text: '3', casa: 3, corda: 'A' },
        ],
    }],
    A: [
        {
            metadata: { name: 'A', variant: 0, strings: ['x', 'bass', 'open', 'open', 'open', 'open'] },
            shape: [
                { text: '1', casa: 2, corda: 'D' },
                { text: '2', casa: 2, corda: 'G' },
                { text: '3', casa: 2, corda: 'B' },
            ],
        },
        {
            metadata: { name: 'A', variant: 1, strings: ['x', 'bass', 'open', 'open', 'open', 'open'] },
            shape: [
                { type: 'bar', casa: 2, cordaInicio: 'B', cordaFim: 'D' },
            ],
        },
    ],
    D: [{
        metadata: { name: 'D', variant: 0, strings: ['x', 'x', 'bass', 'open', 'open', 'open'] },
        shape: [
            { text: '1', casa: 2, corda: 'G' },
            { text: '2', casa: 2, corda: 'e' },
            { text: '3', casa: 3, corda: 'B' },
        ],
    }],
    'D#': [{
        metadata: { name: 'D#', variant: 0, strings: ['x', 'x', 'bass', 'open', 'open', 'open'] },
        shape: [
            { type: 'bar', casa: 1, cordaFim: 'D', cordaInicio: 'e' },
            { text: '3', casa: 3, corda: 'e' },
            { text: '4', casa: 4, corda: 'B' },
            { text: '2', casa: 3, corda: 'G' },
        ],
    }],
    Dm: [{
        metadata: { name: 'Dm', variant: 0, strings: ['x', 'x', 'bass', 'open', 'open', 'open'] },
        shape: [
            { text: '1', casa: 1, corda: 'e' },
            { text: '2', casa: 2, corda: 'G' },
            { text: '3', casa: 3, corda: 'B' },
        ],
    }],
    G: [{
        metadata: { name: 'G', variant: 0, strings: ['bass', 'open', 'open', 'open', 'open', 'open'] },
        shape: [
            { text: '1', casa: 2, corda: 'A' },
            { text: '2', casa: 3, corda: 'E' },
            { text: '3', casa: 3, corda: 'e' },
        ],
    }],
    C: [{
        metadata: { name: 'C', variant: 0, strings: ['x', 'bass', 'open', 'open', 'open', 'open'] },
        shape: [
            { text: '1', casa: 1, corda: 'B' },
            { text: '2', casa: 2, corda: 'D' },
            { text: '3', casa: 3, corda: 'A' },
        ],
    }],
};
