// SSML (Speech Synthesis Markup Language) Utilities

export interface SSMLElement {
    type: 'speak' | 'prosody' | 'break' | 'emphasis' | 'say-as' | 'phoneme' | 'sub' | 'voice' | 'text';
    attributes?: Record<string, string>;
    content?: string | SSMLElement[];
}

export interface SSMLTag {
    name: string;
    description: string;
    attributes: {
        name: string;
        description: string;
        type: 'select' | 'number' | 'text';
        options?: string[];
        min?: number;
        max?: number;
        default?: string;
    }[];
    example: string;
}

export const ssmlTags: SSMLTag[] = [
    {
        name: 'prosody',
        description: 'Modify pitch, rate, and volume',
        attributes: [
            {
                name: 'rate',
                description: 'Speaking rate',
                type: 'select',
                options: ['x-slow', 'slow', 'medium', 'fast', 'x-fast'],
                default: 'medium'
            },
            {
                name: 'pitch',
                description: 'Voice pitch',
                type: 'select',
                options: ['x-low', 'low', 'medium', 'high', 'x-high'],
                default: 'medium'
            },
            {
                name: 'volume',
                description: 'Speaking volume',
                type: 'select',
                options: ['silent', 'x-soft', 'soft', 'medium', 'loud', 'x-loud'],
                default: 'medium'
            }
        ],
        example: '<prosody rate="slow" pitch="high">This is spoken slowly with high pitch</prosody>'
    },
    {
        name: 'break',
        description: 'Insert pause',
        attributes: [
            {
                name: 'time',
                description: 'Pause duration (ms or s)',
                type: 'text',
                default: '500ms'
            },
            {
                name: 'strength',
                description: 'Pause strength',
                type: 'select',
                options: ['none', 'x-weak', 'weak', 'medium', 'strong', 'x-strong']
            }
        ],
        example: '<break time="500ms"/> or <break strength="strong"/>'
    },
    {
        name: 'emphasis',
        description: 'Add emphasis to words',
        attributes: [
            {
                name: 'level',
                description: 'Emphasis level',
                type: 'select',
                options: ['none', 'reduced', 'moderate', 'strong'],
                default: 'moderate'
            }
        ],
        example: '<emphasis level="strong">This is important!</emphasis>'
    },
    {
        name: 'say-as',
        description: 'Control how text is spoken',
        attributes: [
            {
                name: 'interpret-as',
                description: 'Interpretation type',
                type: 'select',
                options: ['cardinal', 'ordinal', 'digits', 'fraction', 'unit', 'date', 'time', 'telephone', 'address'],
                default: 'cardinal'
            },
            {
                name: 'format',
                description: 'Format (for date/time)',
                type: 'text'
            }
        ],
        example: '<say-as interpret-as="date" format="mdy">12/31/2025</say-as>'
    },
    {
        name: 'sub',
        description: 'Substitute pronunciation',
        attributes: [
            {
                name: 'alias',
                description: 'Pronunciation text',
                type: 'text'
            }
        ],
        example: '<sub alias="World Wide Web Consortium">W3C</sub>'
    },
    {
        name: 'phoneme',
        description: 'Phonetic pronunciation',
        attributes: [
            {
                name: 'alphabet',
                description: 'Phonetic alphabet',
                type: 'select',
                options: ['ipa', 'x-sampa'],
                default: 'ipa'
            },
            {
                name: 'ph',
                description: 'Phonetic string',
                type: 'text'
            }
        ],
        example: '<phoneme alphabet="ipa" ph="təˈmeɪtoʊ">tomato</phoneme>'
    }
];

export const ssmlTemplates = [
    {
        name: 'Simple Text',
        description: 'Basic SSML with text',
        code: `<speak>
  Hello! This is a simple text-to-speech example.
</speak>`
    },
    {
        name: 'Speed & Pitch Control',
        description: 'Adjust speaking speed and pitch',
        code: `<speak>
  <prosody rate="slow" pitch="low">
    This is spoken slowly with low pitch.
  </prosody>
  <break time="500ms"/>
  <prosody rate="fast" pitch="high">
    This is spoken quickly with high pitch!
  </prosody>
</speak>`
    },
    {
        name: 'Emphasis & Breaks',
        description: 'Add emphasis and pauses',
        code: `<speak>
  This is <emphasis level="strong">very important</emphasis> information.
  <break time="1s"/>
  Please pay attention to <emphasis level="moderate">these details</emphasis>.
</speak>`
    },
    {
        name: 'Numbers & Dates',
        description: 'Format numbers and dates',
        code: `<speak>
  The year <say-as interpret-as="date" format="y">2025</say-as> is here!
  <break time="500ms"/>
  Call us at <say-as interpret-as="telephone">1-800-555-0123</say-as>.
  <break time="500ms"/>
  The total is <say-as interpret-as="cardinal">12345</say-as> dollars.
</speak>`
    },
    {
        name: 'Volume Variation',
        description: 'Control volume levels',
        code: `<speak>
  <prosody volume="soft">This is whispered softly.</prosody>
  <break time="500ms"/>
  <prosody volume="medium">This is normal volume.</prosody>
  <break time="500ms"/>
  <prosody volume="loud">This is loud and clear!</prosody>
</speak>`
    },
    {
        name: 'Complex Narrative',
        description: 'Story with multiple effects',
        code: `<speak>
  <prosody rate="slow" pitch="low">
    Once upon a time, in a faraway land...
  </prosody>
  <break time="1s"/>
  <prosody rate="medium" volume="medium">
    There lived a <emphasis level="strong">brave knight</emphasis> who sought adventure.
  </prosody>
  <break time="800ms"/>
  <prosody rate="fast" pitch="high" volume="loud">
    "I shall find the dragon!" he exclaimed with excitement!
  </prosody>
</speak>`
    },
    {
        name: 'Announcement',
        description: 'Professional announcement style',
        code: `<speak>
  <prosody rate="medium" pitch="medium">
    Attention please.
    <break time="500ms"/>
    The meeting will begin in <say-as interpret-as="cardinal">5</say-as> minutes.
    <break time="800ms"/>
    Please proceed to <emphasis level="strong">Conference Room A</emphasis>.
    <break time="500ms"/>
    Thank you.
  </prosody>
</speak>`
    },
    {
        name: 'Educational Content',
        description: 'Clear explanation with pauses',
        code: `<speak>
  <prosody rate="slow">
    Today we will learn about <emphasis level="moderate">photosynthesis</emphasis>.
    <break time="1s"/>
    Plants use <emphasis level="strong">sunlight</emphasis>,
    <break time="300ms"/>
    <emphasis level="strong">water</emphasis>,
    <break time="300ms"/>
    and <emphasis level="strong">carbon dioxide</emphasis>
    <break time="500ms"/>
    to create energy.
  </prosody>
</speak>`
    }
];

