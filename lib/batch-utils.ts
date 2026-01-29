// Batch Processing Utilities

export interface BatchItem {
    id: string;
    text: string;
    voiceId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    audioBlob?: Blob;
    error?: string;
    fileName?: string;
    metadata?: {
        speed?: number;
        pitch?: number;
        emotion?: string;
        emotionIntensity?: number;
    };
}

export interface BatchConfig {
    defaultVoiceId?: string;
    speed?: number;
    pitch?: number;
    emotion?: string;
    emotionIntensity?: number;
    fileNamePattern?: string; // e.g., "audio_{index}", "audio_{text_preview}"
}

export class BatchProcessor {
    private queue: BatchItem[] = [];
    private isProcessing: boolean = false;
    private currentIndex: number = 0;
    private onProgressCallback?: (current: number, total: number, item: BatchItem) => void;
    private onCompleteCallback?: (results: BatchItem[]) => void;

    public addItem(item: Omit<BatchItem, 'id' | 'status'>): void {
        this.queue.push({
            ...item,
            id: `batch-${Date.now()}-${Math.random()}`,
            status: 'pending'
        });
    }

    public addItems(items: Omit<BatchItem, 'id' | 'status'>[]): void {
        items.forEach(item => this.addItem(item));
    }

    public getQueue(): BatchItem[] {
        return [...this.queue];
    }

    public clearQueue(): void {
        this.queue = [];
        this.currentIndex = 0;
    }

    public removeItem(id: string): void {
        this.queue = this.queue.filter(item => item.id !== id);
    }

    public onProgress(callback: (current: number, total: number, item: BatchItem) => void): void {
        this.onProgressCallback = callback;
    }

    public onComplete(callback: (results: BatchItem[]) => void): void {
        this.onCompleteCallback = callback;
    }

    public async process(
        processor: (item: BatchItem) => Promise<Blob>
    ): Promise<BatchItem[]> {
        if (this.isProcessing) {
            throw new Error('Batch processing already in progress');
        }

        this.isProcessing = true;
        this.currentIndex = 0;

        for (let i = 0; i < this.queue.length; i++) {
            const item = this.queue[i];
            this.currentIndex = i;

            try {
                item.status = 'processing';
                item.progress = 0;
                this.onProgressCallback?.(i + 1, this.queue.length, item);

                const audioBlob = await processor(item);
                
                item.audioBlob = audioBlob;
                item.status = 'completed';
                item.progress = 100;
            } catch (error) {
                item.status = 'failed';
                item.error = (error as Error).message;
            }

            this.onProgressCallback?.(i + 1, this.queue.length, item);
        }

        this.isProcessing = false;
        this.onCompleteCallback?.(this.queue);
        return this.queue;
    }

    public isRunning(): boolean {
        return this.isProcessing;
    }

    public getProgress(): { current: number; total: number; percentage: number } {
        const total = this.queue.length;
        const current = this.currentIndex + 1;
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
        return { current, total, percentage };
    }
}

export class CSVParser {
    public parse(csvText: string): { text: string; voiceId?: string }[] {
        const lines = csvText.split('\n').filter(line => line.trim());
        const results: { text: string; voiceId?: string }[] = [];

        // Skip header if present
        const startIndex = lines[0].toLowerCase().includes('text') ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV parsing (handles basic cases)
            const parts = this.parseCSVLine(line);
            
            if (parts.length >= 1) {
                results.push({
                    text: parts[0],
                    voiceId: parts[1] || undefined
                });
            }
        }

        return results;
    }

    private parseCSVLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result.map(s => s.replace(/^"|"$/g, ''));
    }

    public validate(csvText: string): { valid: boolean; error?: string } {
        try {
            const parsed = this.parse(csvText);
            if (parsed.length === 0) {
                return { valid: false, error: 'No valid data found in CSV' };
            }
            return { valid: true };
        } catch (error) {
            return { valid: false, error: (error as Error).message };
        }
    }
}

export function generateBatchFileName(
    index: number,
    text: string,
    pattern: string = 'audio_{index}'
): string {
    const textPreview = text.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();

    return pattern
        .replace('{index}', String(index + 1).padStart(3, '0'))
        .replace('{text}', textPreview)
        .replace('{timestamp}', String(timestamp));
}

export async function downloadAllAsZip(items: BatchItem[], zipFileName: string = 'batch_audio.zip'): Promise<void> {
    // Note: For actual ZIP creation, you'd need a library like JSZip
    // This is a simplified version that downloads files individually
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.status === 'completed' && item.audioBlob) {
            const fileName = item.fileName || `audio_${i + 1}.wav`;
            const url = URL.createObjectURL(item.audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
}

export function exportBatchReport(items: BatchItem[]): string {
    const report: string[] = [];
    report.push('Batch Processing Report');
    report.push('='.repeat(50));
    report.push('');
    report.push(`Total Items: ${items.length}`);
    report.push(`Completed: ${items.filter(i => i.status === 'completed').length}`);
    report.push(`Failed: ${items.filter(i => i.status === 'failed').length}`);
    report.push(`Pending: ${items.filter(i => i.status === 'pending').length}`);
    report.push('');
    report.push('Item Details:');
    report.push('-'.repeat(50));

    items.forEach((item, index) => {
        report.push('');
        report.push(`${index + 1}. Status: ${item.status.toUpperCase()}`);
        report.push(`   Text: ${item.text.substring(0, 50)}${item.text.length > 50 ? '...' : ''}`);
        report.push(`   Voice ID: ${item.voiceId}`);
        if (item.fileName) {
            report.push(`   File: ${item.fileName}`);
        }
        if (item.error) {
            report.push(`   Error: ${item.error}`);
        }
    });

    return report.join('\n');
}

export const batchTemplates = [
    {
        name: 'Simple List',
        description: 'Basic text list',
        csv: `text,voiceId
Hello everyone!,sc-en-f-1
Welcome to our presentation,sc-en-m-1
Thank you for joining us,sc-en-f-2`
    },
    {
        name: 'Multilingual',
        description: 'Mixed Hindi and English',
        csv: `text,voiceId
Welcome to Voice Creator,sc-en-f-1
नमस्ते और स्वागत है,hi-f-1
Let's get started,sc-en-m-1
चलिए शुरू करते हैं,hi-m-1`
    },
    {
        name: 'Educational Series',
        description: 'Lesson content',
        csv: `text,voiceId
Lesson 1: Introduction to Science,sc-en-f-1
Lesson 2: Understanding Physics,sc-en-m-1
Lesson 3: Chemistry Basics,sc-en-f-2
Lesson 4: Biology Overview,sc-en-m-2`
    },
    {
        name: 'Announcements',
        description: 'Public announcements',
        csv: `text,voiceId
Attention please. The meeting will begin shortly.,sc-en-f-1
Please proceed to Conference Room A.,sc-en-m-1
Thank you for your cooperation.,sc-en-f-1`
    },
    {
        name: 'Story Chapters',
        description: 'Book chapters',
        csv: `text,voiceId
Chapter 1: The Beginning,st-en-m-1
Chapter 2: The Journey,st-en-m-1
Chapter 3: The Discovery,st-en-m-1
Chapter 4: The Conclusion,st-en-m-1`
    }
];
