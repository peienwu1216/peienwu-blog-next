import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsJsonPath = path.join(__dirname, '../.contentlayer/generated/Post/_index.json');
const allPosts = JSON.parse(fs.readFileSync(postsJsonPath, 'utf-8'));

function build() {
    try {
        console.log('Rebuilding search data...');
        const allPosts = JSON.parse(fs.readFileSync(postsJsonPath, 'utf-8'));
        const docs = allPosts.map((post, idx) => ({
            id: idx,
            title: post.title,
            date: post.date,
            plainText: post.plainText,
            codeText: post.codeText,
            mathText: post.mathText,
            category: post.category || '',
            tags: (post.tags || []).join(' '),
            url: post.url,
            slug: post.slug,
        }));
        
        const outputPath = path.join(process.cwd(), 'public', 'search-data.json');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(docs));
        console.log('✅ Search data generated at', outputPath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // This can happen if Contentlayer is rebuilding and the file is temporarily unavailable.
            // We'll just ignore it and wait for the next change event.
            console.log('Temporarily unable to read post data, will retry on next change...');
        } else {
            console.error('Error rebuilding search index:', err);
        }
    }
}

build();

if (process.argv.includes('--watch')) {
    console.log('👀 Watching for changes in posts...');
    let debounceTimer;
    fs.watch(path.dirname(postsJsonPath), { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('_index.json')) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                console.log(`\nFile change detected. Rebuilding search index...`);
                build();
            }, 100); // 100ms debounce
        }
    });
} 