export class SSMLParser {
    public parse(ssml: string): SSMLElement {
        const parser = new DOMParser();
        const doc = parser.parseFromString(ssml, 'text/xml');
        
        const errorNode = doc.querySelector('parsererror');
        if (errorNode) {
            throw new Error('Invalid SSML: ' + errorNode.textContent);
        }
        
        const speakElement = doc.querySelector('speak');
        if (!speakElement) {
            throw new Error('SSML must contain <speak> root element');
        }
        
        return this.parseNode(speakElement);
    }
    
    private parseNode(node: Element): SSMLElement {
        const element: SSMLElement = {
            type: node.nodeName.toLowerCase() as any,
            attributes: {}
        };
        
        // Parse attributes
        for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            element.attributes![attr.name] = attr.value;
        }
        
        // Parse children
        const children: (string | SSMLElement)[] = [];
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent?.trim();
                if (text) children.push(text);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                children.push(this.parseNode(child as Element));
            }
        }
        
        if (children.length === 1 && typeof children[0] === 'string') {
            element.content = children[0];
        } else if (children.length > 0) {
            element.content = children as SSMLElement[];
        }
        
        return element;
    }
    
    public validate(ssml: string): { valid: boolean; error?: string } {
        try {
            this.parse(ssml);
            return { valid: true };
        } catch (error) {
            return { valid: false, error: (error as Error).message };
        }
    }
}

export class SSMLBuilder {
    private elements: string[] = [];
    
    public speak(content: string | (() => void)): this {
        if (typeof content === 'function') {
            this.elements.push('<speak>');
            content();
            this.elements.push('</speak>');
        } else {
            this.elements.push(`<speak>${content}</speak>`);
        }
        return this;
    }
    
    public prosody(attributes: { rate?: string; pitch?: string; volume?: string }, content: string): this {
        const attrs = Object.entries(attributes)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
        this.elements.push(`<prosody ${attrs}>${content}</prosody>`);
        return this;
    }
    
    public break(time?: string, strength?: string): this {
        if (time) {
            this.elements.push(`<break time="${time}"/>`);
        } else if (strength) {
            this.elements.push(`<break strength="${strength}"/>`);
        } else {
            this.elements.push('<break/>');
        }
        return this;
    }
    
    public emphasis(level: string, content: string): this {
        this.elements.push(`<emphasis level="${level}">${content}</emphasis>`);
        return this;
    }
    
    public sayAs(interpretAs: string, content: string, format?: string): this {
        const formatAttr = format ? ` format="${format}"` : '';
        this.elements.push(`<say-as interpret-as="${interpretAs}"${formatAttr}>${content}</say-as>`);
        return this;
    }
    
    public sub(alias: string, content: string): this {
        this.elements.push(`<sub alias="${alias}">${content}</sub>`);
        return this;
    }
    
    public text(content: string): this {
        this.elements.push(content);
        return this;
    }
    
    public build(): string {
        return this.elements.join('\n');
    }
    
    public clear(): this {
        this.elements = [];
        return this;
    }
}

export function convertTextToSSML(text: string, options?: {
    rate?: string;
    pitch?: string;
    volume?: string;
}): string {
    const builder = new SSMLBuilder();
    
    if (options) {
        return `<speak>\n  <prosody ${Object.entries(options).map(([k, v]) => `${k}="${v}"`).join(' ')}>\n    ${text}\n  </prosody>\n</speak>`;
    }
    
    return `<speak>\n  ${text}\n</speak>`;
}

export function highlightSSML(ssml: string): string {
    return ssml
        .replace(/(&lt;[^&]+&gt;)/g, '<span class="text-purple-400">$1</span>')
        .replace(/(&quot;[^&]+&quot;)/g, '<span class="text-green-400">$1</span>');
}

export function formatSSML(ssml: string): string {
    let formatted = ssml;
    let indent = 0;
    const lines: string[] = [];
    
    const tokens = ssml.match(/<[^>]+>|[^<>]+/g) || [];
    
    for (const token of tokens) {
        if (token.startsWith('</')) {
            indent--;
            lines.push('  '.repeat(Math.max(0, indent)) + token.trim());
        } else if (token.startsWith('<') && token.endsWith('/>')) {
            lines.push('  '.repeat(indent) + token.trim());
        } else if (token.startsWith('<')) {
            lines.push('  '.repeat(indent) + token.trim());
            if (!token.includes('</')) indent++;
        } else {
            const text = token.trim();
            if (text) lines.push('  '.repeat(indent) + text);
        }
    }
    
    return lines.join('\n');
}
